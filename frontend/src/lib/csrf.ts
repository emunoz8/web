import { apiUrl } from "./api";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

let pendingTokenRequest: Promise<string | null> | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const cookieName = decodeURIComponent(cookie.slice(0, separatorIndex));
    if (cookieName !== name) {
      continue;
    }

    return decodeURIComponent(cookie.slice(separatorIndex + 1));
  }

  return null;
}

async function requestTokenFromServer(): Promise<string | null> {
  const response = await fetch(apiUrl("/api/auth/csrf"), {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Could not initialize CSRF protection (${response.status}).`);
  }

  let bodyToken: string | null = null;
  try {
    const payload = (await response.json()) as { token?: unknown };
    bodyToken = typeof payload.token === "string" ? payload.token : null;
  } catch {
    bodyToken = null;
  }

  return readCookie(CSRF_COOKIE_NAME) ?? bodyToken;
}

export function readCsrfToken(): string | null {
  return readCookie(CSRF_COOKIE_NAME);
}

export async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCsrfToken();
  if (existing) {
    return existing;
  }

  if (!pendingTokenRequest) {
    pendingTokenRequest = requestTokenFromServer().finally(() => {
      pendingTokenRequest = null;
    });
  }

  return pendingTokenRequest;
}

export async function fetchWithCsrf(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers ?? undefined);

  if (!SAFE_METHODS.has(method)) {
    const token = await ensureCsrfToken();
    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    }
  }

  return fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });
}
