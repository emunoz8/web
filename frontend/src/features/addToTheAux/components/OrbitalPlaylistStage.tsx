import { useEffect, useRef, useState, type WheelEvent as ReactWheelEvent } from "react";
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

const WHEEL_THRESHOLD_PX = 88;

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
    <div className="aux-guest-overlay">
      <div className="aux-guest-card">
        <p className="aux-guest-kicker">Guest Preview Ended</p>
        <h2 className="aux-guest-title">Login to continue using AddToTheAUX</h2>
        <p className="aux-guest-copy">
          Guests can browse the experience for five minutes. Searching tracks, adding songs, and continuing after the
          preview window now require a signed-in account.
        </p>
        <button
          type="button"
          className="aux-gradient-button aux-guest-cta"
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

  function handleOrbitWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (!isDesktopOrbitViewport() || !canCyclePlaylist || shouldIgnoreOrbitDragTarget(event.target)) {
      return;
    }

    const horizontalDelta = event.deltaX;
    const verticalDelta = event.deltaY;
    const dominantDelta =
      Math.abs(horizontalDelta) > Math.abs(verticalDelta) ? horizontalDelta : verticalDelta;

    if (Math.abs(dominantDelta) < 4) {
      wheelDeltaRef.current = 0;
      return;
    }

    event.preventDefault();
    wheelDeltaRef.current += dominantDelta;

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
    <section className="aux-stage-surface">
      <div className="aux-stage-background">
        <div className="aux-stage-core-glow" />
        <div className="aux-stage-violet-glow" />
        <div className="aux-stage-sky-glow" />
      </div>

      {playlistUrl && (
        <a
          href={playlistUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open playlist in Spotify"
          title="Open playlist in Spotify"
          className="aux-floating-icon-link"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="aux-floating-icon-link-icon"
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

      <div className="aux-orbit-scroll-region" onWheel={handleOrbitWheel}>
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

        <div className="aux-orbit-center-column">
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

        <div className="aux-orbit-desktop-widget">
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
