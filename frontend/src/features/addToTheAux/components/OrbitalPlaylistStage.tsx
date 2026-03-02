import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import CurrentlyPlayingWidget from "./CurrentlyPlayingWidget";
import { useOrbitCards } from "../hooks/useOrbitCards";
import {
  DESKTOP_SLOTS,
  SUGGESTION_SLOTS,
  createOrbitCardDisplayTrack,
  getEnteringOffset,
  getExitOffset,
  getSearchOffset,
  type OrbitCardDisplayTrack,
  type OrbitCardStatus,
  type OrbitSlot,
  type SuggestionSlot,
} from "../lib/orbitStage";
import type { CurrentlyPlayingResponse, PlaylistTrackView, PlaylistViewResponse, TrackSearchResult } from "../types/spotify";

type OrbitalPlaylistStageProps = {
  playlist: PlaylistViewResponse | null;
  playlistError: string;
  visiblePlaylistItems: PlaylistTrackView[];
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
};

const ORBIT_CARD_CLASS =
  "absolute hidden h-[228px] w-[176px] overflow-hidden rounded-[28px] border border-white/8 bg-slate-950/80 shadow-[0_22px_44px_rgba(2,6,23,0.36)] ring-1 ring-indigo-200/6 lg:block";
const SUGGESTION_CARD_CLASS = `${ORBIT_CARD_CLASS} z-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5`;
const ORBIT_TRANSITION_CLASS = `${ORBIT_CARD_CLASS} ease-[cubic-bezier(0.22,1,0.36,1)]`;
const FALLBACK_ART_CLASS =
  "grid h-full w-full place-items-center bg-[radial-gradient(circle_at_top,#2c4db8,#071122_70%)] text-center text-sm font-semibold text-indigo-100/80";
const SUBTLE_GLASS_PANEL_CLASS = "border border-white/10 bg-slate-950/45 backdrop-blur-md";
const FLOATING_ICON_BUTTON_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-indigo-400/10 text-indigo-100 transition hover:border-indigo-300/28 hover:bg-indigo-400/16";
const SEARCH_SHELL_CLASS =
  "mx-auto rounded-full border border-white/12 bg-slate-950/50 backdrop-blur-xl shadow-[0_18px_48px_rgba(2,6,23,0.45)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
const SEARCH_KEEP_OPEN_ATTR = { "data-search-keep-open": "true" } as const;

type ActionBubbleTone = "warning" | "error";

function ArtworkTile({
  imageUrl,
  alt,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  className: string;
}) {
  return (
    <div className={className}>
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className={FALLBACK_ART_CLASS}>
          <span className="sr-only">No cover</span>
        </div>
      )}
    </div>
  );
}

function CardCaption({ track }: { track: OrbitCardDisplayTrack }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-[22px] border border-white/10 bg-slate-950/56 px-3 py-2 backdrop-blur-md">
      <p className="truncate text-sm font-semibold text-slate-50">{track.name || "Unknown track"}</p>
      <p className="truncate text-[11px] text-slate-300">{track.artistName || track.albumName || "Unknown artist"}</p>
      {track.addedBy && <p className="truncate text-[11px] text-slate-400">added by {track.addedBy}</p>}
    </div>
  );
}

function AddTrackButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-full border border-indigo-300/18 bg-[linear-gradient(135deg,rgba(79,70,229,0.92),rgba(124,58,237,0.92))] p-2 text-slate-50 transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0"
      onClick={onClick}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </button>
  );
}

function ActionBubble({ tone, children }: { tone: ActionBubbleTone; children: ReactNode }) {
  const toneClass =
    tone === "warning"
      ? "border-amber-300/18 bg-amber-400/10 text-amber-100"
      : "border-red-300/18 bg-red-500/10 text-red-100";

  return (
    <div className={`mx-auto mt-3 max-w-[22rem] rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md ${toneClass}`}>
      {children}
    </div>
  );
}

function OrbitVisualCard({
  track,
  className,
  style,
  showLeadBadge = false,
  actionSlot,
  keepSearchOpen = false,
}: {
  track: OrbitCardDisplayTrack;
  className: string;
  style: CSSProperties;
  showLeadBadge?: boolean;
  actionSlot?: ReactNode;
  keepSearchOpen?: boolean;
}) {
  return (
    <article
      className={className}
      style={style}
      title={track.name ?? track.albumName ?? undefined}
      data-search-keep-open={keepSearchOpen ? "true" : undefined}
    >
      {showLeadBadge && (
        <div className="absolute left-3 top-3 z-20 h-3.5 w-3.5 rounded-full border border-sky-100/45 bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.75)] animate-pulse" />
      )}
      {actionSlot}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/72" />
      <ArtworkTile imageUrl={track.imageUrl} alt={track.albumName ?? track.name ?? "Album art"} className="h-full w-full" />
      <CardCaption track={track} />
    </article>
  );
}

