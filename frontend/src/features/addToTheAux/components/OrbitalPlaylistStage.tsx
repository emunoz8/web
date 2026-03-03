import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import CurrentlyPlayingWidget from "./CurrentlyPlayingWidget";
import MobilePlaylistPanel from "./MobilePlaylistPanel";
import OrbitSearchPanel from "./OrbitSearchPanel";
import { OrbitCard, SuggestionOrbitCard } from "./OrbitStageCards";
import { useOrbitCards } from "../hooks/useOrbitCards";
import { SUGGESTION_SLOTS, type OrbitMotionDirection } from "../lib/orbitStage";
import type { CurrentlyPlayingResponse, PlaylistTrackView, PlaylistViewResponse, TrackSearchResult } from "../types/spotify";

type OrbitalPlaylistStageProps = {
  playlist: PlaylistViewResponse | null;
  playlistError: string;
  visiblePlaylistItems: PlaylistTrackView[];
  orderedPlaylistItems: PlaylistTrackView[];
  query: string;
  onQueryChange: (value: string) => void;
  trimmedQuery: string;
  minQueryLength: number;
  searchResults: TrackSearchResult[];
  searchLoading: boolean;
  searchError: string;
  actionError: string;
  addingUri: string;
  onAddTrack: (track: TrackSearchResult) => Promise<void>;
  currentlyPlaying: CurrentlyPlayingResponse | null;
  currentlyPlayingLoading: boolean;
  currentlyPlayingError: string;
  canManageTracks: boolean;
  showGuestOverlay: boolean;
  onLoginClick: () => void;
  canCyclePlaylist: boolean;
  canCycleForward: boolean;
  canCycleBackward: boolean;
  onCycleForward: () => void;
  onCycleBackward: () => void;
  latestTrackKey: string | null;
  firstTrackKey: string | null;
  motionDirection: OrbitMotionDirection;
};

const FLOATING_ICON_BUTTON_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-indigo-400/10 text-indigo-100 transition hover:border-indigo-300/28 hover:bg-indigo-400/16";
const DRAG_THRESHOLD_PX = 64;
const WHEEL_THRESHOLD_PX = 72;

type OrbitDragState = {
  pointerId: number;
  startX: number;
  startY: number;
};

function isDesktopOrbitViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(min-width: 1024px)").matches;
}

function shouldIgnoreOrbitDragTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest('[data-search-keep-open="true"], button, input, textarea, a, [data-orbit-drag-ignore="true"]'));
}

function GuestOverlay({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 px-5 backdrop-blur-md">
      <div className="max-w-lg rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))] px-6 py-7 text-center shadow-[0_24px_80px_rgba(2,6,23,0.55)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/78">Guest Preview Ended</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-50">Login to continue using AddToTheAUX</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Guests can browse the experience for five minutes. Searching tracks, adding songs, and continuing after the
          preview window now require a signed-in account.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-indigo-300/18 bg-[linear-gradient(135deg,rgba(79,70,229,0.92),rgba(124,58,237,0.92))] px-5 py-2.5 text-sm font-semibold text-slate-50 transition hover:-translate-y-0.5"
          onClick={onLoginClick}
        >
          Login to Continue
        </button>
      </div>
    </div>
  );
}

