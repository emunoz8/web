import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrbitalPlaylistStage from "../features/addToTheAux/components/OrbitalPlaylistStage";
import { buildLoginRouteState } from "../lib/authRouting";
import { useAddTrack } from "../features/addToTheAux/hooks/useAddTrack";
import { useCurrentlyPlaying } from "../features/addToTheAux/hooks/useCurrentlyPlaying";
import { usePlaylist } from "../features/addToTheAux/hooks/usePlaylist";
import { useTrackSearch } from "../features/addToTheAux/hooks/useTrackSearch";
import type { TrackSearchResult } from "../features/addToTheAux/types/spotify";

const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 8;
const VISIBLE_PLAYLIST_ITEMS = 10;
const GUEST_PREVIEW_MS = 5 * 60 * 1000;
const GUEST_PREVIEW_KEY = "add-to-the-aux-guest-preview-started-at";

function getOrCreateGuestPreviewStart(): number {
  const stored = sessionStorage.getItem(GUEST_PREVIEW_KEY);
  const parsed = stored ? Number(stored) : Number.NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  const startedAt = Date.now();
  sessionStorage.setItem(GUEST_PREVIEW_KEY, String(startedAt));
  return startedAt;
}

function AddToTheAux() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { playlist, playlistError, visiblePlaylistItems, loadPlaylist } = usePlaylist(VISIBLE_PLAYLIST_ITEMS);
  const [guestPreviewExpired, setGuestPreviewExpired] = useState(false);

  const { query, setQuery, trimmedQuery, searchResults, searchLoading, searchError } = useTrackSearch(
    MIN_QUERY_LENGTH,
    SEARCH_LIMIT,
    token,
  );

  const { currentlyPlaying, currentlyPlayingLoading, currentlyPlayingError } = useCurrentlyPlaying(
    isAuthenticated || !guestPreviewExpired,
  );

  const { addingUri, actionError, addTrack } = useAddTrack(loadPlaylist, token);

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem(GUEST_PREVIEW_KEY);
      setGuestPreviewExpired(false);
      return;
    }

    const startedAt = getOrCreateGuestPreviewStart();
    const expiresAt = startedAt + GUEST_PREVIEW_MS;
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      setGuestPreviewExpired(true);
      return;
    }

    setGuestPreviewExpired(false);
    const timeoutId = window.setTimeout(() => {
      setGuestPreviewExpired(true);
    }, remainingMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  const canManageTracks = isAuthenticated && !!token;

  function handleLoginClick() {
    navigate("/login", { state: buildLoginRouteState(location) });
  }

  async function handleAddTrack(track: TrackSearchResult) {
    const added = await addTrack(track);
    if (added) {
      setQuery("");
    }
  }

  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
      <main className="aux-page-font mx-auto w-full max-w-[1520px] px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-8">


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
          showGuestOverlay={!isAuthenticated && guestPreviewExpired}
          onLoginClick={handleLoginClick}
        />
      </main>
    </div>
  );
}

export default AddToTheAux;
