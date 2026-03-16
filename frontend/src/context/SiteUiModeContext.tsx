import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export type SiteUiMode = "terminal" | "standard";

type SiteUiModeContextValue = {
  mode: SiteUiMode;
  terminalAvailable: boolean;
  setMode: (mode: SiteUiMode) => void;
  toggleMode: () => void;
};

const STORAGE_KEY = "site-ui-mode";
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

const SiteUiModeContext = createContext<SiteUiModeContextValue | undefined>(undefined);

function isSiteUiMode(value: string | null): value is SiteUiMode {
  return value === "terminal" || value === "standard";
}

function readStoredUiMode(): SiteUiMode {
  if (typeof window === "undefined") {
    return "standard";
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return isSiteUiMode(storedValue) ? storedValue : "standard";
}

function readTerminalAvailability(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return !window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export const SiteUiModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [preferredMode, setPreferredMode] = useState<SiteUiMode>(() => readStoredUiMode());
  const [terminalAvailable, setTerminalAvailable] = useState<boolean>(() => readTerminalAvailability());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateAvailability = () => {
      setTerminalAvailable(!mediaQuery.matches);
    };

    updateAvailability();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateAvailability);
      return () => {
        mediaQuery.removeEventListener("change", updateAvailability);
      };
    }

    mediaQuery.addListener(updateAvailability);
    return () => {
      mediaQuery.removeListener(updateAvailability);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const requestedMode = searchParams.get("ui");

    if (!isSiteUiMode(requestedMode)) {
      return;
    }

    if (requestedMode === "standard" || terminalAvailable) {
      setPreferredMode(requestedMode);
    }
  }, [location.search, terminalAvailable]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, preferredMode);
  }, [preferredMode]);

  const mode: SiteUiMode = terminalAvailable ? preferredMode : "standard";

  const setMode = (nextMode: SiteUiMode) => {
    if (nextMode === "terminal" && !terminalAvailable) {
      return;
    }

    setPreferredMode(nextMode);
  };

  const toggleMode = () => {
    if (!terminalAvailable) {
      return;
    }

    setPreferredMode((currentMode) => (currentMode === "terminal" ? "standard" : "terminal"));
  };

  return (
    <SiteUiModeContext.Provider value={{ mode, terminalAvailable, setMode, toggleMode }}>
      {children}
    </SiteUiModeContext.Provider>
  );
};

export const useSiteUiMode = (): SiteUiModeContextValue => {
  const context = useContext(SiteUiModeContext);

  if (!context) {
    throw new Error("useSiteUiMode must be used within SiteUiModeProvider");
  }

  return context;
};
