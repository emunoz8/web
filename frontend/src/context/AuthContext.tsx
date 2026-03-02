import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../lib/api";

type JwtClaims = {
  sub?: string;
  email?: string;
  exp?: number;
  roles?: string[];
  canChangeUsername?: boolean;
};

type AuthContextValue = {
  token: string | null;
  claims: JwtClaims | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  canChangeUsername: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = "token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseJwtClaims = (token: string): JwtClaims | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payloadPart = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadPart.padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded) as JwtClaims;
    return parsed;
  } catch {
    return null;
  }
};

const isExpired = (claims: JwtClaims | null): boolean => {
  if (!claims?.exp) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return claims.exp <= now;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      return null;
    }
    const claims = parseJwtClaims(stored);
    if (!claims || isExpired(claims)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return stored;
  });

  const claims = useMemo(() => (token ? parseJwtClaims(token) : null), [token]);
  const isAuthenticated = !!token && !isExpired(claims);
  const roleList = claims?.roles ?? [];
  const isAdmin = roleList.includes("ROLE_ADMIN");
  const username = claims?.sub ?? null;
  const canChangeUsername = claims?.canChangeUsername !== false;

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<void> => {
    const response = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });

    const raw = await response.text();
    let parsed: { token?: string; message?: string } = {};
    try {
      parsed = raw ? (JSON.parse(raw) as { token?: string; message?: string }) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok || !parsed?.token) {
      const fallback = `Login failed (${response.status})`;
      const msg = typeof parsed.message === "string" ? parsed.message : fallback;
      throw new Error(msg);
    }

    const nextToken = parsed.token;
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
  }, []);

  const updateUsername = useCallback(async (nextUsername: string): Promise<void> => {
    if (!token) {
      throw new Error("You must be logged in.");
    }

    const response = await fetch(apiUrl("/api/users/me/username"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: nextUsername,
      }),
    });

    const raw = await response.text();
    let parsed: { token?: string; message?: string } = {};
    try {
      parsed = raw ? (JSON.parse(raw) as { token?: string; message?: string }) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok || !parsed?.token) {
      const fallback = `Username update failed (${response.status})`;
      const msg = typeof parsed.message === "string" ? parsed.message : fallback;
      throw new Error(msg);
    }

    const newToken = parsed.token;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, [token]);

  const loginWithGoogle = useCallback(async (idToken: string): Promise<void> => {
    const response = await fetch(apiUrl("/api/auth/google"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
      }),
    });

    const raw = await response.text();
    let parsed: { token?: string; message?: string } = {};
    try {
      parsed = raw ? (JSON.parse(raw) as { token?: string; message?: string }) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok || !parsed?.token) {
      const fallback = `Google login failed (${response.status})`;
      const msg = typeof parsed.message === "string" ? parsed.message : fallback;
      throw new Error(msg);
    }

    const nextToken = parsed.token;
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  useEffect(() => {
    if (token && !isAuthenticated) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  }, [token, isAuthenticated]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      claims,
      isAuthenticated,
      isAdmin,
      username,
      canChangeUsername,
      login,
      loginWithGoogle,
      updateUsername,
      logout,
    }),
    [token, claims, isAuthenticated, isAdmin, username, canChangeUsername, login, loginWithGoogle, updateUsername, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
