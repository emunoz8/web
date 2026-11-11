import { useCallback, useState } from "react";
import { addLocalAuxTrack } from "../data/localAuxData";
import type { TrackSearchResult } from "../types/spotify";

export type UseAddTrackResult = {
  addingUri: string;
  actionError: string;
  addTrack: (track: TrackSearchResult) => Promise<boolean>;
};

export function useAddTrack(onAdded: () => Promise<void>, enabled = true): UseAddTrackResult {
  const [addingUri, setAddingUri] = useState("");
  const [actionError, setActionError] = useState("");

  const addTrack = useCallback(
    async (track: TrackSearchResult): Promise<boolean> => {
      if (!enabled) {
        setActionError("Track addition is disabled.");
        return false;
      }

      setAddingUri(track.uri);
      setActionError("");

      try {
        const result = addLocalAuxTrack(track);
        if (result.duplicate) {
          setActionError("Song already in playlist");
          return false;
        }

        await onAdded();
        return true;
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
