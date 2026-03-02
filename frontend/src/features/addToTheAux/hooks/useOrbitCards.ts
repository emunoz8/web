import { useEffect, useState } from "react";
import { EXIT_ANIMATION_MS, createOrbitCardState, mergeOrbitCards, type OrbitCardState } from "../lib/orbitStage";
import type { PlaylistTrackView } from "../types/spotify";

export function useOrbitCards(visiblePlaylistItems: PlaylistTrackView[]): OrbitCardState[] {
  const [orbitCards, setOrbitCards] = useState<OrbitCardState[]>(() =>
    visiblePlaylistItems.map((track, slotIndex) => createOrbitCardState(track, slotIndex, "active")),
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setOrbitCards((currentCards) => mergeOrbitCards(currentCards, visiblePlaylistItems));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [visiblePlaylistItems]);

  useEffect(() => {
    if (!orbitCards.some((card) => card.status === "exiting")) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setOrbitCards((currentCards) => currentCards.filter((card) => card.status !== "exiting"));
    }, EXIT_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [orbitCards]);

  useEffect(() => {
    if (!orbitCards.some((card) => card.status === "entering")) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      setOrbitCards((currentCards) =>
        currentCards.map((card) => (card.status === "entering" ? { ...card, status: "active" } : card)),
      );
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [orbitCards]);

  return orbitCards;
}
