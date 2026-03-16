import type { CSSProperties } from "react";
import type { BoardState, MoveGroup } from "../types";
import BoardView from "./BoardView";
import StateGroupCard from "./StateGroupCard";
import TreeLinks from "./TreeLinks";

type TreeBodyProps = {
  gameStarted: boolean;
  terminal: boolean;
  board: BoardState;
  onPickCell: (index: number) => void;
  legalMoves: number[];
  highlightedAiIndices: Set<number> | null;
  onTryAgain: () => void;
  hasHintStates: boolean;
  isCompactLayout: boolean;
  groupedOptions: MoveGroup[];
  classCount: number;
  childColumnWidth: number;
  childBoardSize: number;
  canSelect: boolean;
  selectedMoveByCanonical: Record<string, number>;
  onSelectMove: (nextBoard: BoardState) => void;
  onSnapIndexChange: (canonical: string, nextIndex: number) => void;
};

function TreeBody({
  gameStarted,
  terminal,
  board,
  onPickCell,
  legalMoves,
  highlightedAiIndices,
  onTryAgain,
  hasHintStates,
  isCompactLayout,
  groupedOptions,
  classCount,
  childColumnWidth,
  childBoardSize,
  canSelect,
  selectedMoveByCanonical,
  onSelectMove,
  onSnapIndexChange,
}: TreeBodyProps) {
  if (!gameStarted) {
    return <p className="terminal-note">No active game.</p>;
  }

  const stageStyle = {
    ["--class-count" as const]: String(classCount),
    ["--child-column-width" as const]: `${childColumnWidth}px`,
    ["--child-board-size" as const]: `${childBoardSize}px`,
  } as CSSProperties;

  return (
    <div className="tree-scroll">
      <div className="tree-stage" style={stageStyle}>
        <article className="tree-root-node">
          <span className="tree-label">{terminal ? "Final" : "Now"}</span>
          <BoardView board={board} large onCellClick={onPickCell} playableIndices={new Set(legalMoves)} highlightedIndices={highlightedAiIndices} />
          {terminal && (
            <button type="button" className="retry-button" onClick={onTryAgain}>
              Try Again
            </button>
          )}
        </article>

        {hasHintStates && !isCompactLayout && (
          <>
            <TreeLinks classCount={groupedOptions.length} />
            <div
              className="canonical-columns tree-children"
              style={{ gridTemplateColumns: `repeat(${classCount}, minmax(0, var(--child-column-width)))` }}
            >
              {groupedOptions.map((group, groupIndex) => (
                <StateGroupCard
                  key={group.canonical}
                  group={group}
                  groupIndex={groupIndex}
                  canSelect={canSelect}
                  selectedMoveIndex={selectedMoveByCanonical[group.canonical]}
                  onSelectMove={onSelectMove}
                  onSnapIndexChange={(nextIndex) => onSnapIndexChange(group.canonical, nextIndex)}
                />
              ))}
            </div>
          </>
        )}

        {hasHintStates && isCompactLayout && (
          <div className="canonical-columns tree-children canonical-columns-compact" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
            {groupedOptions.map((group, groupIndex) => (
              <StateGroupCard
                key={group.canonical}
                group={group}
                groupIndex={groupIndex}
                canSelect={canSelect}
                selectedMoveIndex={selectedMoveByCanonical[group.canonical]}
                onSelectMove={onSelectMove}
                onSnapIndexChange={(nextIndex) => onSnapIndexChange(group.canonical, nextIndex)}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TreeBody;
