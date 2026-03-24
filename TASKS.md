# Website Tasks

## In Progress / Immediate

- [ ] Commit all frontend changes (17 modified files + new untracked files)
- [ ] Push to origin (currently 1 commit ahead)

---

## Cleanup

- [ ] Delete or relocate `JIT_cafe/` from repo root (the actual JIT Cafe lives in `frontend/src/features/jitCafe/`)
- [ ] Delete `live_home.html` and `critique_share.html` from repo root if no longer needed
- [ ] Remove dead `REACT_APP_` env var prefix support in `frontend/src/lib/env.ts` (project is fully on Vite)
- [ ] Remove unused `bucket4j-redis` dependency from backend `pom.xml`
- [ ] Fix dead conditional in `AppShellContent` — both branches of the terminal mode check apply the same CSS class

---

## Code Quality

- [ ] Convert `ContentController.getBySlug` and `getById` to return DTOs instead of raw JPA entities
- [ ] Add user ID to JWT claims to eliminate per-request DB lookup in `CommentController.currentUserId()` and `ContentController.resolveCurrentUserId()`
- [ ] Unify `AdminContentController.deleteContent()` to use a single `ContentService.delete(id)` instead of calling both project and blog post services

---

## Infrastructure

- [ ] Address per-instance rate limiting — `RateLimiterService` uses in-memory `ConcurrentHashMap`; Cloud Run multi-instance deployments have independent buckets
- [ ] Address per-instance Caffeine cache — cache invalidation on writes only affects the writing instance
- [ ] Decide whether to wire up Redis for shared rate limiting / caching, or document the current limitation

---

## Backend (separate repo)

- [ ] Set up a dedicated git repo for the backend
- [ ] Commit the large untracked feature wave: Google auth, Spotify/AddToTheAux, Category system, Admin bootstrap, new tests
