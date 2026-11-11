import { useEffect, useState } from "react";
import { getLocalCurrentlyPlaying } from "../data/localAuxData";
import type { CurrentlyPlayingResponse } from "../types/spotify";

const TICK_INTERVAL_MS = 5000;

export function useCurrentlyPlaying(enabled = true) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlayingResponse | null>(() =>
    enabled ? getLocalCurrentlyPlaying() : null,
  );

  useEffect(() => {
    if (!enabled) {
      setCurrentlyPlaying(null);
      return;
    }

    setCurrentlyPlaying(getLocalCurrentlyPlaying());

    const intervalId = window.setInterval(() => {
      setCurrentlyPlaying((current) => {
        const nextProgress = (current?.progressMs ?? 94000) + TICK_INTERVAL_MS;
        return getLocalCurrentlyPlaying(nextProgress);
      });
    }, TICK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return {
    currentlyPlaying,
    currentlyPlayingLoading: false,
    currentlyPlayingError: "",
  };
}
