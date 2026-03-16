import type { PlaylistTrackView } from "../types/spotify";
import { ArtworkTile, LeadBadge, createDisplayTrack, getTrackBadgeLabel } from "./orbitStageShared";

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
      className={`aux-mobile-playlist-card${isActiveTrack ? " aux-mobile-playlist-card-active" : ""}`}
      title={track.name ?? track.albumName ?? undefined}
    >
      <div className="aux-mobile-playlist-card-body">
        <div>
          {leadBadgeLabel ? <LeadBadge label={leadBadgeLabel} /> : null}
          <p className={`aux-mobile-playlist-title${leadBadgeLabel ? " aux-mobile-playlist-title-with-badge" : ""}`}>
            {displayTrack.name || "Unknown track"}
          </p>
          <p className="aux-mobile-playlist-meta">
            {displayTrack.artistName || displayTrack.albumName || "Unknown artist"}
          </p>
          {displayTrack.addedBy && <p className="aux-mobile-playlist-submeta">added by {displayTrack.addedBy}</p>}
        </div>
        <ArtworkTile
          imageUrl={displayTrack.imageUrl}
          alt={displayTrack.albumName ?? displayTrack.name ?? "Album art"}
          className="aux-mobile-playlist-artwork"
        />
      </div>
    </article>
  );
}

function MobilePlaylistEmptyState() {
  return (
    <div className="aux-mobile-playlist-empty">
      No songs in the playlist yet.
    </div>
  );
}

function MobilePlaylistHeader({ itemCount }: { itemCount: number }) {
  return (
    <div className="aux-mobile-playlist-header">
      <div>
        <p className="aux-mobile-playlist-kicker">Playlist</p>
        <p className="aux-mobile-playlist-copy">{itemCount > 0 ? `${itemCount} songs, latest to first` : "No songs loaded"}</p>
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
      className="aux-mobile-playlist-panel"
    >
      <MobilePlaylistHeader itemCount={items.length} />

      {items.length > 0 ? (
        <div
          data-orbit-drag-ignore="true"
          className="aux-mobile-playlist-scroll"
        >
          <div className="aux-mobile-playlist-list">
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
