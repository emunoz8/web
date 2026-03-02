import { useEffect, useRef, useState } from "react";
import { buildApiUrl, fetchJson } from "../lib/api";
import type { CurrentlyPlayingResponse } from "../types/spotify";

const POLL_INTERVAL_MS = 15000;

export function useCurrentlyPlaying(enabled = true) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlayingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentlyPlayingRef = useRef<CurrentlyPlayingResponse | null>(null);

  useEffect(() => {
    currentlyPlayingRef.current = currentlyPlaying;
  }, [currentlyPlaying]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    let timeoutId: number | null = null;

    async function loadCurrentlyPlaying() {
      if (document.visibilityState === "hidden") {
        scheduleNextPoll();
        return;
      }

      try {
        if (!cancelled && currentlyPlayingRef.current !== null) {
          setLoading(true);
        }

        const payload = await fetchJson<CurrentlyPlayingResponse>(buildApiUrl("/currently-playing"));
        if (!cancelled) {
          setCurrentlyPlaying(payload);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unable to load player.";
          setCurrentlyPlaying(null);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          scheduleNextPoll();
        }
      }
    }

    function scheduleNextPoll() {
      if (cancelled) {
        return;
      }
      timeoutId = window.setTimeout(() => {
        void loadCurrentlyPlaying();
      }, POLL_INTERVAL_MS);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && !cancelled) {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        void loadCurrentlyPlaying();
      }
    }

    void loadCurrentlyPlaying();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled]);

  return {
    currentlyPlaying,
    currentlyPlayingLoading: loading,
    currentlyPlayingError: error,
  };
}
