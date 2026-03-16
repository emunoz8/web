import type { PlaylistTrackView, TrackSearchResult } from "../types/spotify";

export type OrbitSlot = {
  top: string;
  left: string;
  rotate: number;
  centered?: boolean;
  hero?: boolean;
};

export type SuggestionSlot = {
  top: string;
  left: string;
  rotate: number;
};

export type OrbitCardStatus = "active" | "entering" | "exiting";
export type OrbitMotionDirection = "forward" | "backward" | "idle";

export type OrbitCardState = {
  key: string;
  track: PlaylistTrackView;
  slotIndex: number;
  status: OrbitCardStatus;
  motionDirection: OrbitMotionDirection;
};

export type OrbitCardDisplayTrack = {
  name: string | null;
  artistName: string | null;
  albumName: string | null;
  imageUrl: string | null;
  addedBy?: string | null;
};

type CardTrackInput =
  | Pick<PlaylistTrackView, "name" | "artistName" | "albumName" | "imageUrl" | "addedBy">
  | Pick<TrackSearchResult, "name" | "artistName" | "albumName" | "imageUrl">;

type SlotPosition = {
  leftPercent: number;
  topPercent: number;
};

const SLOT_CENTER = { x: 50, y: 46 };

export const EXIT_ANIMATION_MS = 720;

export const DESKTOP_SLOTS: OrbitSlot[] = [
  { top: "2%", left: "50%", rotate: 0, centered: true, hero: true },
  { top: "14%", left: "71%", rotate: 7 },
  { top: "29%", left: "83%", rotate: 8 },
  { top: "50%", left: "85%", rotate: 5 },
  { top: "66%", left: "73%", rotate: 3 },
  { top: "72%", left: "50%", rotate: 0, centered: true },
  { top: "66%", left: "27%", rotate: -3 },
  { top: "50%", left: "15%", rotate: -5 },
  { top: "29%", left: "17%", rotate: -8 },
  { top: "14%", left: "29%", rotate: -7 },
];

export const VISIBLE_SLOT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;

export function getOrbitSlotIndex(visibleIndex: number): number {
  return VISIBLE_SLOT_ORDER[visibleIndex] ?? visibleIndex;
}

function getOrbitPathIndex(slotIndex: number): number {
  return VISIBLE_SLOT_ORDER.indexOf(slotIndex as (typeof VISIBLE_SLOT_ORDER)[number]);
}

function getOrbitNeighborSlotIndex(slotIndex: number, step: -1 | 1): number {
  const pathIndex = getOrbitPathIndex(slotIndex);
  if (pathIndex === -1) {
    return slotIndex;
  }

  const neighborPathIndex = Math.max(0, Math.min(pathIndex + step, VISIBLE_SLOT_ORDER.length - 1));
  return VISIBLE_SLOT_ORDER[neighborPathIndex];
}

export const SUGGESTION_SLOTS: SuggestionSlot[] = [
  { top: "13%", left: "24%", rotate: -5 },
  { top: "13%", left: "60%", rotate: 5 },
  { top: "31%", left: "7%", rotate: -4 },
  { top: "32%", left: "77%", rotate: 4 },
  { top: "57%", left: "8%", rotate: -3 },
  { top: "58%", left: "69%", rotate: 3 },
  { top: "73%", left: "28%", rotate: -2 },
  { top: "73%", left: "50%", rotate: 2 },
];

export function createOrbitCardDisplayTrack(track: CardTrackInput): OrbitCardDisplayTrack {
  return {
    name: track.name,
    artistName: track.artistName ?? null,
    albumName: track.albumName,
    imageUrl: track.imageUrl,
    addedBy: "addedBy" in track ? track.addedBy ?? null : null,
  };
}

export function createTrackKey(track: PlaylistTrackView): string {
  return `${track.uri ?? "unknown-uri"}-${track.addedAt ?? track.id ?? track.name ?? "unknown-track"}`;
}

export function createOrbitCardState(
  track: PlaylistTrackView,
  visibleIndex: number,
  status: OrbitCardStatus,
  motionDirection: OrbitMotionDirection = "idle",
): OrbitCardState {
  return {
    key: createTrackKey(track),
    track,
    slotIndex: getOrbitSlotIndex(visibleIndex),
    status,
    motionDirection,
  };
}

