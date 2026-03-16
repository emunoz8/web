import type { Starter, StatusTone } from "../types";

type TreeControlsProps = {
  starter: Starter;
  statusLabel: string;
  statusTone: StatusTone;
  showHints: boolean;
  gameStarted: boolean;
  onStartGame: (starter: Starter) => void;
  onToggleHints: () => void;
};

function TreeControls({
  starter,
  statusLabel,
  statusTone,
  showHints,
  gameStarted,
  onStartGame,
  onToggleHints,
}: TreeControlsProps) {
  return (
    <div className="tree-controls">
      <p className={`status status-${statusTone}`}>{statusLabel}</p>

      <div className="tree-controls-actions">
        <button
          type="button"
          className={`control-button ${starter === "player" ? "control-button-selected" : ""}`}
          onClick={() => onStartGame("player")}
        >
          Player Start
        </button>
        <button
          type="button"
          className={`control-button ${starter === "ai" ? "control-button-selected" : ""}`}
          onClick={() => onStartGame("ai")}
        >
          AI Start
        </button>
        <button
          type="button"
          className={`control-button ${showHints ? "control-button-selected" : ""}`}
          onClick={onToggleHints}
          disabled={!gameStarted}
        >
          Show Hint
        </button>
      </div>
    </div>
  );
}

export default TreeControls;
