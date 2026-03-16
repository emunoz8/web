import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../lib/api";
import { fetchWithCsrf } from "../lib/csrf";

type AuthSession = {
  username: string;
  email: string;
  roles: string[];
  canChangeUsername: boolean;
};

type AuthContextValue = {
  authLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  email: string | null;
  canChangeUsername: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

type MessagePayload = {
  message?: unknown;
};

type SessionResponse = {
  username?: unknown;
  email?: unknown;
  roles?: unknown;
  canChangeUsername?: unknown;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_ERROR_MESSAGE = "Authentication request failed.";

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybe = payload as MessagePayload;
  return typeof maybe.message === "string" && maybe.message.trim() !== "" ? maybe.message : null;
}

function normalizeSession(payload: SessionResponse): AuthSession {
  return {
    username: typeof payload.username === "string" ? payload.username : "",
    email: typeof payload.email === "string" ? payload.email : "",
    roles: Array.isArray(payload.roles) ? payload.roles.filter((role): role is string => typeof role === "string") : [],
    canChangeUsername: payload.canChangeUsername !== false,
  };
}

async function readJsonSafe(response: Response): Promise<unknown | undefined> {
  const raw = await response.text();
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function throwFromResponse(response: Response, fallback: string): Promise<never> {
  const payload = await readJsonSafe(response);
  throw new Error(extractMessage(payload) ?? fallback);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<void> => {
    setAuthLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/session"), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        setSession(null);
        return;
      }

      if (!response.ok) {
        await throwFromResponse(response, `Could not load session (${response.status}).`);
      }

      const payload = (await response.json()) as SessionResponse;
      setSession(normalizeSession(payload));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession().catch(() => {
      setSession(null);
    });
  }, [refreshSession]);

  const login = useCallback(
    async (usernameInput: string, passwordInput: string): Promise<void> => {
      const response = await fetchWithCsrf(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      if (!response.ok) {
        await throwFromResponse(response, `Login failed (${response.status}).`);
      }

      await refreshSession();
    },
    [refreshSession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<void> => {
      const response = await fetchWithCsrf(apiUrl("/api/auth/google"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
        }),
      });

      if (!response.ok) {
        await throwFromResponse(response, `Google login failed (${response.status}).`);
      }

      await refreshSession();
    },
    [refreshSession],
  );

  const updateUsername = useCallback(
    async (nextUsername: string): Promise<void> => {
      if (!session) {
        throw new Error("You must be logged in.");
      }

      const response = await fetchWithCsrf(apiUrl("/api/users/me/username"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: nextUsername,
        }),
      });

      if (!response.ok) {
        await throwFromResponse(response, `Username update failed (${response.status}).`);
      }

      await refreshSession();
    },
    [refreshSession, session],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const response = await fetchWithCsrf(apiUrl("/api/auth/logout"), {
        method: "POST",
      });

      if (!response.ok && response.status !== 401 && response.status !== 403) {
        await throwFromResponse(response, DEFAULT_ERROR_MESSAGE);
      }
    } finally {
      setSession(null);
      setAuthLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = session !== null;
    const roles = session?.roles ?? [];

    return {
      authLoading,
      isAuthenticated,
      isAdmin: roles.includes("ROLE_ADMIN"),
      username: session?.username ?? null,
      email: session?.email ?? null,
      canChangeUsername: session?.canChangeUsername ?? false,
      login,
      loginWithGoogle,
      updateUsername,
      logout,
      refreshSession,
    };
  }, [authLoading, login, loginWithGoogle, logout, refreshSession, session, updateUsername]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
