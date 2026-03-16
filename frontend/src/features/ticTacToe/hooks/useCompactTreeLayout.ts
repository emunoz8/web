import { useEffect, useState } from "react";

const COMPACT_MEDIA_QUERY = "(max-width: 860px)";

export function useCompactTreeLayout(): boolean {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(COMPACT_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(COMPACT_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsCompact(event.matches);
    };

    setIsCompact(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isCompact;
}
