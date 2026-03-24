import type { ApiError } from "../types/spotify";
import { fetchWithCsrf } from "../../../lib/csrf";
import { auxApiBaseEnv, auxApiPrefixEnv } from "../../../lib/env";

type ApiSearchParams = Record<string, string | number | boolean | null | undefined>;

const DEFAULT_API_PREFIX = "/api/testing";
const apiBaseUrl = auxApiBaseEnv.replace(/\/+$/, "");
const apiPrefix = normalizeApiPrefix(auxApiPrefixEnv || DEFAULT_API_PREFIX);

function normalizeApiPrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_API_PREFIX;
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function trimLeadingSlash(value: string): string {
  return value.replace(/^\/+/, "");
}

export function buildApiUrl(path: string, searchParams?: ApiSearchParams): string {
  const normalizedPath = trimLeadingSlash(path);
  const relativePath = `${apiPrefix}/${normalizedPath}`;

  if (!apiBaseUrl) {
    const relativeUrl = new URL(relativePath, window.location.origin);
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          relativeUrl.searchParams.set(key, String(value));
        }
      });
    }
    return `${relativeUrl.pathname}${relativeUrl.search}`;
  }

  const absoluteUrl = new URL(trimLeadingSlash(relativePath), withTrailingSlash(apiBaseUrl));
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        absoluteUrl.searchParams.set(key, String(value));
      }
    });
  }

  return absoluteUrl.toString();
}

export async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiError;
    if (payload.message) {
      return payload.message;
    }
    if (payload.detail) {
      return payload.detail;
    }
    if (payload.error) {
      return payload.error.replace(/_/g, " ");
    }
  } catch {
    return `Request failed with ${response.status}`;
  }

  return `Request failed with ${response.status}`;
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetchWithCsrf(input, init);
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