function OrbitalPlaylistStage({
  playlist,
  playlistError,
  visiblePlaylistItems,
  orderedPlaylistItems,
  query,
  onQueryChange,
  trimmedQuery,
  minQueryLength,
  searchResults,
  searchLoading,
  searchError,
  actionError,
  addingUri,
  onAddTrack,
  currentlyPlaying,
  currentlyPlayingLoading,
  currentlyPlayingError,
  canManageTracks,
  showGuestOverlay,
  onLoginClick,
  canCyclePlaylist,
  canCycleForward,
  canCycleBackward,
  onCycleForward,
  onCycleBackward,
  latestTrackKey,
  firstTrackKey,
  motionDirection,
}: OrbitalPlaylistStageProps) {
  const orbitCards = useOrbitCards(visiblePlaylistItems, motionDirection);
  const [stickyActionError, setStickyActionError] = useState("");
  const [transientSearchError, setTransientSearchError] = useState("");
  const [isDraggingOrbit, setIsDraggingOrbit] = useState(false);
  const dragStateRef = useRef<OrbitDragState | null>(null);
  const wheelDeltaRef = useRef(0);

  useEffect(() => {
    if (!actionError) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      setStickyActionError(actionError);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [actionError]);

  useEffect(() => {
    if (!addingUri) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      setStickyActionError("");
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [addingUri]);

  useEffect(() => {
    if (!searchError) {
      const frameId = window.requestAnimationFrame(() => {
        setTransientSearchError("");
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const frameId = window.requestAnimationFrame(() => {
      setTransientSearchError(searchError);
    });

    const timeoutId = window.setTimeout(() => {
      setTransientSearchError("");
    }, 3000);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [searchError]);

  useEffect(() => {
    if (query.length === 0) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-search-keep-open="true"]')) {
        return;
      }

      onQueryChange("");
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onQueryChange, query]);

  const suggestionsOpen = trimmedQuery.length >= minQueryLength;
  const desktopSuggestions = searchResults.slice(0, SUGGESTION_SLOTS.length);
  const playlistUrl = playlist?.playlistId ? `https://open.spotify.com/playlist/${playlist.playlistId}` : null;
  const visibleActionError = actionError || stickyActionError;
  const visibleSearchError = transientSearchError || searchError;
  const srStatus = visibleActionError || playlistError || visibleSearchError || (searchLoading ? "Searching tracks." : "");
  const showSearchEmptyState = suggestionsOpen && !searchLoading && !visibleSearchError && searchResults.length === 0;
  const showPlaylistEmptyState = visiblePlaylistItems.length === 0 && !playlistError;
  const showLoginHint = !canManageTracks && !showGuestOverlay;
  const activeTrackId = currentlyPlaying?.playing ? currentlyPlaying.trackId : null;

  function clearDragState(currentTarget?: HTMLDivElement | null) {
    const state = dragStateRef.current;
    dragStateRef.current = null;
    setIsDraggingOrbit(false);

    if (state && currentTarget?.hasPointerCapture?.(state.pointerId)) {
      currentTarget.releasePointerCapture(state.pointerId);
    }
  }

  function handleOrbitPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDesktopOrbitViewport() || !canCyclePlaylist) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (shouldIgnoreOrbitDragTarget(event.target)) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    setIsDraggingOrbit(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleOrbitPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDesktopOrbitViewport()) {
      return;
    }

    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
    }
  }

  function handleOrbitPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDesktopOrbitViewport()) {
      clearDragState(event.currentTarget);
      return;
    }

    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    clearDragState(event.currentTarget);

    if (Math.abs(deltaX) < DRAG_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      if (canCycleForward) {
        onCycleForward();
      }
      return;
    }

    if (canCycleBackward) {
      onCycleBackward();
    }
  }

  function handleOrbitPointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    clearDragState(event.currentTarget);
  }

  function handleOrbitWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (!isDesktopOrbitViewport() || !canCyclePlaylist || shouldIgnoreOrbitDragTarget(event.target)) {
      return;
    }

    const primaryDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(primaryDelta) < 4) {
      return;
    }

    event.preventDefault();
    wheelDeltaRef.current += primaryDelta;

    if (Math.abs(wheelDeltaRef.current) < WHEEL_THRESHOLD_PX) {
      return;
    }

    if (wheelDeltaRef.current > 0) {
      if (canCycleForward) {
        onCycleForward();
      }
    } else if (canCycleBackward) {
      onCycleBackward();
    }

    wheelDeltaRef.current = 0;
  }

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#16254f,#050814_58%,#030510_100%)] px-3 py-4 shadow-[0_35px_90px_rgba(2,6,23,0.55)] sm:rounded-[36px] sm:px-6 sm:py-5 lg:px-10 lg:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_65%)] blur-3xl" />
        <div className="absolute left-[18%] top-[18%] h-24 w-24 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute bottom-[16%] right-[14%] h-28 w-28 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {playlistUrl && (
        <a
          href={playlistUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open playlist in Spotify"
          title="Open playlist in Spotify"
          className={`absolute right-3 top-3 z-20 sm:right-6 sm:top-6 ${FLOATING_ICON_BUTTON_CLASS}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </a>
      )}

      <div
        className={`relative mt-4 flex min-h-0 flex-1 touch-pan-y sm:mt-6 lg:mt-5 lg:h-[calc(100vh-8.5rem)] lg:min-h-0 ${canCyclePlaylist ? (isDraggingOrbit ? "cursor-grabbing" : "lg:cursor-grab") : ""}`}
        onPointerDown={handleOrbitPointerDown}
        onPointerMove={handleOrbitPointerMove}
        onPointerUp={handleOrbitPointerUp}
        onPointerCancel={handleOrbitPointerCancel}
        onWheel={handleOrbitWheel}
      >
        {orbitCards.map((card) => (
          <OrbitCard
            key={card.key}
            card={card}
            searchActive={suggestionsOpen}
            activeTrackId={activeTrackId}
            latestTrackKey={latestTrackKey}
            firstTrackKey={firstTrackKey}
          />
        ))}

        {suggestionsOpen &&
          desktopSuggestions.map((track, index) => (
            <SuggestionOrbitCard
              key={track.uri}
              track={track}
              slot={SUGGESTION_SLOTS[index]}
              slotIndex={index}
              addingUri={addingUri}
              onAddTrack={onAddTrack}
              canManageTracks={canManageTracks}
            />
          ))}

        <div className="pointer-events-none relative z-10 mx-auto flex h-full min-h-0 max-w-3xl flex-1 flex-col items-center justify-start overflow-hidden lg:justify-center">
          <OrbitSearchPanel
            query={query}
            onQueryChange={onQueryChange}
            canManageTracks={canManageTracks}
            suggestionsOpen={suggestionsOpen}
            visibleActionError={visibleActionError}
            playlistError={playlistError}
            visibleSearchError={visibleSearchError}
            showLoginHint={showLoginHint}
            onLoginClick={onLoginClick}
            srStatus={srStatus}
            searchLoading={searchLoading}
            searchResults={searchResults}
            addingUri={addingUri}
            onAddTrack={onAddTrack}
            showSearchEmptyState={showSearchEmptyState}
            showPlaylistEmptyState={showPlaylistEmptyState}
            currentlyPlaying={currentlyPlaying}
            currentlyPlayingLoading={currentlyPlayingLoading}
            currentlyPlayingError={currentlyPlayingError}
          />

          <MobilePlaylistPanel
            items={orderedPlaylistItems}
            activeTrackId={activeTrackId}
            latestTrackKey={latestTrackKey}
            firstTrackKey={firstTrackKey}
          />
        </div>

        <div className="pointer-events-auto absolute bottom-0 right-0 z-30 hidden w-[18rem] lg:block">
          <CurrentlyPlayingWidget
            currentlyPlaying={currentlyPlaying}
            loading={currentlyPlayingLoading}
            error={currentlyPlayingError}
            embedded
          />
        </div>
      </div>

      {showGuestOverlay && <GuestOverlay onLoginClick={onLoginClick} />}
    </section>
  );
}

export default OrbitalPlaylistStage;
