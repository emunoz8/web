import { useMemo, useState } from "react";
import { searchLocalAuxTracks } from "../data/localAuxData";
import type { TrackSearchResult } from "../types/spotify";

export type UseTrackSearchResult = {
  query: string;
  setQuery: (value: string) => void;
  trimmedQuery: string;
  searchResults: TrackSearchResult[];
  searchLoading: boolean;
  searchError: string;
};

export function useTrackSearch(minQueryLength: number, limit: number, enabled = true): UseTrackSearchResult {
  const [query, setQuery] = useState("");
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const searchResults = useMemo(() => {
    if (!enabled || trimmedQuery.length < minQueryLength) {
      return [];
    }
    return searchLocalAuxTracks(trimmedQuery, limit);
  }, [enabled, limit, minQueryLength, trimmedQuery]);

  return {
    query,
    setQuery,
    trimmedQuery,
    searchResults,
    searchLoading: false,
    searchError: "",
  };
}
