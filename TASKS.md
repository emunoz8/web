# Website Tasks

## In Progress / Immediate

- [x] Commit all frontend changes (17 modified files + new untracked files)
- [x] Push to origin

---

## Cleanup

- [x] Delete `live_home.html` from repo root (stale CRA build artifact)
- [x] Delete `critique_share.html` from repo root
- [x] Delete `JIT_cafe/` from repo root
- [x] Remove dead `REACT_APP_` env var prefix support in `frontend/src/lib/env.ts` (project is fully on Vite)
- [x] Remove unused `bucket4j-redis` dependency from backend `pom.xml`
- [x] Fix dead conditional in `AppShellContent` — both branches of the terminal mode check apply the same CSS class

---

## Code Quality

- [x] Convert `ContentController.getBySlug` and `getById` to return `ContentDetailDto` instead of raw JPA entities (new `ContentDetailDto` includes categories)
- [x] Add `userId` to JWT claims; store as credentials in `JwtAuthFilter`; eliminate per-request DB lookup in `CommentController`, `ContentController`, `LikeController`
- [x] Unify `AdminContentController.deleteContent()` — now uses `ContentService.delete(id)` with proper cache eviction
- [x] Add `@Transactional(readOnly=true)` to `ContentService.getBySlug` and `getById`; initialize lazy `categories` collection before caching

---

## Infrastructure

- [x] Set `--min-instances 1 --max-instances 1` in `deploy-cloudrun-production.ps1` — single instance keeps rate-limit buckets and Caffeine caches consistent; comment in script documents the Redis upgrade path if scaling is ever needed

---

## Backend (separate repo)

- [x] Set up dedicated git repo: https://github.com/emunoz8/web_backend.git
- [x] Initial commit: all source, Google auth, Spotify/AddToTheAux, Category system, Admin bootstrap, full test suite (156 files)

---

## Round 2 — Code Review Findings

### Critical (runtime crashes)
- [x] **`LikeService`** — `getReferenceById()` used without existence check; replace with `findById()` + proper 404
- [x] **`CommentController.userId()`** — unchecked cast of `auth.getCredentials()` to `Long`; add null check
- [x] **`ContentController.resolveCurrentUserId()`** — already null-safe via `instanceof` pattern; no change needed

### High (UX / stability)
- [x] **`PrivateRoute.tsx`** — returns `null` while auth is loading, causing blank screen; show a spinner instead
- [x] **`useAddTrack.ts`** — error detection uses fragile string matching (`.includes()`); switch to HTTP status codes (401/403)
- [x] **`useCurrentlyPlaying.ts`** — `setLoading(true)` skipped on first load because ref is null; initial load has no loading state

### Medium (performance / validation)
- [x] **`CommentService`** — N+1 query: `toDto()` accesses lazy `comment.getUser()` per row; use JOIN FETCH in repository
- [x] **`AdminContentController`** — `@Valid` missing on `@RequestBody` params; bad input reaches service layer
- [x] **`GlobalExceptionHandler`** — catch-all already logs exception correctly; no change needed

### Low (code quality)
- [x] **`JwtService.java`** — duplicate imports (`java.util.Date`, `java.util.UUID` imported twice)
- [x] **`SpotifyPlaylistTestingService`** — `items()` null guards already present throughout; no change needed
