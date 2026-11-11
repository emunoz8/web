import { useCallback, useMemo, useState } from "react";
import { getLocalAuxPlaylist } from "../data/localAuxData";
import type { PlaylistTrackView, PlaylistViewResponse } from "../types/spotify";

export type UsePlaylistResult = {
  playlist: PlaylistViewResponse | null;
  playlistLoading: boolean;
  playlistError: string;
  orderedPlaylistItems: PlaylistTrackView[];
  visiblePlaylistItems: PlaylistTrackView[];
  showingCount: number;
  totalTracks: number;
  loadPlaylist: () => Promise<void>;
};

export function usePlaylist(visibleCount: number): UsePlaylistResult {
  const [playlist, setPlaylist] = useState<PlaylistViewResponse | null>(() => getLocalAuxPlaylist());

  const loadPlaylist = useCallback(async () => {
    setPlaylist(getLocalAuxPlaylist());
  }, []);

  const orderedPlaylistItems = useMemo(() => {
    const items = [...(playlist?.items ?? [])];
    return items.sort((left, right) => {
      const leftTime = left.addedAt ? Date.parse(left.addedAt) : 0;
      const rightTime = right.addedAt ? Date.parse(right.addedAt) : 0;
      return rightTime - leftTime;
    });
  }, [playlist]);

  const visiblePlaylistItems = useMemo(
    () => orderedPlaylistItems.slice(0, visibleCount),
    [orderedPlaylistItems, visibleCount],
  );

  const showingCount = visiblePlaylistItems.length;
  const totalTracks = playlist?.totalTracks ?? showingCount;

  return {
    playlist,
    playlistLoading: false,
    playlistError: "",
    orderedPlaylistItems,
    visiblePlaylistItems,
    showingCount,
    totalTracks,
    loadPlaylist,
  };
}
