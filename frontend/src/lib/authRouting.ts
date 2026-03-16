import { Location } from "react-router-dom";
import { JIT_CAFE_BASE_PATH, isJitCafePath } from "../features/jitCafe/lib/paths";

export type LoginRouteState = {
  from?: Pick<Location, "pathname" | "search" | "hash">;
  backgroundLocation?: Location;
};

const CHROMELESS_PATHS = new Set(["/add-to-the-aux", "/tic-tac-toe", JIT_CAFE_BASE_PATH]);
const VIEWPORT_LOCKED_PATHS = new Set(["/add-to-the-aux"]);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export const getShellPathname = (location: Location): string => {
  const state = location.state as LoginRouteState | null;
  return normalizePathname(state?.backgroundLocation?.pathname ?? location.pathname);
};

export const isChromelessPath = (pathname: string): boolean => {
  const normalizedPathname = normalizePathname(pathname);
  return CHROMELESS_PATHS.has(normalizedPathname) || isJitCafePath(normalizedPathname);
};

export const isViewportLockedPath = (pathname: string): boolean => VIEWPORT_LOCKED_PATHS.has(normalizePathname(pathname));

export const buildLoginRouteState = (location: Location): LoginRouteState => ({
  from: {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  },
  backgroundLocation: location,
});
