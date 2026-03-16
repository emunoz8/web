import { useEffect, useState } from "react";

const GUEST_PREVIEW_MS = 5 * 60 * 1000;
const GUEST_PREVIEW_KEY = "add-to-the-aux-guest-preview-started-at";

function getOrCreateGuestPreviewStart(): number {
  const stored = sessionStorage.getItem(GUEST_PREVIEW_KEY);
  const parsed = stored ? Number(stored) : Number.NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  const startedAt = Date.now();
  sessionStorage.setItem(GUEST_PREVIEW_KEY, String(startedAt));
  return startedAt;
}

export function useGuestPreview(isAuthenticated: boolean, sessionReady = true): boolean {
  const [guestPreviewExpired, setGuestPreviewExpired] = useState(false);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    if (isAuthenticated) {
      sessionStorage.removeItem(GUEST_PREVIEW_KEY);
      setGuestPreviewExpired(false);
      return;
    }

    const startedAt = getOrCreateGuestPreviewStart();
    const expiresAt = startedAt + GUEST_PREVIEW_MS;
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      setGuestPreviewExpired(true);
      return;
    }

    setGuestPreviewExpired(false);
    const timeoutId = window.setTimeout(() => {
      setGuestPreviewExpired(true);
    }, remainingMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, sessionReady]);

  return guestPreviewExpired;
}
