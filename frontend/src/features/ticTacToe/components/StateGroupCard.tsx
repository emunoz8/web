import { scoreClass, scoreLabel } from "../logic/statusUtils";
import { clampIndex, orderMovesByTransform } from "../logic/symmetryUtils";
import type { BoardState, MoveGroup } from "../types";
import StateCyclePreview from "./StateCyclePreview";

type StateGroupCardProps = {
  group: MoveGroup;
  groupIndex: number;
  canSelect: boolean;
  selectedMoveIndex?: number;
  onSelectMove: (nextBoard: BoardState) => void;
  onSnapIndexChange: (nextIndex: number) => void;
  compact?: boolean;
};

function StateGroupCard({
  group,
  groupIndex,
  canSelect,
  selectedMoveIndex,
  onSelectMove,
  onSnapIndexChange,
  compact = false,
}: StateGroupCardProps) {
  const orderedMoves = orderMovesByTransform(group.moves);
  const selectedIndex = clampIndex(selectedMoveIndex ?? 0, orderedMoves.length);
  const selectedOption = orderedMoves[selectedIndex];

  if (!selectedOption) {
    return null;
  }

  return (
    <article
      className={`canonical-column ${compact ? "canonical-column-single" : ""} ${
        canSelect ? "canonical-column-clickable" : "canonical-column-disabled"
      }`}
      role={canSelect ? "button" : undefined}
      tabIndex={canSelect ? 0 : -1}
      onClick={() => {
        if (canSelect) {
          onSelectMove(selectedOption.nextBoard);
        }
      }}
      onKeyDown={(event) => {
        if (!canSelect) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectMove(selectedOption.nextBoard);
        }
      }}
      aria-label={canSelect ? `Apply move ${selectedOption.move}` : undefined}
    >
      <header className="canonical-header">
        <strong>State {groupIndex + 1}</strong>
        <span>[{orderedMoves.map((move) => move.move).join(", ")}]</span>
        <span className={`score score-${scoreClass(group.bestScore)}`}>{scoreLabel(group.bestScore)}</span>
      </header>

      <div className="column-list">
        <StateCyclePreview
          moves={orderedMoves}
          interactive={canSelect}
          snapIndex={selectedIndex}
          onSnapIndexChange={onSnapIndexChange}
        />
      </div>
    </article>
  );
}

export default StateGroupCard;
