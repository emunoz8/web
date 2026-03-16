import { useEffect, useMemo, useState } from "react";
import { buildApiUrl, fetchJson } from "../lib/api";
import type { TrackSearchResponse, TrackSearchResult } from "../types/spotify";

export type UseTrackSearchResult = {
  query: string;
  setQuery: (value: string) => void;
  trimmedQuery: string;
  searchResults: TrackSearchResult[];
  searchLoading: boolean;
  searchError: string;
};

export function useTrackSearch(minQueryLength: number, limit: number, enabled: boolean): UseTrackSearchResult {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrackSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!enabled) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    if (trimmedQuery.length < minQueryLength) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const payload = await fetchJson<TrackSearchResponse>(
          buildApiUrl("/track-search", {
            q: trimmedQuery,
            limit,
          }),
          {
            signal: controller.signal,
          },
        );
        setSearchResults(Array.isArray(payload.tracks) ? payload.tracks : []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to search tracks.";
        setSearchResults([]);
        setSearchError(message.toLowerCase().includes("unauthorized") ? "Login required to search tracks." : message);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [enabled, limit, minQueryLength, trimmedQuery]);

  return {
    query,
    setQuery,
    trimmedQuery,
    searchResults,
    searchLoading,
    searchError,
  };
}
