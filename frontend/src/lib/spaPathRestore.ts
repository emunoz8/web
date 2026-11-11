/**
 * Pure helpers matching the static-host 404 redirect (`public/404.html`)
 * and SPA path restoration (`index.html`) contract.
 */

export function encodeSpaRedirectUrl(
  pathname = "/",
  search = "",
  hash = "",
): string {
  const safePathname = pathname || "/";
  const encodedPath = encodeURIComponent(`${safePathname}${search}${hash}`);
  return `/?spa-path=${encodedPath}`;
}

export function restoreSpaPathFromSearch(locationSearch: string): string | null {
  const params = new URLSearchParams(locationSearch);
  const restoredPathRaw = params.get("spa-path");
  if (!restoredPathRaw) {
    return null;
  }

  // URLSearchParams.get("spa-path") already decodes the percent-encoded parameter once.
  // Do not call decodeURIComponent() again, or literal %25 / %26 / %23 sequences will corrupt or throw.
  const restoredPath = restoredPathRaw.startsWith("/")
    ? restoredPathRaw
    : `/${restoredPathRaw}`;

  params.delete("spa-path");
  const remainingQuery = params.toString();
  if (!remainingQuery) {
    return restoredPath;
  }

  const hashIndex = restoredPath.indexOf("#");
  const pathAndQuery = hashIndex >= 0 ? restoredPath.slice(0, hashIndex) : restoredPath;
  const hashFragment = hashIndex >= 0 ? restoredPath.slice(hashIndex) : "";
  const querySeparator = pathAndQuery.indexOf("?") >= 0 ? "&" : "?";

  return `${pathAndQuery}${querySeparator}${remainingQuery}${hashFragment}`;
}
