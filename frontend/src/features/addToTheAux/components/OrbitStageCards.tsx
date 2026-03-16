import {
  DESKTOP_SLOTS,
  SUGGESTION_SLOTS,
  createOrbitCardDisplayTrack,
  createTrackKey,
  getDirectionalEnteringOffset,
  getDirectionalExitOffset,
  getSearchOffset,
  type OrbitCardState,
  type OrbitCardStatus,
  type OrbitMotionDirection,
  type OrbitSlot,
  type SuggestionSlot,
} from "../lib/orbitStage";
import type { TrackSearchResult } from "../types/spotify";
import {
  AddTrackButton,
  OrbitVisualCard,
  buildActiveTrackGlowClass,
  getTrackBadgeLabel,
} from "./orbitStageShared";

const ORBIT_CARD_CLASS =
  "aux-orbit-card aux-orbit-card-stage";
const HERO_ORBIT_CARD_CLASS =
  "aux-orbit-card aux-orbit-card-hero";
const SUGGESTION_CARD_CLASS = `${ORBIT_CARD_CLASS} aux-orbit-card-suggestion`;
const ORBIT_TRANSITION_CLASS = `${ORBIT_CARD_CLASS} aux-orbit-card-transition`;
const HERO_TRANSITION_CLASS = `${HERO_ORBIT_CARD_CLASS} aux-orbit-card-transition`;

function buildOrbitTransform(
  slot: OrbitSlot,
  slotIndex: number,
  status: OrbitCardStatus,
  searchActive: boolean,
  motionDirection: OrbitMotionDirection,
  isFirstSong: boolean,
): string {
  const enteringOffset = getDirectionalEnteringOffset(slotIndex, motionDirection);
  const exitOffset = getDirectionalExitOffset(slotIndex, motionDirection);
  const searchOffset = getSearchOffset(slot);
  const centeredPrefix = slot.centered ? "translateX(-50%) " : "";

  if (isFirstSong && slot.hero && status === "exiting" && motionDirection === "backward") {
    return `${centeredPrefix}rotate(${slot.rotate + 3}deg) translate3d(240px, 24px, 0) scale(0.82)`;
  }

  if (status === "exiting") {
    const directionalRotate = motionDirection === "forward" ? -2 : motionDirection === "backward" ? 2 : -1;
    return `${centeredPrefix}rotate(${slot.rotate + directionalRotate}deg) translate3d(${exitOffset.x}px, ${exitOffset.y}px, 0) scale(0.93)`;
  }

  if (status === "entering") {
    const directionalRotate = motionDirection === "forward" ? 2 : motionDirection === "backward" ? -2 : -1;
    return `${centeredPrefix}rotate(${slot.rotate + directionalRotate}deg) translate3d(${enteringOffset.x}px, ${enteringOffset.y}px, 0) scale(0.95)`;
  }

  if (searchActive) {
    return `${centeredPrefix}rotate(${slot.rotate + searchOffset.x / 120}deg) translate3d(${searchOffset.x}px, ${searchOffset.y}px, 0) scale(0.82)`;
  }

  return `${centeredPrefix}rotate(${slot.rotate}deg) translate3d(0, 0, 0) scale(1)`;
}

export function OrbitCard({
  card,
  searchActive,
  activeTrackId,
  latestTrackKey,
  firstTrackKey,
}: {
  card: OrbitCardState;
  searchActive: boolean;
  activeTrackId: string | null;
  latestTrackKey: string | null;
  firstTrackKey: string | null;
}) {
  const { track, slotIndex, status, motionDirection } = card;
  const slot = DESKTOP_SLOTS[slotIndex];
  const isEntering = status === "entering";
  const isExiting = status === "exiting";
  const isSearchingAway = searchActive && status === "active";
  const isFirstSong = firstTrackKey !== null && createTrackKey(track) === firstTrackKey;
  const leadBadgeLabel = !isExiting ? getTrackBadgeLabel(track, latestTrackKey, firstTrackKey) : null;
  const isLead = leadBadgeLabel !== null;
  const isHero = Boolean(slot.hero);
  const isActiveTrack = Boolean(activeTrackId && track.id === activeTrackId);
  const baseTransform = buildOrbitTransform(slot, slotIndex, status, isSearchingAway, motionDirection, isFirstSong);
  const activeTrackClass = buildActiveTrackGlowClass(isActiveTrack);

  return (
    <OrbitVisualCard
      track={createOrbitCardDisplayTrack(track)}
      className={`${isHero ? HERO_TRANSITION_CLASS : ORBIT_TRANSITION_CLASS}${activeTrackClass ? ` ${activeTrackClass}` : ""}${
        isExiting || isSearchingAway ? " aux-orbit-card-disabled" : ""
      }`}
      style={{
        top: slot.top,
        left: slot.left,
        opacity: isExiting || isEntering ? 0 : isSearchingAway ? 0.06 : 1,
        transform: baseTransform,
        zIndex: isExiting ? 0 : isHero ? DESKTOP_SLOTS.length + 12 : DESKTOP_SLOTS.length + 1 - slotIndex,
        willChange: "top, left, width, height, border-radius, transform, opacity",
        transitionProperty: "top, left, width, height, border-radius, transform, opacity",
        transitionDuration: "780ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      showLeadBadge={isLead}
      leadBadgeLabel={leadBadgeLabel ?? undefined}
      hero={isHero}
    />
  );
}

export function SuggestionOrbitCard({
  track,
  slot,
  slotIndex,
  addingUri,
  onAddTrack,
  canManageTracks,
}: {
  track: TrackSearchResult;
  slot: SuggestionSlot;
  slotIndex: number;
  addingUri: string;
  onAddTrack: (track: TrackSearchResult) => Promise<void>;
  canManageTracks: boolean;
}) {
  const isAdding = addingUri === track.uri;

  return (
    <OrbitVisualCard
      track={createOrbitCardDisplayTrack(track)}
      className={SUGGESTION_CARD_CLASS}
      style={{
        top: slot.top,
        left: slot.left,
        transform: `rotate(${slot.rotate}deg)`,
        zIndex: SUGGESTION_SLOTS.length + 10 - slotIndex,
        willChange: "transform",
        transitionProperty: "transform, opacity",
        transitionDuration: "500ms",
      }}
      keepSearchOpen
      actionSlot={
        <div className="aux-suggestion-action">
          <AddTrackButton
            disabled={isAdding || !canManageTracks}
            onClick={() => {
              void onAddTrack(track);
            }}
            label={
              !canManageTracks
                ? `Login required to add ${track.name}`
                : isAdding
                  ? `Adding ${track.name}`
                  : `Add ${track.name}`
            }
          />
        </div>
      }
    />
  );
}
