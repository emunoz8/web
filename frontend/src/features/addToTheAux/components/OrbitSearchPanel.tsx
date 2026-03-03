import CurrentlyPlayingWidget from "./CurrentlyPlayingWidget";
import type { CurrentlyPlayingResponse, TrackSearchResult } from "../types/spotify";
import {
  ActionBubble,
  EmptyPlaylistState,
  SEARCH_KEEP_OPEN_ATTR,
  SEARCH_SHELL_CLASS,
  SUBTLE_GLASS_PANEL_CLASS,
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
    <div className={`${SEARCH_SHELL_CLASS} ${suggestionsOpen ? "max-w-[20rem] px-3 py-2" : "max-w-[22.5rem] px-3 py-2 sm:max-w-[25rem] sm:px-4 sm:py-2.5"}`}>
      <div className="flex items-center gap-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-slate-500"
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
          className={`w-full border-0 bg-transparent text-white outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            canManageTracks ? "placeholder:text-transparent" : "cursor-not-allowed placeholder:text-slate-400/80"
          } ${
            suggestionsOpen ? "py-1 text-[0.95rem] sm:text-base" : "py-1.5 text-base sm:text-lg"
          }`}
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
    <div className="mx-auto mt-3 flex max-w-[26rem] flex-col items-center gap-3 rounded-[22px] border border-white/10 bg-slate-950/42 px-3 py-3 text-center backdrop-blur-md sm:max-w-[28rem] sm:flex-row sm:justify-between sm:px-4 sm:text-left">
      <p className="text-sm text-slate-200/92">Preview mode is open, but searching and adding songs requires a login.</p>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-indigo-300/20 bg-indigo-400/12 px-4 py-2 text-sm font-semibold text-indigo-50 transition hover:bg-indigo-400/18"
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
    <div className="mx-auto mt-3 max-h-[11.5rem] max-w-[24rem] space-y-2.5 overflow-y-auto sm:mt-4 sm:max-h-[13rem] sm:max-w-[27rem] lg:hidden">
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
        <div
          className={`rounded-[22px] px-4 py-3 text-center text-sm text-slate-300 ${SUBTLE_GLASS_PANEL_CLASS}`}
          {...SEARCH_KEEP_OPEN_ATTR}
        >
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
      className={`pointer-events-auto w-full shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        suggestionsOpen ? "max-w-[24rem] sm:max-w-[26rem]" : "max-w-[24.5rem] sm:max-w-[30rem]"
      }`}
    >
      <div className="mx-auto mb-3 flex justify-center lg:hidden sm:mb-4">
        <CurrentlyPlayingWidget
          currentlyPlaying={currentlyPlaying}
          loading={currentlyPlayingLoading}
          error={currentlyPlayingError}
          embedded
          className="max-w-[24rem] sm:max-w-[26rem]"
        />
      </div>

      <div className="mx-auto max-w-2xl text-center">
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
