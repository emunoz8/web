import type { CSSProperties } from "react";
import type { PlaylistTrackView } from "../types/spotify";
import { ArtworkTile, LeadBadge, createDisplayTrack, getTrackBadgeLabel } from "./orbitStageShared";

function buildActiveTrackStyle(active: boolean): CSSProperties | undefined {
  return active
    ? {
        boxShadow:
          "0 0 0 1px rgba(110,231,183,0.82), 0 0 22px rgba(34,197,94,0.32), 0 0 40px rgba(34,197,94,0.14)",
      }
    : undefined;
}

function MobilePlaylistCard({
  track,
  activeTrackId,
  latestTrackKey,
  firstTrackKey,
}: {
  track: PlaylistTrackView;
  activeTrackId: string | null;
  latestTrackKey: string | null;
  firstTrackKey: string | null;
}) {
  const displayTrack = createDisplayTrack(track);
  const isActiveTrack = Boolean(activeTrackId && track.id === activeTrackId);
  const leadBadgeLabel = getTrackBadgeLabel(track, latestTrackKey, firstTrackKey);

  return (
    <article
      className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/52 shadow-[0_14px_30px_rgba(2,6,23,0.34)]"
      style={buildActiveTrackStyle(isActiveTrack)}
      title={track.name ?? track.albumName ?? undefined}
    >
      <div className="flex flex-col gap-3 p-3">
        <div className="min-w-0">
          {leadBadgeLabel ? <LeadBadge label={leadBadgeLabel} /> : null}
          <p className={`truncate font-semibold text-slate-50 ${leadBadgeLabel ? "mt-3 text-sm" : "text-sm"}`}>
            {displayTrack.name || "Unknown track"}
          </p>
          <p className="mt-1 truncate text-[11px] text-slate-300">
            {displayTrack.artistName || displayTrack.albumName || "Unknown artist"}
          </p>
          {displayTrack.addedBy && <p className="mt-1 truncate text-[11px] text-slate-400">added by {displayTrack.addedBy}</p>}
        </div>
        <ArtworkTile
          imageUrl={displayTrack.imageUrl}
          alt={displayTrack.albumName ?? displayTrack.name ?? "Album art"}
          className="aspect-square w-full overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,#263870,#0a1124_78%)]"
        />
      </div>
    </article>
  );
}

function MobilePlaylistEmptyState() {
  return (
    <div className="mt-3 rounded-[24px] border border-white/10 bg-slate-950/40 px-4 py-5 text-center text-sm text-slate-300">
      No songs in the playlist yet.
    </div>
  );
}

function MobilePlaylistHeader({ itemCount }: { itemCount: number }) {
  return (
    <div className="w-full border-b border-white/10 px-1 pb-3">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-indigo-200/70">Playlist</p>
        <p className="mt-1 text-sm text-slate-200">{itemCount > 0 ? `${itemCount} songs, latest to first` : "No songs loaded"}</p>
      </div>
    </div>
  );
}

function MobilePlaylistPanel({
  items,
  activeTrackId,
  latestTrackKey,
  firstTrackKey,
}: {
  items: PlaylistTrackView[];
  activeTrackId: string | null;
  latestTrackKey: string | null;
  firstTrackKey: string | null;
}) {
  return (
    <div
      data-orbit-drag-ignore="true"
      className="pointer-events-auto mt-4 grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/38 p-3 backdrop-blur-md lg:hidden"
    >
      <MobilePlaylistHeader itemCount={items.length} />

      {items.length > 0 ? (
        <div
          data-orbit-drag-ignore="true"
          className="mt-3 min-h-0 w-full overflow-y-auto overscroll-contain pr-1 touch-pan-y [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent]"
        >
          <div className="space-y-3">
            {items.map((track) => (
              <MobilePlaylistCard
                key={`${track.uri}-${track.addedAt ?? track.id ?? track.name}`}
                track={track}
                activeTrackId={activeTrackId}
                latestTrackKey={latestTrackKey}
                firstTrackKey={firstTrackKey}
              />
            ))}
          </div>
        </div>
      ) : (
        <MobilePlaylistEmptyState />
      )}
    </div>
  );
}

export default MobilePlaylistPanel;
