import { useCallback, useState } from "react";
import { buildApiUrl, fetchJson } from "../lib/api";
import type { TrackSearchResult } from "../types/spotify";

export type UseAddTrackResult = {
  addingUri: string;
  actionError: string;
  addTrack: (track: TrackSearchResult) => Promise<boolean>;
};

export function useAddTrack(onAdded: () => Promise<void>, enabled: boolean): UseAddTrackResult {
  const [addingUri, setAddingUri] = useState("");
  const [actionError, setActionError] = useState("");

  const addTrack = useCallback(
    async (track: TrackSearchResult): Promise<boolean> => {
      if (!enabled) {
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
          },
          body: JSON.stringify({ uri: track.uri }),
        });

        await onAdded();
        return true;
      } catch (error) {
        const status = (error as { status?: number }).status;
        if (status === 401 || status === 403) {
          setActionError("Login required to add songs.");
          return false;
        }
        const message = error instanceof Error ? error.message : "Unable to add track.";
        setActionError(status === 409 ? "Song already in playlist" : message);
        return false;
      } finally {
        setAddingUri("");
      }
    },
    [enabled, onAdded],
  );

  return {
    addingUri,
    actionError,
    addTrack,
  };
}
