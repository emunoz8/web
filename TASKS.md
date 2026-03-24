# Website Tasks

## In Progress / Immediate

- [x] Commit all frontend changes (17 modified files + new untracked files)
- [x] Push to origin

---

## Cleanup

- [x] Delete `live_home.html` from repo root (stale CRA build artifact)
- [x] Delete `critique_share.html` from repo root
- [ ] `JIT_cafe/` at repo root is a standalone client restaurant app with its own handoff doc (`REPO-HANDOFF.md`) — move it to its own git repo when ready
- [x] Remove dead `REACT_APP_` env var prefix support in `frontend/src/lib/env.ts` (project is fully on Vite)
- [ ] Remove unused `bucket4j-redis` dependency from backend `pom.xml`
- [x] Fix dead conditional in `AppShellContent` — both branches of the terminal mode check apply the same CSS class

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