function buildOrbitTransform(slot: OrbitSlot, status: OrbitCardStatus, searchActive: boolean): string {
  const enteringOffset = getEnteringOffset(slot);
  const exitOffset = getExitOffset(slot);
  const searchOffset = getSearchOffset(slot);

  if (status === "exiting") {
    return `rotate(${slot.rotate - 4}deg) translate3d(${exitOffset.x}px, ${exitOffset.y}px, 0) scale(0.52)`;
  }

  if (status === "entering") {
    return `rotate(${slot.rotate - 8}deg) translate3d(${enteringOffset.x}px, ${enteringOffset.y}px, 0) scale(0.6)`;
  }

  if (searchActive) {
    return `rotate(${slot.rotate + searchOffset.x / 120}deg) translate3d(${searchOffset.x}px, ${searchOffset.y}px, 0) scale(0.82)`;
  }

  return `rotate(${slot.rotate}deg) translate3d(0, 0, 0) scale(1)`;
}

function OrbitCard({
  track,
  slotIndex,
  status,
  searchActive,
}: {
  track: PlaylistTrackView;
  slotIndex: number;
  status: OrbitCardStatus;
  searchActive: boolean;
}) {
  const slot = DESKTOP_SLOTS[slotIndex];
  const isEntering = status === "entering";
  const isExiting = status === "exiting";
  const isSearchingAway = searchActive && status === "active";
  const isLead = slotIndex === 0 && !isExiting;
  const baseTransform = buildOrbitTransform(slot, status, isSearchingAway);

  return (
    <OrbitVisualCard
      track={createOrbitCardDisplayTrack(track)}
      className={`${ORBIT_TRANSITION_CLASS} ${isExiting || isSearchingAway ? "pointer-events-none" : ""}`}
      style={{
        top: slot.top,
        left: slot.left,
        opacity: isExiting || isEntering ? 0 : isSearchingAway ? 0.06 : 1,
        transform: baseTransform,
        zIndex: isExiting ? 0 : DESKTOP_SLOTS.length + 1 - slotIndex,
        willChange: "transform, opacity",
        transitionProperty: "transform, opacity",
        transitionDuration: "700ms",
      }}
      showLeadBadge={isLead}
    />
  );
}

