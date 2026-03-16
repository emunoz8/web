import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AddToTheAuxLoadingScreen from "../features/addToTheAux/components/AddToTheAuxLoadingScreen";
import OrbitalPlaylistStage from "../features/addToTheAux/components/OrbitalPlaylistStage";
import { buildLoginRouteState } from "../lib/authRouting";
import "../features/addToTheAux/styles.css";
import { useAddTrack } from "../features/addToTheAux/hooks/useAddTrack";
import { useCurrentlyPlaying } from "../features/addToTheAux/hooks/useCurrentlyPlaying";
import { useGuestPreview } from "../features/addToTheAux/hooks/useGuestPreview";
import { usePlaylist } from "../features/addToTheAux/hooks/usePlaylist";
import { useTrackSearch } from "../features/addToTheAux/hooks/useTrackSearch";
import { EXIT_ANIMATION_MS, createTrackKey, type OrbitMotionDirection } from "../features/addToTheAux/lib/orbitStage";
import type { TrackSearchResult } from "../features/addToTheAux/types/spotify";

const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 8;
const VISIBLE_PLAYLIST_ITEMS = 10;

function clampWindowStart(index: number, length: number, windowSize: number): number {
  if (length <= windowSize) {
    return 0;
  }

  return Math.max(0, Math.min(index, length - windowSize));
}

function AddToTheAux() {
  const { authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { playlist, playlistLoading, playlistError, orderedPlaylistItems, loadPlaylist } = usePlaylist(VISIBLE_PLAYLIST_ITEMS);
  const guestPreviewExpired = useGuestPreview(isAuthenticated, !authLoading);
  const [playlistWindowStart, setPlaylistWindowStart] = useState(0);
  const [orbitMotionDirection, setOrbitMotionDirection] = useState<OrbitMotionDirection>("idle");

  const { query, setQuery, trimmedQuery, searchResults, searchLoading, searchError } = useTrackSearch(
    MIN_QUERY_LENGTH,
    SEARCH_LIMIT,
    isAuthenticated,
  );

  const { currentlyPlaying, currentlyPlayingLoading, currentlyPlayingError } = useCurrentlyPlaying(
    isAuthenticated || !guestPreviewExpired,
  );

  const { addingUri, actionError, addTrack } = useAddTrack(loadPlaylist, isAuthenticated);

  useEffect(() => {
    setPlaylistWindowStart((currentIndex) =>
      clampWindowStart(currentIndex, orderedPlaylistItems.length, VISIBLE_PLAYLIST_ITEMS),
    );
  }, [orderedPlaylistItems.length]);

  useEffect(() => {
    if (orbitMotionDirection === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setOrbitMotionDirection("idle");
    }, EXIT_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [orbitMotionDirection]);

  const canManageTracks = isAuthenticated;
  const canCyclePlaylist = orderedPlaylistItems.length > VISIBLE_PLAYLIST_ITEMS;
  const maxWindowStart = Math.max(0, orderedPlaylistItems.length - VISIBLE_PLAYLIST_ITEMS);
  const canCycleBackward = playlistWindowStart > 0;
  const canCycleForward = playlistWindowStart < maxWindowStart;
  const visiblePlaylistItems = useMemo(
    () => orderedPlaylistItems.slice(playlistWindowStart, playlistWindowStart + VISIBLE_PLAYLIST_ITEMS),
    [orderedPlaylistItems, playlistWindowStart],
  );
  const latestTrackKey = orderedPlaylistItems[0] ? createTrackKey(orderedPlaylistItems[0]) : null;
  const firstTrackKey = orderedPlaylistItems.at(-1) ? createTrackKey(orderedPlaylistItems.at(-1)!) : null;
  const showInitialPlaylistLoading = playlistLoading && !playlist && !playlistError;

  function handleLoginClick() {
    navigate("/login", { state: buildLoginRouteState(location) });
  }

  function cyclePlaylist(delta: number) {
    if (!canCyclePlaylist) {
      return;
    }

    setOrbitMotionDirection(delta > 0 ? "forward" : "backward");
    setPlaylistWindowStart((currentIndex) =>
      clampWindowStart(currentIndex + delta, orderedPlaylistItems.length, VISIBLE_PLAYLIST_ITEMS),
    );
  }

  async function handleAddTrack(track: TrackSearchResult) {
    const added = await addTrack(track);
    if (added) {
      setQuery("");
      setPlaylistWindowStart(0);
    }
  }

  return (
    <div className="add-to-the-aux-page">
      <main className="add-to-the-aux-main">
        <div className="add-to-the-aux-stage">
          {showInitialPlaylistLoading ? (
            <AddToTheAuxLoadingScreen />
          ) : (
            <OrbitalPlaylistStage
              playlist={playlist}
              playlistError={playlistError}
              visiblePlaylistItems={visiblePlaylistItems}
              query={query}
              onQueryChange={setQuery}
              trimmedQuery={trimmedQuery}
              minQueryLength={MIN_QUERY_LENGTH}
              searchResults={searchResults}
              searchLoading={searchLoading}
              searchError={searchError}
              actionError={actionError}
              addingUri={addingUri}
              onAddTrack={handleAddTrack}
              currentlyPlaying={currentlyPlaying}
              currentlyPlayingLoading={currentlyPlayingLoading}
              currentlyPlayingError={currentlyPlayingError}
              canManageTracks={canManageTracks}
              showGuestOverlay={!authLoading && !isAuthenticated && guestPreviewExpired}
              onLoginClick={handleLoginClick}
              canCyclePlaylist={canCyclePlaylist}
              onCycleForward={() => cyclePlaylist(1)}
              onCycleBackward={() => cyclePlaylist(-1)}
              latestTrackKey={latestTrackKey}
              firstTrackKey={firstTrackKey}
              canCycleForward={canCycleForward}
              canCycleBackward={canCycleBackward}
              motionDirection={orbitMotionDirection}
              orderedPlaylistItems={orderedPlaylistItems}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default AddToTheAux;
