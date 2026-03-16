import CurrentlyPlayingWidget from "./CurrentlyPlayingWidget";
import type { CurrentlyPlayingResponse, TrackSearchResult } from "../types/spotify";
import {
  ActionBubble,
  EmptyPlaylistState,
  SEARCH_KEEP_OPEN_ATTR,
  SearchResultRow,
  SearchResultSkeletonRow,
} from "./orbitStageShared";

function SearchInput({
  query,
  onQueryChange,
  canManageTracks,
  suggestionsOpen,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  canManageTracks: boolean;
  suggestionsOpen: boolean;
}) {
  return (
    <div className={`aux-search-shell ${suggestionsOpen ? "aux-search-shell-open" : "aux-search-shell-closed"}`}>
      <div className="aux-search-shell-row">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="aux-search-shell-icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="track-query"
          aria-label="Search tracks"
          className={`aux-search-input ${
            suggestionsOpen ? "aux-search-input-open" : "aux-search-input-closed"
          }${canManageTracks ? "" : " aux-search-input-disabled"}`}
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          disabled={!canManageTracks}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
          placeholder={canManageTracks ? "" : "Login to search and add songs"}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

function GuestLoginHint({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="aux-guest-login-hint">
      <p className="aux-guest-login-copy">Preview mode is open, but searching and adding songs requires a login.</p>
      <button
        type="button"
        className="aux-secondary-pill-button"
        onClick={onLoginClick}
      >
        Login
      </button>
    </div>
  );
}

function MobileSearchResults({
  searchLoading,
  searchResults,
  addingUri,
  onAddTrack,
  canManageTracks,
  showSearchEmptyState,
}: {
  searchLoading: boolean;
  searchResults: TrackSearchResult[];
  addingUri: string;
  onAddTrack: (track: TrackSearchResult) => Promise<void>;
  canManageTracks: boolean;
  showSearchEmptyState: boolean;
}) {
  return (
    <div className="aux-mobile-search-results">
      {searchLoading &&
        Array.from({ length: 3 }, (_, index) => <SearchResultSkeletonRow key={`search-skeleton-${index}`} />)}

      {!searchLoading &&
        searchResults.map((track) => (
          <SearchResultRow
            key={track.uri}
            track={track}
            addingUri={addingUri}
            onAddTrack={onAddTrack}
            canManageTracks={canManageTracks}
          />
        ))}

      {showSearchEmptyState && (
        <div className="aux-search-empty-state" {...SEARCH_KEEP_OPEN_ATTR}>
          No matching songs found.
        </div>
      )}
    </div>
  );
}

function OrbitSearchPanel({
  query,
  onQueryChange,
  canManageTracks,
  suggestionsOpen,
  visibleActionError,
  playlistError,
  visibleSearchError,
  showLoginHint,
  onLoginClick,
  srStatus,
  searchLoading,
  searchResults,
  addingUri,
  onAddTrack,
  showSearchEmptyState,
  showPlaylistEmptyState,
  currentlyPlaying,
  currentlyPlayingLoading,
  currentlyPlayingError,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  canManageTracks: boolean;
  suggestionsOpen: boolean;
  visibleActionError: string;
  playlistError: string;
  visibleSearchError: string;
  showLoginHint: boolean;
  onLoginClick: () => void;
  srStatus: string;
  searchLoading: boolean;
  searchResults: TrackSearchResult[];
  addingUri: string;
  onAddTrack: (track: TrackSearchResult) => Promise<void>;
  showSearchEmptyState: boolean;
  showPlaylistEmptyState: boolean;
  currentlyPlaying: CurrentlyPlayingResponse | null;
  currentlyPlayingLoading: boolean;
  currentlyPlayingError: string;
}) {
  return (
    <div
      {...SEARCH_KEEP_OPEN_ATTR}
      className={`aux-search-panel ${suggestionsOpen ? "aux-search-panel-open" : "aux-search-panel-closed"}`}
    >
      <div className="aux-search-mobile-widget">
        <CurrentlyPlayingWidget
          currentlyPlaying={currentlyPlaying}
          loading={currentlyPlayingLoading}
          error={currentlyPlayingError}
          embedded
          className="aux-currently-playing-mobile-card"
        />
      </div>

      <div className="aux-search-content">
        <SearchInput
          query={query}
          onQueryChange={onQueryChange}
          canManageTracks={canManageTracks}
          suggestionsOpen={suggestionsOpen}
        />

        {visibleActionError && <ActionBubble tone="warning">{visibleActionError}</ActionBubble>}
        {!visibleActionError && playlistError && <ActionBubble tone="error">{playlistError}</ActionBubble>}
        {!visibleActionError && !playlistError && visibleSearchError && <ActionBubble tone="error">{visibleSearchError}</ActionBubble>}
        {showLoginHint && <GuestLoginHint onLoginClick={onLoginClick} />}
        <div className="sr-only" aria-live="polite">
          {srStatus}
        </div>
      </div>

      <MobileSearchResults
        searchLoading={searchLoading}
        searchResults={searchResults}
        addingUri={addingUri}
        onAddTrack={onAddTrack}
        canManageTracks={canManageTracks}
        showSearchEmptyState={showSearchEmptyState}
      />

      {showPlaylistEmptyState && <EmptyPlaylistState />}
    </div>
  );
}

export default OrbitSearchPanel;
