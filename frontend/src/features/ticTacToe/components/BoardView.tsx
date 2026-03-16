import type { PlayerSymbol } from "../types";
import type { BoardState } from "../types";

type CellMarkerProps = {
  marker: PlayerSymbol | "";
};

type BoardViewProps = {
  board: BoardState;
  large?: boolean;
  onCellClick?: ((index: number) => void) | null;
  playableIndices?: Set<number> | null;
  highlightedIndices?: Set<number> | null;
  nextMoveIndices?: Set<number> | null;
  showOrientation?: boolean;
  showCellIndices?: boolean;
};

function CellMarker({ marker }: CellMarkerProps) {
  if (marker === "X") {
    return (
      <span className="cell-marker" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="cell-marker-svg">
          <path d="M6 6 L18 18" />
          <path d="M18 6 L6 18" />
        </svg>
      </span>
    );
  }

  if (marker === "O") {
    return (
      <span className="cell-marker" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="cell-marker-svg">
          <circle cx="12" cy="12" r="7.25" />
        </svg>
      </span>
    );
  }

  return null;
}

function BoardView({
  board,
  large = false,
  onCellClick = null,
  playableIndices = null,
  highlightedIndices = null,
  nextMoveIndices = null,
  showOrientation = false,
  showCellIndices = true,
}: BoardViewProps) {
  return (
    <div className={`board-shell ${showOrientation ? "board-shell-guided" : ""}`}>
      {showOrientation && (
        <>
          <span className="board-guide board-guide-top" aria-hidden="true" />
          <span className="board-guide board-guide-right" aria-hidden="true" />
          <span className="board-guide board-guide-bottom" aria-hidden="true" />
          <span className="board-guide board-guide-left" aria-hidden="true" />
          <span className="board-corner board-corner-tl" aria-hidden="true" />
          <span className="board-corner board-corner-tr" aria-hidden="true" />
          <span className="board-corner board-corner-br" aria-hidden="true" />
          <span className="board-corner board-corner-bl" aria-hidden="true" />
        </>
      )}

      <div className={`board ${large ? "board-large" : ""}`}>
        {board.split("").map((cell, index) => {
          const marker: PlayerSymbol | "" = cell === "X" || cell === "O" ? cell : "";
          const isEmpty = marker === "";
          const isPlayable = playableIndices?.has(index) ?? false;

          return (
            <button
              key={index}
              type="button"
              className={`cell ${isEmpty ? "cell-empty" : `cell-${marker}`} ${isPlayable ? "cell-playable" : ""} ${
                highlightedIndices?.has(index) ? "cell-ai-last" : ""
              } ${nextMoveIndices?.has(index) ? "cell-next-move" : ""}`}
              onClick={() => onCellClick?.(index)}
              disabled={!onCellClick || !isPlayable}
              aria-label={`Cell ${index}`}
            >
              {isEmpty && showCellIndices ? (
                <span className="cell-index">{index}</span>
              ) : (
                <CellMarker marker={isEmpty ? "" : marker} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BoardView;
