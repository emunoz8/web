import { EMPTY, WIN_LINES } from "../constants/gameConstants";
import type { BoardState, PlayerSymbol } from "../types";

export function getCurrentPlayer(board: BoardState): PlayerSymbol {
  const xCount = board.split("").filter((cell) => cell === "X").length;
  const oCount = board.split("").filter((cell) => cell === "O").length;
  return xCount <= oCount ? "X" : "O";
}

export function getWinner(board: BoardState): PlayerSymbol | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] !== EMPTY && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as PlayerSymbol;
    }
  }

  return null;
}

export function getOpponent(player: PlayerSymbol): PlayerSymbol {
  return player === "X" ? "O" : "X";
}

export function applyMove(board: BoardState, index: number, player: PlayerSymbol): BoardState {
  return `${board.slice(0, index)}${player}${board.slice(index + 1)}`;
}

export function getLegalMoves(board: BoardState): number[] {
  const moves: number[] = [];

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] === EMPTY) {
      moves.push(index);
    }
  }

  return moves;
}

export function pickRandomMove(board: BoardState): number | null {
  const legalMoves = getLegalMoves(board);
  if (legalMoves.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * legalMoves.length);
  return legalMoves[randomIndex];
}

export function getLastMoveBySymbol(history: BoardState[], symbol: PlayerSymbol): number | null {
  for (let historyIndex = history.length - 1; historyIndex > 0; historyIndex -= 1) {
    const previous = history[historyIndex - 1];
    const current = history[historyIndex];
    if (!previous || !current) {
      continue;
    }

    for (let cellIndex = 0; cellIndex < current.length; cellIndex += 1) {
      if (previous[cellIndex] !== current[cellIndex] && current[cellIndex] === symbol) {
        return cellIndex;
      }
    }
  }

  return null;
}
