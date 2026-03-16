import tictactoeCombinedLookup from "../data/tictactoeCombinedLookup.json";
import type { LookupPayload, MoveTier } from "../types";

export const EMPTY = "-" as const;
export const EMPTY_BOARD = "---------";

export const MOVE_TIER_WORSE: MoveTier = 0;
export const MOVE_TIER_OPTION: MoveTier = 1;
export const MOVE_TIER_BEST: MoveTier = 2;

const DEFAULT_SYMMETRY_LABELS = ["R0", "R90", "R180", "R270", "Reflect", "Reflect + R90", "Reflect + R180", "Reflect + R270"];
const INITIAL_LOOKUP_DATA = tictactoeCombinedLookup as LookupPayload;

function sanitizeSymmetryLabel(label: string, fallback: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.replace(/\u00B0/g, "deg").replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();
}

function createGameConstants(lookupData: LookupPayload) {
  const metadata = lookupData?.meta;
  if (
    !metadata ||
    !Array.isArray(metadata.winLines) ||
    !Array.isArray(metadata.symmetryMaps) ||
    !Array.isArray(metadata.symmetryLabels)
  ) {
    throw new Error("Invalid lookup JSON: missing required meta.winLines/symmetryMaps/symmetryLabels.");
  }

  return {
    lookupTable: lookupData.lookupTable ?? {},
    winLines: metadata.winLines,
    symmetryMaps: metadata.symmetryMaps,
    symmetryLabels: metadata.symmetryLabels.map((label, index) =>
      sanitizeSymmetryLabel(label, DEFAULT_SYMMETRY_LABELS[index] ?? `Transform ${index + 1}`),
    ),
  };
}

const initialGameConstants = createGameConstants(INITIAL_LOOKUP_DATA);

export let LOOKUP_TABLE: LookupPayload["lookupTable"] = initialGameConstants.lookupTable;
export let WIN_LINES = initialGameConstants.winLines;
export let SYMMETRY_MAPS = initialGameConstants.symmetryMaps;
export let SYMMETRY_LABELS = initialGameConstants.symmetryLabels;

export function configureGameConstants(lookupData: LookupPayload = INITIAL_LOOKUP_DATA): LookupPayload["lookupTable"] {
  const configured = createGameConstants(lookupData);
  LOOKUP_TABLE = configured.lookupTable;
  WIN_LINES = configured.winLines;
  SYMMETRY_MAPS = configured.symmetryMaps;
  SYMMETRY_LABELS = configured.symmetryLabels;

  return LOOKUP_TABLE;
}
