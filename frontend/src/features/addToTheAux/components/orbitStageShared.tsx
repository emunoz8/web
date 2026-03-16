import type { CSSProperties, ReactNode } from "react";
import { createOrbitCardDisplayTrack, createTrackKey, type OrbitCardDisplayTrack } from "../lib/orbitStage";
import type { PlaylistTrackView, TrackSearchResult } from "../types/spotify";

export const SEARCH_KEEP_OPEN_ATTR = { "data-search-keep-open": "true" } as const;

type ActionBubbleTone = "warning" | "error";

export function buildActiveTrackGlowClass(active: boolean): string {
  return active ? "aux-orbit-card-active" : "";
}

export function getTrackBadgeLabel(
  track: PlaylistTrackView,
  latestTrackKey: string | null,
  firstTrackKey: string | null,
): string | null {
  const trackKey = createTrackKey(track);
  if (firstTrackKey !== null && trackKey === firstTrackKey) {
    return "First Song";
  }

  if (latestTrackKey !== null && trackKey === latestTrackKey) {
    return "Latest";
  }

  return null;
}

export function ArtworkTile({
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
        <img src={imageUrl} alt={alt} className="aux-artwork-cover" loading="lazy" />
      ) : (
        <div className="aux-artwork-fallback">
          <span className="sr-only">No cover</span>
        </div>
      )}
    </div>
  );
}

function CardCaption({ track }: { track: OrbitCardDisplayTrack }) {
  return (
    <div className="aux-orbit-card-caption">
      <p className="aux-orbit-card-title">{track.name || "Unknown track"}</p>
      <p className="aux-orbit-card-meta">{track.artistName || track.albumName || "Unknown artist"}</p>
      {track.addedBy && <p className="aux-orbit-card-submeta">added by {track.addedBy}</p>}
    </div>
  );
}

export function LeadBadge({ label, hero = false }: { label: string; hero?: boolean }) {
  if (hero) {
    return <div className="aux-lead-badge aux-lead-badge-hero">{label}</div>;
  }

  return <div className="aux-lead-badge aux-lead-badge-default">{label}</div>;
}

export function AddTrackButton({
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
      className="aux-gradient-icon-button"
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
        className="aux-gradient-icon-button-icon"
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

export function ActionBubble({ tone, children }: { tone: ActionBubbleTone; children: ReactNode }) {
  const toneClass = tone === "warning" ? "aux-action-bubble-warning" : "aux-action-bubble-error";

  return (
    <div className={`aux-action-bubble ${toneClass}`}>
      {children}
    </div>
  );
}

export function OrbitVisualCard({
  track,
  className,
  style,
  showLeadBadge = false,
  leadBadgeLabel,
  hero = false,
  actionSlot,
  keepSearchOpen = false,
}: {
  track: OrbitCardDisplayTrack;
  className: string;
  style: CSSProperties;
  showLeadBadge?: boolean;
  leadBadgeLabel?: string;
  hero?: boolean;
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
      {showLeadBadge && leadBadgeLabel ? <LeadBadge label={leadBadgeLabel} hero={hero} /> : null}
      {actionSlot}
      <ArtworkTile imageUrl={track.imageUrl} alt={track.albumName ?? track.name ?? "Album art"} className="aux-orbit-card-artwork" />
      <div className="aux-orbit-card-overlay" />
      <CardCaption track={track} />
    </article>
  );
}

export function SearchResultRow({
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
      className="aux-search-result-row"
      {...SEARCH_KEEP_OPEN_ATTR}
    >
      <div className="aux-search-result-media">
        <ArtworkTile
          imageUrl={track.imageUrl}
          alt={track.albumName ?? track.name}
          className="aux-search-result-artwork"
        />
        <div className="aux-search-result-body">
          <p className="aux-search-result-title aux-search-result-title-clamp">
            {track.name}
          </p>
          <p className="aux-search-result-meta">{track.artistName || track.albumName || "Unknown artist"}</p>
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

export function SearchResultSkeletonRow() {
  return (
    <div
      className="aux-search-result-row aux-search-result-skeleton"
      {...SEARCH_KEEP_OPEN_ATTR}
    >
      <div className="aux-search-result-media">
        <div className="aux-search-skeleton-art" />
        <div className="aux-search-skeleton-lines">
          <div className="aux-search-skeleton-line" />
          <div className="aux-search-skeleton-line-short" />
        </div>
      </div>
      <div className="aux-search-skeleton-button" />
    </div>
  );
}

export function EmptyPlaylistState() {
  return (
    <div className="aux-empty-playlist-state">
      Be the first person to add a song to the playlist
    </div>
  );
}

export function createDisplayTrack(track: PlaylistTrackView) {
  return createOrbitCardDisplayTrack(track);
}
