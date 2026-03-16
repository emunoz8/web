import { EMPTY, LOOKUP_TABLE, MOVE_TIER_BEST, MOVE_TIER_OPTION, MOVE_TIER_WORSE } from "../constants/gameConstants";
import type { BoardState, LookupPlayerMoves, MoveGroup, MoveOption, MoveTier, PlayerSymbol } from "../types";
import { applyMove, getCurrentPlayer, getOpponent, getWinner } from "./boardLogic";
import { canonicalize, canonicalizeWithMap } from "./symmetryUtils";

type LookupTable = Record<BoardState, LookupPlayerMoves>;

export class LookupStrategyService {
  constructor(private readonly lookupTable: LookupTable = LOOKUP_TABLE) {}

  getLookupBestMove(board: BoardState, player: PlayerSymbol): number | null {
    const { canonical, map } = canonicalizeWithMap(board);
    const stateMoves = this.lookupTable[canonical];
    if (!stateMoves) {
      return null;
    }

    const canonicalMove = stateMoves[player];
    if (typeof canonicalMove !== "number") {
      return null;
    }

    const boardMove = map[canonicalMove];
    return typeof boardMove === "number" ? boardMove : null;
  }

  getAllMoveOptions(board: BoardState, player: PlayerSymbol, recommendedMove: number | null = this.getLookupBestMove(board, player)): MoveOption[] {
    const options: MoveOption[] = [];

    for (let index = 0; index < board.length; index += 1) {
      if (board[index] !== EMPTY) {
        continue;
      }

      const nextBoard = applyMove(board, index, player);
      const outcome = this.evaluateLookupOutcome(nextBoard, player);
      const tier: MoveTier =
        index === recommendedMove ? MOVE_TIER_BEST : outcome < 0 ? MOVE_TIER_WORSE : MOVE_TIER_OPTION;

      options.push({
        move: index,
        nextBoard,
        canonical: canonicalize(nextBoard),
        score: tier,
      });
    }

    return options.sort(LookupStrategyService.sortMoveOptions);
  }

  groupMoveOptionsByCanonical(options: MoveOption[]): MoveGroup[] {
    const grouped = new Map<string, MoveGroup>();

    for (const option of options) {
      const found = grouped.get(option.canonical);
      if (!found) {
        grouped.set(option.canonical, {
          canonical: option.canonical,
          bestScore: option.score,
          moves: [option],
        });
        continue;
      }

      found.moves.push(option);
      if (option.score > found.bestScore) {
        found.bestScore = option.score;
      }
    }

    const columns = [...grouped.values()];
    for (const group of columns) {
      group.moves.sort(LookupStrategyService.sortMoveOptions);
    }

    columns.sort((a, b) => {
      if (b.bestScore !== a.bestScore) {
        return b.bestScore - a.bestScore;
      }

      return a.moves[0]!.move - b.moves[0]!.move;
    });

    return columns;
  }

  evaluateLookupOutcome(board: BoardState, perspectivePlayer: PlayerSymbol): -1 | 0 | 1 {
    let currentBoard = board;

    // Tic-Tac-Toe is bounded to 9 plies; this also protects against malformed loops.
    for (let step = 0; step < 9; step += 1) {
      const winner = getWinner(currentBoard);
      if (winner === perspectivePlayer) {
        return 1;
      }
      if (winner === getOpponent(perspectivePlayer)) {
        return -1;
      }
      if (!currentBoard.includes(EMPTY)) {
        return 0;
      }

      const turn = getCurrentPlayer(currentBoard);
      const move = this.getLookupBestMove(currentBoard, turn);
      if (move === null || currentBoard[move] !== EMPTY) {
        return 0;
      }

      currentBoard = applyMove(currentBoard, move, turn);
    }

    return 0;
  }

  static sortMoveOptions(a: MoveOption, b: MoveOption): number {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.move - b.move;
  }
}