export function mergeOrbitCards(
  currentCards: OrbitCardState[],
  nextTracks: PlaylistTrackView[],
  motionDirection: OrbitMotionDirection,
): OrbitCardState[] {
  const stableCurrentCards = currentCards.filter((card) => card.status !== "exiting");
  const stableCurrentKeys = new Set(stableCurrentCards.map((card) => card.key));
  const nextKeys = new Set(nextTracks.map(createTrackKey));
  const exitingCards = currentCards.filter((card) => card.status === "exiting" && !nextKeys.has(card.key));
  const reenteringKeys = new Set(
    currentCards.filter((card) => card.status === "exiting" && nextKeys.has(card.key)).map((card) => card.key),
  );
  const shouldAnimateEntry = stableCurrentCards.length > 0 && motionDirection !== "idle";

  const nextCards = nextTracks.map((track, visibleIndex) => {
    const trackKey = createTrackKey(track);
    const status: OrbitCardStatus =
      shouldAnimateEntry && (!stableCurrentKeys.has(trackKey) || reenteringKeys.has(trackKey)) ? "entering" : "active";

    return createOrbitCardState(track, visibleIndex, status, motionDirection);
  });

  const newExitingCards = stableCurrentCards
    .filter((card) => !nextKeys.has(card.key))
    .map((card) => ({ ...card, status: "exiting" as const, motionDirection }));

  return [
    ...nextCards,
    ...exitingCards,
    ...newExitingCards.filter((card) => !exitingCards.some((existingCard) => existingCard.key === card.key)),
  ];
}

function parseSlotPosition(slot: OrbitSlot): SlotPosition {
  return {
    leftPercent: Number.parseFloat(slot.left),
    topPercent: Number.parseFloat(slot.top),
  };
}

function createOffset(
  slot: OrbitSlot,
  xScale: number,
  yScale: number,
  centerX: number = SLOT_CENTER.x,
  centerY: number = SLOT_CENTER.y,
): { x: number; y: number } {
  const { leftPercent, topPercent } = parseSlotPosition(slot);

  return {
    x: (centerX - leftPercent) * xScale,
    y: (centerY - topPercent) * yScale,
  };
}

export function getEnteringOffset(slot: OrbitSlot): { x: number; y: number } {
  return createOffset(slot, 8.1, 5.2);
}

export function getExitOffset(slot: OrbitSlot): { x: number; y: number } {
  return createOffset(slot, 7.4, 5.1, 49, SLOT_CENTER.y);
}

function createPathContinuationOffset(slotIndex: number, previousSlotIndex: number, multiplier: number): { x: number; y: number } {
  const currentSlot = parseSlotPosition(DESKTOP_SLOTS[slotIndex]);
  const previousSlot = parseSlotPosition(DESKTOP_SLOTS[previousSlotIndex]);

  return {
    x: (currentSlot.leftPercent - previousSlot.leftPercent) * multiplier,
    y: (currentSlot.topPercent - previousSlot.topPercent) * multiplier,
  };
}

export function getDirectionalEnteringOffset(
  slotIndex: number,
  motionDirection: OrbitMotionDirection,
): { x: number; y: number } {
  if (motionDirection === "idle") {
    return getEnteringOffset(DESKTOP_SLOTS[slotIndex]);
  }

  if (motionDirection === "forward") {
    return createPathContinuationOffset(slotIndex, getOrbitNeighborSlotIndex(slotIndex, -1), 9.4);
  }

  return createPathContinuationOffset(slotIndex, getOrbitNeighborSlotIndex(slotIndex, 1), 9.4);
}

export function getDirectionalExitOffset(
  slotIndex: number,
  motionDirection: OrbitMotionDirection,
): { x: number; y: number } {
  if (motionDirection === "idle") {
    return getExitOffset(DESKTOP_SLOTS[slotIndex]);
  }

  if (motionDirection === "forward") {
    return createPathContinuationOffset(slotIndex, getOrbitNeighborSlotIndex(slotIndex, 1), 8.8);
  }

  return createPathContinuationOffset(slotIndex, getOrbitNeighborSlotIndex(slotIndex, -1), 8.8);
}

export function getSearchOffset(slot: OrbitSlot): { x: number; y: number } {
  const { leftPercent, topPercent } = parseSlotPosition(slot);
  const horizontalDirection = leftPercent >= SLOT_CENTER.x ? 1 : -1;

  return {
    x: horizontalDirection * (130 + Math.abs(SLOT_CENTER.x - leftPercent) * 1.5),
    y: (44 - topPercent) * 1.3,
  };
}
