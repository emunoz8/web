export type PlayerSymbol = "X" | "O";
export type BoardCell = PlayerSymbol | "-";
export type BoardState = string;
export type Starter = "player" | "ai";
export type StatusTone = "idle" | "win" | "draw" | "active" | "cool";
export type MoveTier = 0 | 1 | 2;

export type SymmetryTransform = {
  index: number;
  label: string;
};

export type LookupPlayerMoves = Partial<Record<PlayerSymbol, number>>;

export type LookupMeta = {
  winLines: number[][];
  symmetryMaps: number[][];
  symmetryLabels: string[];
};

export type LookupPayload = {
  meta: LookupMeta;
  lookupTable: Record<BoardState, LookupPlayerMoves>;
};

export type MoveOption = {
  move: number;
  nextBoard: BoardState;
  canonical: BoardState;
  score: MoveTier;
};

export type MoveGroup = {
  canonical: BoardState;
  bestScore: MoveTier;
  moves: MoveOption[];
};
