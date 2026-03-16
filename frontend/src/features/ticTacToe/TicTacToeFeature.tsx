import { useEffect, useState } from "react";
import "./styles.css";
import HintMessage from "./components/HintMessage";
import TreeBody from "./components/TreeBody";
import TreeControls from "./components/TreeControls";
import TreeHeader from "./components/TreeHeader";
import { EMPTY, EMPTY_BOARD, configureGameConstants } from "./constants/gameConstants";
import { useCompactTreeLayout } from "./hooks/useCompactTreeLayout";
import { LookupStrategyService } from "./logic/LookupStrategyService";
import { applyMove, getCurrentPlayer, getLastMoveBySymbol, getLegalMoves, getOpponent, getWinner, pickRandomMove } from "./logic/boardLogic";
import { getStatusLabel, getStatusTone } from "./logic/statusUtils";
import type { BoardState, PlayerSymbol, Starter } from "./types";

function TicTacToeFeature() {
  const [lookupService, setLookupService] = useState<LookupStrategyService | null>(null);
  const [lookupLoadError, setLookupLoadError] = useState<string | null>(null);
  const [history, setHistory] = useState<BoardState[]>([EMPTY_BOARD]);
  const [starter, setStarter] = useState<Starter>("player");
  const [gameStarted, setGameStarted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [selectedMoveByCanonical, setSelectedMoveByCanonical] = useState<Record<string, number>>({});
  const isCompactLayout = useCompactTreeLayout();

  const board = history[history.length - 1] ?? EMPTY_BOARD;
  const winner = getWinner(board);
  const draw = !winner && !board.includes(EMPTY);
  const terminal = winner !== null || draw;
  const turn = getCurrentPlayer(board);
  const playerSymbol: PlayerSymbol = starter === "player" ? "X" : "O";
  const aiSymbol = getOpponent(playerSymbol);
  const playerTurn = turn === playerSymbol;
  const canPlayerMove = gameStarted && !terminal && playerTurn;
  const legalMoves = canPlayerMove ? getLegalMoves(board) : [];
  const lastAiMoveIndex = gameStarted ? getLastMoveBySymbol(history, aiSymbol) : null;
  const highlightedAiIndices = lastAiMoveIndex === null ? null : new Set([lastAiMoveIndex]);

  const recommendedMove = !lookupService || !gameStarted || terminal ? null : lookupService.getLookupBestMove(board, turn);
  const allOptions = !lookupService || !gameStarted || terminal ? [] : lookupService.getAllMoveOptions(board, turn, recommendedMove);
  const groupedOptions = !lookupService || !gameStarted || terminal ? [] : lookupService.groupMoveOptionsByCanonical(allOptions);
  const classCount = Math.max(1, groupedOptions.length);
  const childColumnWidth = Math.max(104, Math.min(220, Math.floor(940 / classCount)));
  const childBoardSize = Math.max(40, Math.min(108, childColumnWidth - 18));
  const statusLabel = getStatusLabel(gameStarted, winner, draw, turn, playerTurn);
  const statusTone = getStatusTone(gameStarted, winner, draw, playerTurn);
  const hasHintStates = showHints && !terminal && groupedOptions.length > 0;

  useEffect(() => {
    try {
      const configuredLookup = configureGameConstants();
      setLookupService(new LookupStrategyService(configuredLookup));
      setLookupLoadError(null);
    } catch (error) {
      setLookupLoadError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    setSelectedMoveByCanonical({});
  }, [board, turn, gameStarted, showHints]);

  useEffect(() => {
    if (!lookupService || !gameStarted || terminal || playerTurn) {
      return;
    }

    const aiMove = starter === "ai" && board === EMPTY_BOARD ? pickRandomMove(board) : recommendedMove;
    if (aiMove === null || board[aiMove] !== EMPTY) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHistory((previous) => [...previous, applyMove(board, aiMove, aiSymbol)]);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [aiSymbol, board, gameStarted, lookupService, playerTurn, recommendedMove, starter, terminal]);

  function onPick(nextBoard: BoardState) {
    setHistory((previous) => [...previous, nextBoard]);
  }

  function onPickCell(index: number) {
    if (!canPlayerMove || board[index] !== EMPTY) {
      return;
    }

    onPick(applyMove(board, index, playerSymbol));
  }

  function startGame(nextStarter: Starter) {
    setStarter(nextStarter);
    setShowHints(false);
    setHistory([EMPTY_BOARD]);
    setGameStarted(true);
  }

  function onTryAgain() {
    setShowHints(false);
    setHistory([EMPTY_BOARD]);
    setGameStarted(true);
  }

  function onSnapIndexChange(canonical: string, nextIndex: number) {
    setSelectedMoveByCanonical((previous) => ({
      ...previous,
      [canonical]: nextIndex,
    }));
  }

  return (
    <div className="ttt-feature">
      <div className="page">
        <header className="ttt-feature-hero">
          <div className="ttt-feature-hero-row">
            <div className="ttt-feature-hero-copy">
              <p className="ttt-feature-hero-kicker">Feature Page</p>
              <h1 className="ttt-feature-hero-title">Tic-Tac-Toe</h1>
              <p className="ttt-feature-hero-description">
                Play against the lookup-backed AI and inspect symmetry-equivalent move groups from the minimax lookup.
              </p>
            </div>
          </div>
        </header>

        <section className="panel tree-panel">
          {lookupLoadError ? (
            <p className="terminal-note">Failed to load lookup data: {lookupLoadError}</p>
          ) : !lookupService ? (
            <p className="terminal-note">Loading lookup data...</p>
          ) : (
            <>
              <TreeHeader
                gameStarted={gameStarted}
                terminal={terminal}
                showHints={showHints}
                optionCount={allOptions.length}
                stateCount={groupedOptions.length}
              />

              <TreeControls
                starter={starter}
                statusLabel={statusLabel}
                statusTone={statusTone}
                showHints={showHints}
                gameStarted={gameStarted}
                onStartGame={startGame}
                onToggleHints={() => setShowHints((previous) => !previous)}
              />

              <HintMessage
                gameStarted={gameStarted}
                terminal={terminal}
                showHints={showHints}
                playerTurn={playerTurn}
              />

              <TreeBody
                gameStarted={gameStarted}
                terminal={terminal}
                board={board}
                onPickCell={onPickCell}
                legalMoves={legalMoves}
                highlightedAiIndices={highlightedAiIndices}
                onTryAgain={onTryAgain}
                hasHintStates={hasHintStates}
                isCompactLayout={isCompactLayout}
                groupedOptions={groupedOptions}
                classCount={classCount}
                childColumnWidth={childColumnWidth}
                childBoardSize={childBoardSize}
                canSelect={canPlayerMove}
                selectedMoveByCanonical={selectedMoveByCanonical}
                onSelectMove={onPick}
                onSnapIndexChange={onSnapIndexChange}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default TicTacToeFeature;