function SearchResultRow({
  track,
  addingUri,
  onAddTrack,
  canManageTracks,
}: {
  track: TrackSearchResult;
  addingUri: string;
  onAddTrack: (track: TrackSearchResult) => Promise<void>;
  canManageTracks: boolean;
}) {
  const isAdding = addingUri === track.uri;

  return (
    <article
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-[22px] p-2.5 shadow-[0_8px_22px_rgba(2,6,23,0.34)] ${SUBTLE_GLASS_PANEL_CLASS}`}
      {...SEARCH_KEEP_OPEN_ATTR}
    >
      <div className="grid min-w-0 grid-cols-[52px_minmax(0,1fr)] items-center gap-2.5">
        <ArtworkTile
          imageUrl={track.imageUrl}
          alt={track.albumName ?? track.name}
          className="aspect-square overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,#263870,#0a1124_78%)]"
        />
        <div className="min-w-0">
          <p
            className="overflow-hidden text-sm font-semibold leading-tight text-slate-50"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {track.name}
          </p>
          <p className="truncate text-[11px] text-slate-300">{track.artistName || track.albumName || "Unknown artist"}</p>
        </div>
      </div>
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
    </article>
  );
}

function SearchResultSkeletonRow() {
  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-[22px] border border-white/8 bg-slate-950/32 p-2.5 shadow-[0_8px_22px_rgba(2,6,23,0.24)] backdrop-blur-md"
      {...SEARCH_KEEP_OPEN_ATTR}
    >
      <div className="grid min-w-0 grid-cols-[52px_minmax(0,1fr)] items-center gap-2.5">
        <div className="aspect-square animate-pulse rounded-[18px] bg-white/10" />
        <div className="min-w-0 space-y-2">
          <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-white/10" />
          <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-white/8" />
        </div>
      </div>
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

function EmptyPlaylistState() {
  return (
    <div className="pointer-events-none mx-auto mt-6 max-w-[24rem] rounded-[26px] border border-white/10 bg-slate-950/36 px-5 py-4 text-center text-sm font-medium text-slate-200/92 backdrop-blur-md">
      Be the first person to add a song to the playlist
    </div>
  );
}

function SuggestionOrbitCard({
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

function MobileRecentList({ items }: { items: PlaylistTrackView[] }) {
  return (
    <div className="pointer-events-auto mt-6 grid gap-3 lg:hidden">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((track, index) => {
          const displayTrack = createOrbitCardDisplayTrack(track);

          return (
            <article
              className={`relative aspect-square overflow-hidden rounded-[24px] border backdrop-blur-sm ${
                index === 0 ? "border-sky-300/30 bg-sky-400/8 shadow-[0_12px_30px_rgba(56,189,248,0.12)]" : "border-white/8 bg-white/6"
              }`}
              key={`${track.uri}-${track.addedAt ?? track.id ?? track.name}`}
              title={track.name ?? track.albumName ?? undefined}
            >
              <ArtworkTile
                imageUrl={displayTrack.imageUrl}
                alt={displayTrack.albumName ?? displayTrack.name ?? "Album art"}
                className="h-full w-full bg-[radial-gradient(circle_at_top,#263870,#0a1124_78%)]"
              />
              {index === 0 && (
                <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.75)]" />
              )}
              <CardCaption track={displayTrack} />
            </article>
          );
        })}
      </div>
    </div>
  );
}

function OrbitalPlaylistStage({
  playlist,
  playlistError,
  visiblePlaylistItems,
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
}: OrbitalPlaylistStageProps) {
  const orbitCards = useOrbitCards(visiblePlaylistItems);
  const [stickyActionError, setStickyActionError] = useState("");
  const [transientSearchError, setTransientSearchError] = useState("");

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

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#16254f,#050814_58%,#030510_100%)] px-3 py-4 shadow-[0_35px_90px_rgba(2,6,23,0.55)] sm:rounded-[36px] sm:px-6 sm:py-5 lg:px-10 lg:py-8">
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

      <div className="relative mt-4 min-h-[700px] sm:mt-6 sm:min-h-[760px] lg:mt-8 lg:min-h-[880px]">
        {orbitCards.map((card) => (
          <OrbitCard
            key={card.key}
            track={card.track}
            slotIndex={card.slotIndex}
            status={card.status}
            searchActive={suggestionsOpen}
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

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[700px] max-w-3xl flex-col items-center justify-center sm:min-h-[760px] lg:min-h-[880px]">
          <div
            {...SEARCH_KEEP_OPEN_ATTR}
            className={`pointer-events-auto w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
              {visibleActionError && <ActionBubble tone="warning">{visibleActionError}</ActionBubble>}
              {!visibleActionError && playlistError && <ActionBubble tone="error">{playlistError}</ActionBubble>}
              {!visibleActionError && !playlistError && visibleSearchError && <ActionBubble tone="error">{visibleSearchError}</ActionBubble>}
              {showLoginHint && (
              <div className="mx-auto mt-3 flex max-w-[26rem] flex-col items-center gap-3 rounded-[22px] border border-white/10 bg-slate-950/42 px-3 py-3 text-center backdrop-blur-md sm:max-w-[28rem] sm:flex-row sm:justify-between sm:px-4 sm:text-left">
                  <p className="text-sm text-slate-200/92">
                    Preview mode is open, but searching and adding songs requires a login.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-indigo-300/20 bg-indigo-400/12 px-4 py-2 text-sm font-semibold text-indigo-50 transition hover:bg-indigo-400/18"
                    onClick={onLoginClick}
                  >
                    Login
                  </button>
                </div>
              )}
              <div className="sr-only" aria-live="polite">
                {srStatus}
              </div>
            </div>

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

            {showPlaylistEmptyState && <EmptyPlaylistState />}
          </div>

          <MobileRecentList items={visiblePlaylistItems} />
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

      {showGuestOverlay && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 px-5 backdrop-blur-md">
          <div className="max-w-lg rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))] px-6 py-7 text-center shadow-[0_24px_80px_rgba(2,6,23,0.55)] sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/78">Guest Preview Ended</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-50">Login to continue using AddToTheAUX</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Guests can browse the experience for five minutes. Searching tracks, adding songs, and continuing after
              the preview window now require a signed-in account.
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
      )}
    </section>
  );
}

export default OrbitalPlaylistStage;
