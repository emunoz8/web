import { useCallback, useState } from "react";
import { buildApiUrl, fetchJson } from "../lib/api";
import type { TrackSearchResult } from "../types/spotify";

export type UseAddTrackResult = {
  addingUri: string;
  actionError: string;
  addTrack: (track: TrackSearchResult) => Promise<boolean>;
};

export function useAddTrack(onAdded: () => Promise<void>, token: string | null): UseAddTrackResult {
  const [addingUri, setAddingUri] = useState("");
  const [actionError, setActionError] = useState("");

  const addTrack = useCallback(
    async (track: TrackSearchResult): Promise<boolean> => {
      if (!token) {
        setActionError("Login required to add songs.");
        return false;
      }

      setAddingUri(track.uri);
      setActionError("");

      try {
        await fetchJson(buildApiUrl("/playlist/items"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ uri: track.uri }),
        });

        await onAdded();
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to add track.";
        if (message.toLowerCase().includes("unauthorized")) {
          setActionError("Login required to add songs.");
          return false;
        }
        setActionError(
          message.toLowerCase().includes("song already in playlist")
            ? "Song already in playlist"
            : message,
        );
        return false;
      } finally {
        setAddingUri("");
      }
    },
    [onAdded, token],
  );

  return {
    addingUri,
    actionError,
    addTrack,
  };
}
