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
  "absolute hidden h-[228px] w-[176px] overflow-hidden rounded-[28px] border border-white/8 bg-slate-950/80 shadow-[0_22px_44px_rgba(2,6,23,0.36)] ring-1 ring-indigo-200/6 lg:block";
const HERO_ORBIT_CARD_CLASS =
  "absolute hidden h-[251px] w-[194px] overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/84 shadow-[0_30px_65px_rgba(2,6,23,0.42)] ring-1 ring-sky-200/12 lg:block";
const SUGGESTION_CARD_CLASS = `${ORBIT_CARD_CLASS} z-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5`;
const ORBIT_TRANSITION_CLASS = `${ORBIT_CARD_CLASS} ease-[cubic-bezier(0.22,1,0.36,1)]`;
const HERO_TRANSITION_CLASS = `${HERO_ORBIT_CARD_CLASS} ease-[cubic-bezier(0.22,1,0.36,1)]`;

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

  return (
    <OrbitVisualCard
      track={createOrbitCardDisplayTrack(track)}
      className={`${isHero ? HERO_TRANSITION_CLASS : ORBIT_TRANSITION_CLASS} ${buildActiveTrackGlowClass(isActiveTrack)} ${isExiting || isSearchingAway ? "pointer-events-none" : ""}`}
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
        <div className="absolute right-3 top-3 z-20">
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
