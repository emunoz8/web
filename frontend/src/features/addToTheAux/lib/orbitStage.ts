import type { PlaylistTrackView, TrackSearchResult } from "../types/spotify";

export type OrbitSlot = {
  top: string;
  left: string;
  rotate: number;
};

export type SuggestionSlot = {
  top: string;
  left: string;
  rotate: number;
};

export type OrbitCardStatus = "active" | "entering" | "exiting";

export type OrbitCardState = {
  key: string;
  track: PlaylistTrackView;
  slotIndex: number;
  status: OrbitCardStatus;
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
  { top: "8%", left: "11%", rotate: -4 },
  { top: "4%", left: "30%", rotate: -2 },
  { top: "5%", left: "52%", rotate: 2 },
  { top: "10%", left: "70%", rotate: 4 },
  { top: "30%", left: "79%", rotate: 3 },
  { top: "58%", left: "76%", rotate: 2 },
  { top: "72%", left: "56%", rotate: -2 },
  { top: "72%", left: "31%", rotate: -3 },
  { top: "57%", left: "10%", rotate: -4 },
  { top: "31%", left: "3%", rotate: -3 },
];

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
  slotIndex: number,
  status: OrbitCardStatus,
): OrbitCardState {
  return {
    key: createTrackKey(track),
    track,
    slotIndex,
    status,
  };
}

export function mergeOrbitCards(currentCards: OrbitCardState[], nextTracks: PlaylistTrackView[]): OrbitCardState[] {
  const currentKeys = new Set(currentCards.map((card) => card.key));
  const nextKeys = new Set(nextTracks.map(createTrackKey));
  const exitingCards = currentCards.filter((card) => card.status === "exiting" && !nextKeys.has(card.key));
  const shouldAnimateEntry = currentCards.length > 0;

  const nextCards = nextTracks.map((track, slotIndex) => {
    const trackKey = createTrackKey(track);
    const status: OrbitCardStatus =
      shouldAnimateEntry && slotIndex === 0 && !currentKeys.has(trackKey) ? "entering" : "active";

    return createOrbitCardState(track, slotIndex, status);
  });

  const newExitingCards = currentCards
    .filter((card) => card.status === "active" && !nextKeys.has(card.key))
    .map((card) => ({ ...card, status: "exiting" as const }));

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

export function getSearchOffset(slot: OrbitSlot): { x: number; y: number } {
  const { leftPercent, topPercent } = parseSlotPosition(slot);
  const horizontalDirection = leftPercent >= SLOT_CENTER.x ? 1 : -1;

  return {
    x: horizontalDirection * (130 + Math.abs(SLOT_CENTER.x - leftPercent) * 1.5),
    y: (44 - topPercent) * 1.3,
  };
}
