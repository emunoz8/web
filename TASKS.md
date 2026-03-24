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
- [ ] Remove unused `bucket4j-redis` dependency from backend `pom.xml`
- [x] Fix dead conditional in `AppShellContent` — both branches of the terminal mode check apply the same CSS class

---

## Code Quality

- [x] Convert `ContentController.getBySlug` and `getById` to return `ContentDetailDto` instead of raw JPA entities (new `ContentDetailDto` includes categories)
- [x] Add `userId` to JWT claims; store as credentials in `JwtAuthFilter`; eliminate per-request DB lookup in `CommentController`, `ContentController`, `LikeController`
- [x] Unify `AdminContentController.deleteContent()` — now uses `ContentService.delete(id)` with proper cache eviction
- [x] Add `@Transactional(readOnly=true)` to `ContentService.getBySlug` and `getById`; initialize lazy `categories` collection before caching

---

## Infrastructure

- [ ] Address per-instance rate limiting — `RateLimiterService` uses in-memory `ConcurrentHashMap`; Cloud Run multi-instance deployments have independent buckets
- [ ] Address per-instance Caffeine cache — cache invalidation on writes only affects the writing instance
- [ ] Decide whether to wire up Redis for shared rate limiting / caching, or document the current limitation

---

## Backend (separate repo)

- [ ] Set up a dedicated git repo for the backend
- [ ] Commit the large untracked feature wave: Google auth, Spotify/AddToTheAux, Category system, Admin bootstrap, new tests
