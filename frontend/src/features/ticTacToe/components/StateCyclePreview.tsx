import { type ChangeEvent, useEffect, useState } from "react";
import { EMPTY } from "../constants/gameConstants";
import type { MoveOption } from "../types";
import { clampIndex, getInterpolatedTransformForPhase, getTransformBetweenBoards } from "../logic/symmetryUtils";
import BoardView from "./BoardView";

type StateCyclePreviewProps = {
  moves: MoveOption[];
  interactive: boolean;
  snapIndex: number;
  onSnapIndexChange: (nextIndex: number) => void;
};

function StateCyclePreview({ moves, interactive, snapIndex, onSnapIndexChange }: StateCyclePreviewProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSliderValue(snapIndex);
    setIsDragging(false);
  }, [moves, snapIndex]);

  const anchor = moves[0];
  if (!anchor) {
    return null;
  }

  const moveTransforms = moves.map((move) => ({
    ...move,
    transform: getTransformBetweenBoards(anchor.nextBoard, move.nextBoard, anchor.move, move.move),
  }));

  const shownMoveIndex = isDragging ? clampIndex(Math.round(sliderValue), moves.length) : snapIndex;
  const shownMove = moveTransforms[shownMoveIndex];
  const snappedMove = moveTransforms[snapIndex] ?? moveTransforms[0];
  const current = shownMove ?? snappedMove ?? anchor;
  const previewTransform = getInterpolatedTransformForPhase(moveTransforms, sliderValue, isDragging);
  const selectedMoveHighlight = new Set([anchor.move]);

  function onSliderChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
    setSliderValue(next);

    if (!isDragging) {
      const snapped = clampIndex(Math.round(next), moves.length);
      onSnapIndexChange(snapped);
      setSliderValue(snapped);
    }
  }

  function snapSlider() {
    const snapped = clampIndex(Math.round(sliderValue), moves.length);
    onSnapIndexChange(snapped);
    setSliderValue(snapped);
    setIsDragging(false);
  }

  return (
    <div className={`state-cycle ${interactive ? "state-cycle-clickable" : "state-cycle-disabled"}`}>
      <div className="state-cycle-frame">
        <div className="state-cycle-stage">
          <div className="transform-preview-shell">
            <div
              className={`transform-anim-shell ${isDragging ? "transform-anim-dragging" : ""}`}
              style={{ transform: previewTransform.css }}
            >
              <BoardView board={anchor.nextBoard} nextMoveIndices={selectedMoveHighlight} showOrientation showCellIndices={false} />
            </div>
            <div className="fixed-index-overlay" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, index) =>
                current.nextBoard[index] === EMPTY ? (
                  <span className="fixed-index-label" key={index}>
                    {index}
                  </span>
                ) : (
                  <span className="fixed-index-label fixed-index-label-hidden" key={index} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="state-cycle-note">
        <span className="state-cycle-note-move">Move #{current.move}</span>
        <span className="state-cycle-note-via">via {previewTransform.label}</span>
      </p>

      {moves.length > 1 && (
        <div
          className="state-slider-zone"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <input
            className="state-slider"
            type="range"
            min={0}
            max={moves.length - 1}
            step={0.01}
            value={sliderValue}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={snapSlider}
            onPointerCancel={snapSlider}
            onBlur={snapSlider}
            onChange={onSliderChange}
          />
          <div className="state-slider-labels">
            {moves.map((move, index) => (
              <span key={move.move} className={`state-slider-label ${index === shownMoveIndex ? "state-slider-label-active" : ""}`}>
                #{move.move}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StateCyclePreview;
