import type { CSSProperties, ReactNode } from "react";
import { createOrbitCardDisplayTrack, createTrackKey, type OrbitCardDisplayTrack } from "../lib/orbitStage";
import type { PlaylistTrackView, TrackSearchResult } from "../types/spotify";

const FALLBACK_ART_CLASS =
  "grid h-full w-full place-items-center bg-[radial-gradient(circle_at_top,#2c4db8,#071122_70%)] text-center text-sm font-semibold text-indigo-100/80";

export const SUBTLE_GLASS_PANEL_CLASS = "border border-white/10 bg-slate-950/45 backdrop-blur-md";
export const SEARCH_SHELL_CLASS =
  "mx-auto rounded-full border border-white/12 bg-slate-950/50 backdrop-blur-xl shadow-[0_18px_48px_rgba(2,6,23,0.45)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
export const SEARCH_KEEP_OPEN_ATTR = { "data-search-keep-open": "true" } as const;

type ActionBubbleTone = "warning" | "error";

export function buildActiveTrackGlowClass(active: boolean): string {
  return active
    ? "ring-2 ring-emerald-300/85 shadow-[0_0_0_1px_rgba(110,231,183,0.85),0_0_28px_rgba(34,197,94,0.55),0_0_60px_rgba(34,197,94,0.28)]"
    : "";
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

export function LeadBadge({ label, hero = false }: { label: string; hero?: boolean }) {
  if (hero) {
    return (
      <div className="absolute right-3 top-3 z-20 rounded-full border border-sky-100/28 bg-slate-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-100 shadow-[0_10px_24px_rgba(56,189,248,0.18)] backdrop-blur-md">
        {label}
      </div>
    );
  }

  return (
    <div className="absolute right-3 top-3 z-20 rounded-full border border-sky-100/28 bg-slate-950/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-100 shadow-[0_10px_24px_rgba(56,189,248,0.18)] backdrop-blur-md">
      {label}
    </div>
  );
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

export function ActionBubble({ tone, children }: { tone: ActionBubbleTone; children: ReactNode }) {
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/72" />
      <ArtworkTile imageUrl={track.imageUrl} alt={track.albumName ?? track.name ?? "Album art"} className="h-full w-full" />
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

export function SearchResultSkeletonRow() {
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

export function EmptyPlaylistState() {
  return (
    <div className="pointer-events-none mx-auto mt-6 max-w-[24rem] rounded-[26px] border border-white/10 bg-slate-950/36 px-5 py-4 text-center text-sm font-medium text-slate-200/92 backdrop-blur-md">
      Be the first person to add a song to the playlist
    </div>
  );
}

export function createDisplayTrack(track: PlaylistTrackView) {
  return createOrbitCardDisplayTrack(track);
}
