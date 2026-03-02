import { useCallback, useEffect, useMemo, useState } from "react";
import { buildApiUrl, fetchJson } from "../lib/api";
import type { PlaylistTrackView, PlaylistViewResponse } from "../types/spotify";

export type UsePlaylistResult = {
  playlist: PlaylistViewResponse | null;
  playlistLoading: boolean;
  playlistError: string;
  visiblePlaylistItems: PlaylistTrackView[];
  showingCount: number;
  totalTracks: number;
  loadPlaylist: () => Promise<void>;
};

export function usePlaylist(visibleCount: number): UsePlaylistResult {
  const [playlist, setPlaylist] = useState<PlaylistViewResponse | null>(null);
  const [playlistLoading, setPlaylistLoading] = useState(true);
  const [playlistError, setPlaylistError] = useState("");

  const loadPlaylist = useCallback(async () => {
    setPlaylistLoading(true);
    setPlaylistError("");

    try {
      const payload = await fetchJson<PlaylistViewResponse>(buildApiUrl("/playlist"));
      setPlaylist(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load playlist.";
      setPlaylist(null);
      setPlaylistError(message);
    } finally {
      setPlaylistLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlaylist();
  }, [loadPlaylist]);

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
    playlistLoading,
    playlistError,
    visiblePlaylistItems,
    showingCount,
    totalTracks,
    loadPlaylist,
  };
}
