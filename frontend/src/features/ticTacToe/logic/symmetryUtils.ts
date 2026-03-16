import { SYMMETRY_LABELS, SYMMETRY_MAPS } from "../constants/gameConstants";
import type { BoardState, MoveOption, SymmetryTransform } from "../types";

type Matrix2D = [number, number, number, number];

export function transform(board: BoardState, map: number[]): BoardState {
  let transformed = "";

  for (const index of map) {
    transformed += board[index] ?? "";
  }

  return transformed;
}

export function canonicalizeWithMap(board: BoardState): { canonical: BoardState; map: number[] } {
  let canonical = transform(board, SYMMETRY_MAPS[0] ?? []);
  let canonicalMap = SYMMETRY_MAPS[0] ?? [];

  for (const map of SYMMETRY_MAPS) {
    const transformed = transform(board, map);
    if (transformed < canonical) {
      canonical = transformed;
      canonicalMap = map;
    }
  }

  return { canonical, map: canonicalMap };
}

export function canonicalize(board: BoardState): BoardState {
  return canonicalizeWithMap(board).canonical;
}

export function mapSourceIndexToTarget(map: number[], sourceIndex: number): number {
  for (let targetIndex = 0; targetIndex < map.length; targetIndex += 1) {
    if (map[targetIndex] === sourceIndex) {
      return targetIndex;
    }
  }

  return sourceIndex;
}

export function getTransformBetweenBoards(
  fromBoard: BoardState,
  toBoard: BoardState,
  fromMove: number | null = null,
  toMove: number | null = null,
): SymmetryTransform {
  for (let index = 0; index < SYMMETRY_MAPS.length; index += 1) {
    const map = SYMMETRY_MAPS[index] ?? [];
    const boardMatches = transform(fromBoard, map) === toBoard;
    if (!boardMatches) {
      continue;
    }

    if (fromMove === null || toMove === null || mapSourceIndexToTarget(map, fromMove) === toMove) {
      return { index, label: SYMMETRY_LABELS[index] ?? `Transform ${index + 1}` };
    }
  }

  return { index: 0, label: SYMMETRY_LABELS[0] ?? "Equivalent" };
}

function indexToCenteredCoord(index: number): { x: number; y: number } {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return { x: column - 1, y: row - 1 };
}

function matrixToCss(matrix: Matrix2D): string {
  const [a, b, c, d] = matrix;
  return `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`;
}

function getSymmetryMatrix(index: number): Matrix2D {
  const map = SYMMETRY_MAPS[index] ?? SYMMETRY_MAPS[0] ?? [];
  const exTarget = mapSourceIndexToTarget(map, 5);
  const eyTarget = mapSourceIndexToTarget(map, 7);
  const ex = indexToCenteredCoord(exTarget);
  const ey = indexToCenteredCoord(eyTarget);
  return [ex.x, ex.y, ey.x, ey.y];
}

function symmetryCssFromIndex(index: number): string {
  return matrixToCss(getSymmetryMatrix(index));
}

export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}

export function getInterpolatedTransformForPhase(
  moveTransforms: Array<MoveOption & { transform: SymmetryTransform }>,
  phase: number,
  isDragging: boolean,
): { css: string; label: string } {
  if (moveTransforms.length === 0) {
    return { css: "none", label: SYMMETRY_LABELS[0] ?? "R0" };
  }

  const lowerIndex = clampIndex(Math.floor(phase), moveTransforms.length);
  const upperIndex = clampIndex(Math.ceil(phase), moveTransforms.length);
  const from = moveTransforms[lowerIndex]?.transform ?? moveTransforms[0].transform;
  const to = moveTransforms[upperIndex]?.transform ?? moveTransforms[0].transform;

  if (!isDragging || lowerIndex === upperIndex) {
    return {
      css: symmetryCssFromIndex(from.index),
      label: from.label,
    };
  }

  const t = Math.min(1, Math.max(0, phase - lowerIndex));
  const fromMatrix = getSymmetryMatrix(from.index);
  const toMatrix = getSymmetryMatrix(to.index);
  const interpolatedMatrix = fromMatrix.map(
    (value, matrixIndex) => value + (toMatrix[matrixIndex] - value) * t,
  ) as Matrix2D;

  return {
    css: matrixToCss(interpolatedMatrix),
    label: `${from.label} -> ${to.label}`,
  };
}

export function orderMovesByTransform(moves: MoveOption[]): MoveOption[] {
  if (moves.length <= 1) {
    return moves;
  }

  const anchor = [...moves].sort((a, b) => a.move - b.move)[0];
  if (!anchor) {
    return moves;
  }

  return [...moves].sort((a, b) => {
    const aTransform = getTransformBetweenBoards(anchor.nextBoard, a.nextBoard, anchor.move, a.move).index;
    const bTransform = getTransformBetweenBoards(anchor.nextBoard, b.nextBoard, anchor.move, b.move).index;

    if (aTransform !== bTransform) {
      return aTransform - bTransform;
    }

    return a.move - b.move;
  });
}
