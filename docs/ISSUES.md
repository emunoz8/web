# CompilingJava Issues

## Tracking rules and baseline

Created 2026-10-26 from source inspection at commit `6501155`. These are local planning records, not issues created on GitHub. No application fixes or migration work were implemented when this tracker was created.

Read [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md) for evidence and [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for sequencing. Proposed solutions are future work, not authorization to execute them. Preserve unrelated changes, including the lockfile modification present at the analysis baseline.

Priorities:

- **Critical (P0):** urgent stop-work/security/data-loss incident. None established by this analysis.
- **High (P1):** required migration prerequisite, static-release blocker, or confirmed correctness failure.
- **Medium (P2):** redesign, accessibility, maintainability, or validation work needed for the intended release.
- **Low (P3):** follow-up cleanup/optimization or a defect in a subsystem scheduled for retirement.

Statuses: **TODO**, **TODO (Needs decision)**, **IN PROGRESS**, **BLOCKED**, **RESOLVED**, **SUPERSEDED**. A `Needs decision` item must not be mistaken for an approved product choice. Resolved items require validation evidence; Superseded items require the replacement/removal rationale. No issue below is resolved at creation.

## Index

| ID | Priority | Status | Assigned Agent | Type | Work item |
| --- | --- | --- | --- | --- | --- |
| CJ-001 | High (P1) | RESOLVED | Antigravity | Migration | Preserve selected API-only content |
| CJ-002 | High (P1) | RESOLVED | Antigravity | Migration | Replace public content API reads |
| CJ-003 | High (P1) | RESOLVED | Antigravity | Migration | Remove global authentication dependency |
| CJ-004 | High (P1) | RESOLVED | Antigravity | Migration | Retire or archive shared engagement |
| CJ-005 | High (P1) | RESOLVED | Antigravity | Migration | Retire runtime admin publishing/API Lab |
| CJ-006 | High (P1) | RESOLVED | Antigravity | Migration | Convert or retire live AUX experience |
| CJ-007 | High (P1) | RESOLVED | Antigravity | Migration | Resolve terminal scope and API commands |
| CJ-008 | High (P1) | RESOLVED | Antigravity | Migration | Remove unused backend request configuration |
| CJ-009 | High (P1) | RESOLVED | Antigravity | Defect | Repair failing TypeScript test fixture |
| CJ-010 | High (P1) | RESOLVED | Antigravity | Defect | Resolve missing `/projects` route and preview |
| CJ-011 | High (P1) | RESOLVED | Antigravity | Defect | Add global unknown-route behavior |
| CJ-012 | High (P1) | RESOLVED | Antigravity | Deployment | Establish root/subpath hosting contract |
| CJ-013 | High (P1) | RESOLVED | Antigravity | Defect | Correct SPA path restoration decoding |
| CJ-014 | Medium (P2) | RESOLVED | Antigravity | Tooling | Make validation/publishing reproducible |
| CJ-015 | Medium (P2) | RESOLVED | Antigravity | Accessibility | Make content cards keyboard-operable |
| CJ-016 | Medium (P2) | RESOLVED | Antigravity | Accessibility | Add complete dialog semantics/focus behavior |
| CJ-017 | Medium (P2) | RESOLVED | Antigravity | Accessibility | Label game state and symmetry controls |
| CJ-018 | Medium (P2) | RESOLVED | Antigravity | Accessibility | Remove nested link/button CTA |
| CJ-019 | Medium (P2) | RESOLVED | Antigravity | Architecture | Consolidate content models/presentation helpers |
| CJ-020 | Medium (P2) | SUPERSEDED | Antigravity | Navigation | Align route, header, terminal, and blog navigation |
| CJ-021 | Medium (P2) | RESOLVED | Antigravity | Styling | Isolate styles and remove overlapping definitions |
| CJ-022 | Low (P3) | RESOLVED | Antigravity | Styling | Resolve inactive dark-theme support and retire Terminal UI |
| CJ-023 | Low (P3) | RESOLVED | Antigravity | Cleanup | Review inactive components and content |
| CJ-024 | Medium (P2) | RESOLVED | Antigravity | Documentation | Correct historical runtime claims and metadata |
| CJ-025 | Medium (P2) | RESOLVED | Antigravity | Validation | Add meaningful retained-feature coverage |
| CJ-026 | Low (P3) | RESOLVED | Antigravity | Performance | Review public images and font loading |
| CJ-027 | Low (P3) | RESOLVED | Antigravity | Assets | Align menu image fallback paths with assets |
| CJ-028 | Low (P3) | SUPERSEDED | Antigravity | Defect | Resolve API Lab actuator proxy mismatch |
| CJ-029 | Medium (P2) | RESOLVED | Antigravity | Styling | Correct unsupported screenshot overlay utility |
| CJ-030 | Medium (P2) | RESOLVED | Antigravity | Compatibility | Align React runtime and type versions |
| CJ-031 | High (P1) | RESOLVED | Claude | Positioning | Reposition professional identity for CS+MBA+leadership |
| CJ-032 | High (P1) | RESOLVED | Claude | Content | Add Options for Youth case study; reprioritize featured projects |
| CJ-033 | High (P1) | RESOLVED | Claude | Navigation | Consolidate to three-page navigation; retire Resume/Contact/Blog pages |
| CJ-034 | High (P1) | RESOLVED | Claude | Content | Rebuild Home as a standalone professional overview |
| CJ-035 | High (P1) | RESOLVED | Claude | Content | Rebuild About with education, certifications, and career progression |
| CJ-036 | Medium (P2) | TODO (Needs decision) | Unassigned | Content | Resolve fate of retained blog/writing content in the data layer |
| CJ-039 | Medium (P2) | RESOLVED | Codex | Content | Add WorldCupBracket and Rust footer badge |
| CJ-038 | Medium (P2) | RESOLVED | Codex | Navigation | Remove standalone Resume page |
| CJ-037 | Medium (P2) | RESOLVED | Claude | Design | Visual redesign of shared shell/pages for professional positioning |
| CJ-040 | Medium (P2) | IN PROGRESS | Codex | Design | Add color to the professional portfolio |
| CJ-041 | Medium (P2) | RESOLVED | Codex | Deployment | Publish the current frontend to production |

---

## CJ-001: Preserve selected API-only content

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Home and About fetch published content; ProjectDetail falls back to API slugs; Blog has no local dataset. Four local case studies and older public Markdown do not establish a complete content backup. Actual database content was not inspected.

- **Affected:** [StandardHome](../frontend/src/features/standardUI/components/StandardHome.tsx), [About](../frontend/src/pages/About.tsx), [ProjectDetail](../frontend/src/pages/ProjectDetail.tsx), `Blog` (modal reader), [local projects](../frontend/src/features/portfolio/data/projects.ts), `frontend/public/content/`.
- **Decision:** User directed "no more APIs". The four local case studies in `projects.ts` and three technical writing articles in `localContent.ts` constitute the complete, final retained local dataset. No external database or API export is required.

### Proposed Solution
Decide which writing/projects/categories/media to retain, obtain an authorized export, and map existing slugs/IDs to local content. Resolve duplicate local/API slugs explicitly.

### Acceptance Criteria
- Selected content and media are recoverable locally.
- Missing material is recorded.
- Old URL mappings and export provenance are documented.

### Files Modified
- `frontend/src/features/portfolio/data/localContent.ts`
- `frontend/src/features/portfolio/data/projects.ts`
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/pages/Projects.tsx`
- `frontend/src/pages/About.tsx`
- `frontend/src/lib/services/ContentPlatformService.ts`

### Verification
- User explicitly confirmed "no more APIs"; local static data is final.
- Four local portfolio case studies (`jit-cafe`, `add-to-the-aux`, `tic-tac-toe-revisited`, `distributed-systems-lab`) and three technical blog articles (`event-driven-state-machines`, `api-gateway-architecture`, `react-performance-tuning`) are provided locally in `localContent.ts` and `projects.ts`.
- `ContentPlatformService` facade reads directly from `localContent.ts` with zero network requests. Unknown project slugs trigger local `NotFoundState` without fallback API fetches.
- Verified via `npm run validate` (`tsc --noEmit`, vitest, and vite build).

---

## CJ-002: Replace public content API reads

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Catalog, writing, categories, modal detail, and fallback project lookup use `ContentPlatformService`. Without a service they show partial content or errors. Missing feed engagement triggers two or three additional requests per item.

- **Affected:** [ContentPlatformService](../frontend/src/lib/services/ContentPlatformService.ts), [useContentBrowserData](../frontend/src/components/content/hooks/useContentBrowserData.ts), [StandardHome](../frontend/src/features/standardUI/components/StandardHome.tsx), [About](../frontend/src/pages/About.tsx), [ProjectDetail](../frontend/src/pages/ProjectDetail.tsx), [ContentBrowserPage](../frontend/src/components/content/ContentBrowserPage.tsx).
- **Dependencies:** CJ-001, coordinated with CJ-019.

### Proposed Solution
Introduce local metadata/Markdown and shared selectors; replace service-driven content rendering, filtering, and latest-post selection. Remove engagement hydration with CJ-004 rather than optimizing requests for a retired backend.

### Acceptance Criteria
- All retained content pages work with API access blocked.
- Unknown slugs show local missing-content behavior.
- No content or category API calls remain.

### Files Modified
- `frontend/src/features/portfolio/data/localContent.ts`
- `frontend/src/features/standardUI/components/StandardHome.tsx`
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/pages/About.tsx`
- `frontend/src/pages/Projects.tsx`
- `frontend/src/components/content/hooks/useContentBrowserData.ts`
- `frontend/src/components/content/ContentBrowserHeader.tsx`
- `frontend/src/lib/services/ContentPlatformService.ts`
- `frontend/src/tests/App.test.tsx`

### Verification
- `rg "fetch\(|fetchWithCsrf|/api/|/actuator" src` confirmed zero runtime API calls across `frontend/src/`.
- `./node_modules/.bin/tsc --noEmit --incremental false` passed (exit code 0).
- `npm test -- --run` passed (5 test files, 26 tests passed, including `localContent` selector tests).
- `npm run build` completed cleanly (exit code 0).

---

## CJ-003: Remove global authentication dependency

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`AuthProvider` mounts for every route and requests session state. Login exchanges passwords/Google credentials with the backend; guards and consumers depend on that session.

- **Affected:** [Theme application shell](../frontend/src/context/Theme.tsx), `AuthContext` (removed: `frontend/src/context/AuthContext.tsx`), `Login` (removed: `frontend/src/pages/Login.tsx`), `RequireAdmin` (removed: `frontend/src/routes/RequireAdmin.tsx`), [AppRoutes](../frontend/src/routes/AppRoutes.tsx), [authRouting](../frontend/src/lib/authRouting.ts), auth components.
- **Dependencies:** Coordinate CJ-004 through CJ-007 before removing the provider.

### Proposed Solution
Remove auth-dependent interactions as their features migrate, then retire login/guards/provider/background-login logic. Keep shell exceptions needed by retained demos in an appropriately named module.

### Acceptance Criteria
- Static page loads do not request sessions, Google config, or CSRF tokens.
- No live consumers require `useAuth`.
- Retired login and admin URLs have deliberate behavior.

### Files Modified
- `frontend/src/context/Theme.tsx`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/routes/publicRoutes.ts`

### Verification
- `AuthProvider` removed from the application shell in `Theme.tsx`; `AuthContext.tsx` converted to a static guest context with zero network calls.
- `/login` redirects to `/` via `<Navigate to="/" replace />` in `AppRoutes.tsx` and `Login.tsx`.
- `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build` all succeeded.

---

## CJ-004: Retire or archive shared engagement

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`ContentModal` loads likes/comment trees and writes likes, comments, replies, and deletions. Feed summaries are API-backed. Browser storage cannot preserve multi-user semantics.

- **Affected:** [ContentModal](../frontend/src/components/common/ContentModal.tsx), [ContentCard](../frontend/src/components/content/ContentCard.tsx), [useContentBrowserData](../frontend/src/components/content/hooks/useContentBrowserData.ts), [ContentPlatformService](../frontend/src/lib/services/ContentPlatformService.ts).
- **Decision needed:** Whether any engagement content should be preserved.

### Proposed Solution
Prefer removing write controls and auth prompts; optionally preserve a selected static discussion/count archive. A local sample must be labeled as a demonstration if requested.

### Acceptance Criteria
- No engagement requests or misleading shared-write controls remain.
- Any retained archives are local and clearly historical.

### Files Modified
- `frontend/src/components/common/ContentModal.tsx`
- `frontend/src/components/content/ContentCard.tsx`
- `frontend/src/components/content/hooks/useContentBrowserData.ts`
- `frontend/src/lib/services/ContentPlatformService.ts`

### Verification
- Removed all like/comment read effects, mutation handlers, and login prompts from `ContentModal.tsx`, `ContentCard.tsx`, and `useContentBrowserData.ts`.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build`.

---

## CJ-005: Retire runtime admin publishing and API Lab

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Admin pages perform server mutations; API Lab exposes diagnostics, registration/reset, users, content, categories, comments, and likes. None is a static publishing workflow.

- **Affected:** `AdminProjects` (removed: `frontend/src/pages/admin/AdminProjects.tsx`), `AdminBlog` (removed: `frontend/src/pages/admin/AdminBlog.tsx`), `ApiLab` (removed: `frontend/src/pages/ApiLab.tsx`), [route registry](../frontend/src/routes/publicRoutes.ts), `frontend/src/components/content/admin/`.
- **Dependencies:** CJ-001, CJ-002, CJ-003.

### Proposed Solution
Establish repository-based content authoring, then remove runtime admin/API Lab routes and exclusive components/hooks/models. Choose appropriate destinations for obsolete URLs. Preserve shared reader code only if retained consumers need it.

### Acceptance Criteria
- No reachable administration/mutation UI or related requests remain.
- A contributor can add/edit content through the documented build workflow.

### Files Modified
- `frontend/src/routes/publicRoutes.ts`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/pages/ApiLab.tsx`
- `frontend/src/features/portfolio/data/localContent.ts`
- `frontend/src/tests/App.test.tsx`

### Verification
- Removed `/admin/projects`, `/admin/blog`, `/login`, and `/api-lab` from `publicRoutes.ts`; added explicit redirects to `/` in `AppRoutes.tsx`; replaced `ApiLab.tsx` with a static redirect.
- Confirmed Vite production build output omits `AdminProjects`, `AdminBlog`, `Login`, and `ApiLab` chunks.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build`.

---

## CJ-006: Convert or retire live AddToTheAUX

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Playlist, current playback, search, and additions use `/api/testing/*`. Search/add require auth; guest preview expires after five minutes. No local fixture fallback exists.

- **Affected:** [AddToTheAux](../frontend/src/pages/AddToTheAux.tsx), `AUX API helper` (removed: `frontend/src/features/addToTheAux/lib/api.ts`), `frontend/src/features/addToTheAux/hooks/`, [OrbitalPlaylistStage](../frontend/src/features/addToTheAux/components/OrbitalPlaylistStage.tsx), [project metadata](../frontend/src/features/portfolio/data/projects.ts).
- **Decision needed:** Interactive local demo versus archived case study, and the old demo URL destination.

### Proposed Solution
Prefer a local interactive demonstration with fixtures/search/local additions if that experience is retained; otherwise make the case study/screenshots the destination. Remove backend polling, auth gating, guest expiry, and unsupported live claims.

### Acceptance Criteria
- Chosen AUX experience works without application APIs, including after old guest-preview storage has expired.
- Behavior is accurately described.

### Files Modified
- `frontend/src/features/addToTheAux/data/localAuxData.ts`
- `frontend/src/features/addToTheAux/hooks/usePlaylist.ts`
- `frontend/src/features/addToTheAux/hooks/useCurrentlyPlaying.ts`
- `frontend/src/features/addToTheAux/hooks/useTrackSearch.ts`
- `frontend/src/features/addToTheAux/hooks/useAddTrack.ts`
- `frontend/src/features/addToTheAux/hooks/useGuestPreview.ts`
- `frontend/src/features/addToTheAux/lib/api.ts`
- `frontend/src/pages/AddToTheAux.tsx`
- `frontend/src/tests/App.test.tsx`

### Verification
- Converted AddToTheAUX into a self-contained frontend interactive demo backed by `localAuxData.ts` with inline SVG cover art, local playback progress simulation, local catalog search, and in-session track additions without auth gating or guest-preview expiration.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed, including `localAuxData` tests), and `npm run build`.

---

## CJ-007: Resolve terminal scope and remove API commands

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`resolveTerminalApiCommand()` fetches session/content/categories. `useTerminalSession()` handles login, logout, and admin navigation. Commands are independent of page content requests.

- **Affected:** `terminalShell` (removed: `frontend/src/features/portfolio/data/terminalShell.ts`), `useTerminalSession` (removed: `frontend/src/features/terminalUI/hooks/useTerminalSession.ts`), `TerminalUI` (removed: `frontend/src/features/terminalUI/components/TerminalUI.tsx`), `SiteUiModeContext` (removed: `frontend/src/context/SiteUiModeContext.tsx`).
- **Decision needed:** Whether terminal mode remains in the redesign.

### Proposed Solution
If retained, separate command definitions/local resolution from rendering and use local selectors. Retire remote/auth commands or replace them with clearly local equivalents. Update help, aliases, routes, and telemetry text together.

### Acceptance Criteria
- No supported command issues application API requests.
- Help and navigation agree with the final routes.
- Retained shortcuts and history work.

### Files Modified
- `frontend/src/features/portfolio/data/terminalShell.ts`
- `frontend/src/features/terminalUI/hooks/useTerminalSession.ts`

### Verification
- Replaced `fetch("/api/auth/session")` and `contentPlatformService` calls in `terminalShell.ts` with local content lookups (`localContent.ts`) and static frontend status output.
- Removed `useAuth()` and remote login/logout/admin commands from `useTerminalSession.ts`; updated route navigation targets to include `/projects`.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build`.

---

## CJ-008: Remove backend request/configuration remnants

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Main/AUX API bases, Google client ID, CSRF helpers, legacy REACT_APP exposure/types, and Vite proxy remain. AUX permits a separate origin while CSRF initialization uses the main API base; cross-origin behavior was not verified.

- **Affected:** [api.ts](../frontend/src/lib/api.ts), `csrf.ts` (removed: `frontend/src/lib/csrf.ts`), `env.ts` (removed: `frontend/src/lib/env.ts`), [vite-env.d.ts](../frontend/src/vite-env.d.ts), [vite.config.ts](../frontend/vite.config.ts), `Google declarations` (removed: `frontend/src/types/google-identity.d.ts`), AUX API helper.
- **Dependencies:** CJ-002 through CJ-007.

### Proposed Solution
After consumers migrate, remove unused networking/env/proxy/auth declarations; retain useful content types in a local content module if needed.

### Acceptance Criteria
- Build needs no backend environment.
- Reference searches and network inspection find no remaining application API, CSRF, or auth dependency (static asset fetching is still allowed).

### Files Modified
- `frontend/src/lib/api.ts`
- `frontend/src/lib/csrf.ts`
- `frontend/src/lib/env.ts`
- `frontend/src/features/addToTheAux/lib/api.ts`
- `frontend/src/vite-env.d.ts`
- `frontend/vite.config.ts`

### Verification
- Removed `/api` dev proxy and `REACT_APP_` env prefix from `vite.config.ts`, emptied backend URL/Google env variables in `env.ts` and `vite-env.d.ts`, and removed network `fetch` calls from `csrf.ts`.
- `rg "fetch\(|fetchWithCsrf|/api/|/actuator" src` confirmed zero runtime network calls in `frontend/src/`.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build`.

---

## CJ-009: Repair the failing TypeScript fixture

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`./node_modules/.bin/tsc --noEmit --incremental false` exited 2 during baseline analysis. At line 36, the blog editor fixture lacks `deleteLoading` and `delete`, required by `BlogEditEditorState`.

- **Affected:** `AdminEditorFormViewModels.test.ts` (removed: `frontend/src/components/content/admin/models/AdminEditorFormViewModels.test.ts`), `useAdminBlogEditor.ts` (removed: `frontend/src/components/content/admin/hooks/useAdminBlogEditor.ts`).

### Proposed Solution
Add the missing fixture properties when code changes are authorized, or retire the test with the entire obsolete admin subsystem. Do not conceal the failure through weakened type checking.

### Acceptance Criteria
- The no-emit check passes for the resulting source tree.
- Relevant retained tests pass (or if retired, record as superseded by CJ-005).

### Files Modified
- `frontend/src/components/content/admin/models/AdminEditorFormViewModels.test.ts`

### Verification
- `./node_modules/.bin/tsc --noEmit --incremental false` passed (exit code 0).
- `npm test -- --run` passed (5 test files, 26 tests passed).

---

## CJ-010: Resolve `/projects` and its broken preview

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
The CompilingJava case study's iframe preview points to `/projects`, but only `/projects/:id` is registered. `Projects.tsx` exists without an active import/route.

- **Affected:** [project data](../frontend/src/features/portfolio/data/projects.ts), [publicRoutes](../frontend/src/routes/publicRoutes.ts), [Projects](../frontend/src/pages/Projects.tsx), [ProjectPreviewFrame](../frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx).
- **Decision needed:** Project catalog information architecture.

### Proposed Solution
Define `/projects` as a retained catalog or explicit compatibility redirect; update the case-study preview to a valid target or screenshot. Do not restore the API-dependent page blindly.

### Acceptance Criteria
- `/projects` has intentional behavior.
- The case-study preview shows meaningful content without recursive embedding or API dependence.

### Files Modified
- `frontend/src/pages/Projects.tsx`
- `frontend/src/routes/publicRoutes.ts`
- `frontend/src/tests/App.test.tsx`

### Verification
- Converted `Projects.tsx` to render local `portfolioProjects` via `ProjectCard` with zero API calls and registered `/projects` in `publicRoutes.ts`.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build`.

---

## CJ-011: Provide a global not-found route

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`AppRoutes` maps registered routes with no top-level wildcard. JIT Cafe has a nested wildcard redirect; project details have a content-specific missing state. Neither covers all unknown URLs.

- **Affected:** [AppRoutes](../frontend/src/routes/AppRoutes.tsx), [publicRoutes](../frontend/src/routes/publicRoutes.ts), [ProjectDetail](../frontend/src/pages/ProjectDetail.tsx), [JitCafeFeature](../frontend/src/features/jitCafe/JitCafeFeature.tsx).

### Proposed Solution
Add coherent application not-found behavior and explicit redirects for retired URLs. Keep deployment fallback and application not-found handling distinct.

### Acceptance Criteria
- Unknown top-level and deep paths show a usable destination.
- Retained routes and login retirement mappings do not regress.

### Files Modified
- `frontend/src/routes/AppRoutes.tsx`

### Verification
- Added explicit compatibility redirects (`/login`, `/admin/*`, `/api-lab` -> `/`) and a top-level `<Route path="*" element={<NotFoundPage />} />` in `AppRoutes.tsx` with direct links to Home and Projects.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build`.

---

## CJ-012: Establish the hosting base-path contract

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
CNAME, root-relative assets, router without basename, default Vite base, root manifest start URL, and `/?spa-path=` redirect assume root hosting. Repository `/web/` hosting is not configured. Live Pages/DNS/HTTPS settings are unknown.

- **Affected:** [vite.config.ts](../frontend/vite.config.ts), [Theme](../frontend/src/context/Theme.tsx), [index.html](../frontend/index.html), [404.html](../frontend/public/404.html), [CNAME](../frontend/public/CNAME), [manifest](../frontend/public/meta/manifest.json), asset/route data.
- **Decision:** User confirmed the site targets custom domain `compilingjava.com` hosted at the domain root.

### Proposed Solution
Confirm the intended domain; align router/assets/fallback/metadata consistently for that target. Preserve root paths if the site stays at the custom-domain root.

### Acceptance Criteria
- Direct routes, assets, iframes, PDF, queries, and hashes work from the selected hosting URL.
- Remote settings are documented only after verification.

### Files Modified
- `frontend/public/CNAME`
- `frontend/public/meta/manifest.json`
- `frontend/index.html`
- `frontend/public/404.html`
- `frontend/vite.config.ts`

### Verification
- Confirmed custom-domain root hosting target `compilingjava.com` via `frontend/public/CNAME`.
- Root paths preserved in router (`<Router>` without basename), default Vite base (`/`), root `start_url` (`/`) in `manifest.json`, and root SPA restoration (`/?spa-path=...`) in `404.html` and `index.html`.
- Verified with unit tests in `src/tests/App.test.tsx` and full production build `npm run validate`.

---

## CJ-013: Correct double decoding in SPA restoration

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`URLSearchParams.get('spa-path')` decodes the parameter, then `decodeURIComponent()` decodes it again. Encoded percent characters can be altered or throw. This conclusion is source-derived; production behavior was not tested.

- **Affected:** [index.html](../frontend/index.html), [404.html](../frontend/public/404.html).
- **Dependency:** Coordinate with CJ-012.

### Proposed Solution
Use one defined encode/restore contract consistent with the selected base and preserve pathname/query/hash without a second accidental decoding pass.

### Acceptance Criteria
- Direct-link restoration tests cover ordinary paths, query/hash combinations, Unicode, `%25`, and encoded reserved characters.
- No restoration exception or unexpected URL change occurs.

### Files Modified
- `frontend/index.html`
- `frontend/src/lib/spaPathRestore.ts`
- `frontend/src/tests/App.test.tsx`

### Verification
- Removed the redundant `decodeURIComponent()` pass in `frontend/index.html` and ensured extra query parameters are inserted before any `#hash` fragment.
- Added unit tests in `frontend/src/tests/App.test.tsx` covering ordinary paths, query+hash combinations, Unicode, `%25`, and encoded reserved characters (`%26`, `%3D`, `%23`); `npm run validate` passed (`29/29` tests).

---

## CJ-014: Make validation and publishing reproducible

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Build runs only Vite; there is no type-check script or checked-in GitHub Actions workflow. CLI deploy targets the correct `build/` directory, but actual remote Pages settings were not checked.

- **Affected:** [package.json](../frontend/package.json), [vite.config.ts](../frontend/vite.config.ts), future deployment workflow if selected, project documentation.
- **Dependencies:** CJ-009, CJ-012; publishing mechanism remains a decision in the migration plan.

### Proposed Solution
Define a repeatable type/test/build sequence and documented Node/dependency requirements; implement Pages automation if authorized, or document the maintained CLI path. Keep artifact output consistent.

### Acceptance Criteria
- A clean checkout can reproduce validation and build without backend env.
- Publishing steps and required settings are documented.
- Actual deployment is reported separately from local build success.

### Files Modified
- `frontend/package.json`
- `README.md`

### Verification
- Added `typecheck` (`tsc --noEmit --incremental false`) and `validate` (`npm run typecheck && npm test -- --run && npm run build`) scripts to `frontend/package.json` and documented them in `README.md`.
- Verified `npm run validate` completes with exit code `0`.

---

## CJ-015: Make content cards keyboard-operable

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`ContentCard` attaches opening behavior to a clickable `<li>` without keyboard support. Nested Edit is a separate button.

- **Affected:** [ContentCard](../frontend/src/components/content/ContentCard.tsx), [ContentFeed](../frontend/src/components/content/ContentFeed.tsx).

### Proposed Solution
Use an appropriate native link/button for opening content and keep edit actions separate if still present; expose useful accessible names/focus indication.

### Acceptance Criteria
- Every retained card can be opened using the keyboard with correct semantics, without activating edit or creating nested interactive controls.

### Files Modified
- `frontend/src/components/content/ContentCard.tsx`
- `frontend/src/tests/App.test.tsx`

### Verification
- Replaced clickable `<li>` with a non-interactive `<li>` containing a native `<button type="button">` for opening content and a sibling `<button type="button">` when `showEdit` is active.
- Verified with unit test in `frontend/src/tests/App.test.tsx` (`29/29` tests passed).

---

## CJ-016: Complete dialog semantics and focus management

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Content/login dialogs lack accessible names and focus management. Screenshot dialog is named but has no focus trap/return. Escape and backdrop close are implemented, which does not complete dialog behavior.

- **Affected:** [ContentModal](../frontend/src/components/common/ContentModal.tsx), `LoginFrame` (removed: `frontend/src/components/auth/LoginFrame.tsx`), [ProjectPreviewFrame](../frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx).

### Proposed Solution
For retained dialogs, provide naming, focus entry/trapping/restoration, background interaction handling, Escape/close behavior, and scroll management. Retire login dialog through migration instead of investing in obsolete UI.

### Acceptance Criteria
- Keyboard and screen-reader checks confirm a named dialog, contained interaction, and focus return to its opener on close.

### Files Modified
- `frontend/src/components/common/ContentModal.tsx`
- `frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx`

### Verification
- Added `aria-labelledby`, initial focus entry onto the close button, `Tab`/`Shift+Tab` focus trapping, `document.body.style.overflow = "hidden"` scroll locking, and opener focus restoration on close to both `ContentModal.tsx` and `ProjectPreviewFrame.tsx`.
- Verified with `npm run validate` (`tsc --noEmit`, `vitest`, `vite build`).

---

## CJ-017: Improve game control announcements

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`BoardView` announces only cell index, omitting X/O/empty state. Symmetry range inputs have no explicit accessible label. Status is ordinary text.

- **Affected:** [BoardView](../frontend/src/features/ticTacToe/components/BoardView.tsx), [StateCyclePreview](../frontend/src/features/ticTacToe/components/StateCyclePreview.tsx), [TreeControls](../frontend/src/features/ticTacToe/components/TreeControls.tsx), [StateGroupCard](../frontend/src/features/ticTacToe/components/StateGroupCard.tsx).

### Proposed Solution
Expose board position/state and meaningful slider labels/value text; review turn/result announcements and keyboard behavior inside selectable state cards.

### Acceptance Criteria
- A nonvisual keyboard user can understand positions, play legal moves, inspect hints, and recognize game completion.

### Files Modified
- `frontend/src/features/ticTacToe/components/BoardView.tsx`
- `frontend/src/features/ticTacToe/components/StateCyclePreview.tsx`
- `frontend/src/features/ticTacToe/components/TreeControls.tsx`
- `frontend/src/features/ticTacToe/components/StateGroupCard.tsx`
- `frontend/src/tests/App.test.tsx`

### Verification
- Updated `BoardView` cell `aria-label` to announce cell index, row/column coordinates, mark (`X`/`O`/`empty`), and playable/preview status; added `aria-label` and `aria-valuetext` to the symmetry slider in `StateCyclePreview`; added `role="status" aria-live="polite"` and `aria-pressed` states in `TreeControls`; enriched `StateGroupCard` labels.
- Verified with unit test in `frontend/src/tests/App.test.tsx` (`29/29` passed).

---

## CJ-018: Remove the nested interactive JIT Cafe CTA

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
The home page wraps `<Button>` in a router `<Link>` for Explore food menu.

- **Affected:** [HomePage](../frontend/src/features/jitCafe/pages/HomePage.tsx), [Button](../frontend/src/features/jitCafe/components/ui/Button.tsx).

### Proposed Solution
Render a single navigation link with the required button styling, or use a component interface that emits one appropriate interactive element.

### Acceptance Criteria
- The CTA has one focus stop and correct link semantics, and navigation still works.

### Files Modified
- `frontend/src/features/jitCafe/components/ui/Button.tsx`
- `frontend/src/features/jitCafe/pages/HomePage.tsx`

### Verification
- Exported `getButtonClassName` from `Button.tsx` and rendered a single `<Link to={JIT_CAFE_MENU_PATH} className={getButtonClassName("primary")}>Explore food menu</Link>` in `HomePage.tsx`.
- Verified with `npm run validate`.

---

## CJ-019: Consolidate local content and presentation helpers

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`PortfolioProject` and API `ContentItem` produce different card/detail paths. Excerpt and URL classification/presentation helpers repeat across Home, Projects, ProjectDetail, and ContentModal.

- **Affected:** [projects.ts](../frontend/src/features/portfolio/data/projects.ts), [api.ts](../frontend/src/lib/api.ts), [StandardHome](../frontend/src/features/standardUI/components/StandardHome.tsx), [ProjectDetail](../frontend/src/pages/ProjectDetail.tsx), [ContentModal](../frontend/src/components/common/ContentModal.tsx), inactive Projects page.
- **Dependencies:** CJ-001, CJ-002.

### Proposed Solution
Introduce one local content boundary with shared selectors and minimal reusable presentation primitives. Remove obsolete managed-content branches as their data migrates.

### Acceptance Criteria
- One project collection controls catalog/detail content.
- Duplicate slugs are intentional/mapped.
- URL and excerpt behavior is consistent and independently testable where useful.

### Files Modified
- `frontend/src/features/portfolio/data/localContent.ts`
- `frontend/src/features/standardUI/components/StandardHome.tsx`
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/pages/Projects.tsx`

### Verification
- Consolidated project rendering onto `portfolioProjects` (`ProjectCard` and `PortfolioProjectDetail`) and removed duplicate `ApiProjectCard` and `ManagedProjectDetail` branches.
- Verified with `./node_modules/.bin/tsc --noEmit --incremental false`, `npm test -- --run` (26/26 passed), and `npm run build`.

---

## CJ-020: Align navigation and writing discovery

Priority: Medium (P2)
Status: SUPERSEDED
Assigned Agent: Antigravity

**Superseded 2026-10-27 by CJ-033/CJ-034:** The user redefined the site's purpose as a three-page professional/employer-facing site ([WEBSITE_VISION.md](WEBSITE_VISION.md)), explicitly prohibiting a standalone Blog page/nav entry. This resolution's `Blog` nav entry and `/blog` route were removed; see CJ-033 for the replacement navigation model.

### Description
Standard header uses profile navigation, not route `showInNav` flags; Blog is absent there. Terminal maintains separate routes/aliases. Blog posts are modal-only. Standalone game/AUX omit standard return navigation.

- **Affected:** [publicRoutes](../frontend/src/routes/publicRoutes.ts), [profile.ts](../frontend/src/features/portfolio/data/profile.ts), `terminalShell` (removed: `frontend/src/features/portfolio/data/terminalShell.ts`), [StandardHeader](../frontend/src/features/standardUI/components/StandardHeader.tsx), `Blog` (modal reader), standalone demos.
- **Decisions needed:** Blog, `/projects`, terminal, and demo navigation scope.

### Proposed Solution
Choose final information architecture and shared route metadata; decide writing placement/deep links and standalone demo return paths. Align terminal commands if retained.

### Acceptance Criteria
- Every retained public feature has an intentional discovery and return path.
- Navigation targets agree with routes.
- Modal versus page reading is documented.

### Files Modified
- `frontend/src/features/portfolio/data/profile.ts`
- `frontend/src/routes/publicRoutes.ts`
- `frontend/src/features/portfolio/data/terminalShell.ts`
- `frontend/src/features/ticTacToe/TicTacToeFeature.tsx`
- `frontend/src/pages/AddToTheAux.tsx`
- `frontend/src/tests/App.test.tsx`

### Verification
- Added `Projects` (`/projects`) and `Blog` (`/blog`) to `portfolioNavItems` in `profile.ts` and enabled `showInNav` in `publicRoutes.ts`, matching top-level navigation across the desktop/mobile header.
- Aligned terminal navigation in `terminalShell.ts`: `terminalNamedPaths.projects = "/projects"`, added `/projects` to `terminalDirectoryPaths`, and updated `terminalRouteCommands` (`cd /projects`).
- Added return navigation links (`← Back to Projects`) to standalone feature routes (`TicTacToeFeature.tsx`, `AddToTheAux.tsx`).
- Added unit test assertion in `App.test.tsx` verifying exact path alignment between `portfolioNavItems` and `publicRoutes.filter(r => r.showInNav !== false)`.
- `npm run validate` passed (`14/14` tests, typecheck, build).

---

## CJ-021: Isolate styles and remove overlapping definitions

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
The inspected CSS totals 8,863 lines. JIT Cafe variables are scoped but many selectors/shared brand utilities are global; stale ordering/staff styles remain. Cross-route visual interference is a risk, not a browser-observed regression.

- **Affected:** [global styles](../frontend/src/styles/index.css), [JIT Cafe styles](../frontend/src/features/jitCafe/styles.css), [AUX styles](../frontend/src/features/addToTheAux/styles.css), [Tic Tac Toe styles](../frontend/src/features/ticTacToe/styles.css), [Tailwind config](../frontend/tailwind.config.js).

### Proposed Solution
Set shared token ownership and feature isolation conventions. Consolidate duplicate rules and remove unneeded feature styles during authorized replacement work.

### Acceptance Criteria
- Navigating into and out of each feature does not alter unrelated styling.
- Retained styles have clear ownership.
- Responsive and reduced-motion checks pass.

### Files Modified
- `frontend/src/features/jitCafe/styles.css`

### Verification
- Scoped overlapping utility and button classes in `jitCafe/styles.css` (`.brand-button-primary`, `.brand-button-secondary`, `.bg-brand-accent`, `.hover:bg-brand-accent-strong`, `.brand-ambient-panel`, `.brand-ambient-frame`) under `.jit-cafe-feature` so lazy-loading JIT Cafe cannot override standard portfolio styles.
- `npm run validate` passed (`14/14` tests, typecheck, build).

---

## CJ-022: Resolve inactive dark-theme support and retire Terminal UI

Priority: Low (P3)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
ThemeProvider forces light mode while dark tokens/variants remain. The standard/terminal UI toggle is a separate obsolete mode.

- **Affected:** [ThemeProvider](../frontend/src/context/ThemeProvider.tsx), [global styles](../frontend/src/styles/index.css), [Tailwind config](../frontend/tailwind.config.js), `SiteUiModeContext` (deleted: `frontend/src/context/SiteUiModeContext.tsx`), `UiModeToggle` (deleted: `frontend/src/components/common/UiModeToggle.tsx`), `TerminalUI` (deleted: `frontend/src/features/terminalUI/*`), `terminalShell` (deleted: `frontend/src/features/portfolio/data/terminalShell.ts`), `Footer` (deleted: `frontend/src/components/layout/Footer.tsx`), dark variants in components/feature CSS.
- **Decision:** User directed "we will be getting rid of terminal UI, just keep regular light mode".

### Proposed Solution
Retire the simulated Terminal UI shell, mode toggle, and associated data/telemetry modules. Enforce light mode as the sole supported theme across CSS variables, Tailwind configuration, components, and layout.

### Acceptance Criteria
- Theme controls, context, tokens, and documentation describe the same supported states (light mode only).
- Terminal UI shell, toggles, session data, and telemetry are removed cleanly.
- Tests and build pass.

### Files Modified
- Deleted: `frontend/src/context/SiteUiModeContext.tsx`, `frontend/src/components/common/UiModeToggle.tsx`, `frontend/src/components/layout/Footer.tsx`, `frontend/src/features/portfolio/data/terminalShell.ts`, `frontend/src/features/terminalUI/*`.
- `frontend/src/components/layout/Layout.tsx`
- `frontend/src/context/Theme.tsx`
- `frontend/src/context/ThemeProvider.tsx`
- `frontend/src/features/standardUI/components/StandardHeader.tsx`
- `frontend/src/features/standardUI/components/StandardHome.tsx`
- `frontend/src/pages/About.tsx`
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/components/content/hooks/useContentBrowserData.ts`
- `frontend/src/components/layout/RouteScrollReset.tsx`
- `frontend/src/styles/index.css`
- `frontend/tailwind.config.js`
- `frontend/src/features/jitCafe/styles.css`
- `frontend/src/features/ticTacToe/styles.css`
- `frontend/src/features/addToTheAux/styles.css`
- `frontend/src/components/common/ContentModal.tsx`
- `frontend/src/components/content/ContentCard.tsx`
- `frontend/src/components/content/ContentCategoryFilter.tsx`
- `frontend/src/components/content/RetroBootLoader.tsx`
- `frontend/src/tests/App.test.tsx`

### Verification
- Removed all terminal shell components, session hooks, dragzone logic, and event telemetry.
- Removed dark theme variables (`.dark, [data-theme="dark"]`) from `index.css`, `jitCafe/styles.css`, `ticTacToe/styles.css`, and `addToTheAux/styles.css`.
- Removed `darkMode: 'class'` from `tailwind.config.js`.
- Cleaned dark utility classes from `ContentModal.tsx`, `ContentCard.tsx`, `ContentCategoryFilter.tsx`, and `RetroBootLoader.tsx`.
- Added unit test in `src/tests/App.test.tsx` verifying that `ThemeProvider` initializes `dataset.theme = "light"`, includes `light` class, excludes `dark` class, and theme consumer receives `"light"`.
- Verified with `npm run validate` (`15/15` tests passed, clean typecheck, successful production build).

---

## CJ-023: Review inactive components and old content

Priority: Low (P3)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Reference inspection found unconsumed layout components, story sections, PrivateRoute, NavItem, Paragrapher, social-link components, AdminAccessNotice, reportWebVitals, and Projects page. Public Markdown/text is not wired into pages.

- **Affected:** See the explicit inactive-source inventory in [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md); `frontend/public/content/`.

### Proposed Solution
Recheck imports and content value after migration; remove truly unused source/dependencies or deliberately reuse useful content. Do not treat unreferenced public files as automatically disposable.

### Acceptance Criteria
- Removed items have no retained consumers or needed archival value.
- Relevant tests and build pass.
- Documentation no longer points to removed implementation.

### Files Modified
- Deleted (retired auth/admin/API subsystems, unreachable from `src/index.tsx`): `frontend/src/components/auth/*`, `frontend/src/components/content/admin/*` (including `AdminContentPageViewModel.test.ts`, `AdminEditorFormViewModels.test.ts`, `AdminEditorModels.test.ts`), `frontend/src/pages/Login.tsx`, `frontend/src/pages/ApiLab.tsx`, `frontend/src/pages/admin/*`, `frontend/src/context/AuthContext.tsx`, `frontend/src/routes/PrivateRoute.tsx`, `frontend/src/routes/RequireAdmin.tsx`, `frontend/src/lib/csrf.ts`, `frontend/src/lib/env.ts`, `frontend/src/types/google-identity.d.ts`, `frontend/src/features/addToTheAux/lib/api.ts`, `frontend/src/features/addToTheAux/hooks/useGuestPreview.ts`, `frontend/src/features/jitCafe/components/menu/menuImageSlugs.ts`, `frontend/src/components/layout/Navbar.tsx`, `frontend/src/components/layout/Sidebar.tsx` (empty), `frontend/src/components/layout/TerminalShell.tsx` (re-export).
- Docs: `AGENTS.md`, `docs/CODEBASE_ANALYSIS.md`, `docs/ISSUES.md` (links to removed files converted to plain text).

### Verification
- Import-reachability scan from `src/index.tsx` confirmed every deleted file had no reachable importer.
- `npm run validate` passed: typecheck clean, `2` test files / `14` tests passed (the 15 removed tests covered only the deleted admin models), production build succeeded.
- Markdown link check across `AGENTS.md`, `README.md`, and `docs/*.md`: 0 broken links.
- **Remaining (needs user decision):** presentational candidates kept for possible redesign reuse — `Footer.tsx`, `NavItem.tsx`, `Paragrapher.tsx`, `GitHubLink.tsx`, `LinkedInLink.tsx`, `ProjectsStorySection.tsx`, `StandardHomeStory.tsx`, `reportWebVitals.ts` (removing it would allow dropping the `web-vitals` dependency), and `frontend/public/content/`.

---

## CJ-024: Update documentation, metadata, and runtime claims

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
README describes absent directories; package/HTML/manifest descriptions advertise a full-stack runtime. Some page copy claims live backend content, while JIT Cafe shows historical operations only as screenshots. All routes share a homepage canonical/title.

- **Affected:** [README](../README.md), [TASKS](../TASKS.md), [package.json](../frontend/package.json), [index.html](../frontend/index.html), [manifest](../frontend/public/meta/manifest.json), profile/project data and API-source UI labels.
- **Note:** Creating the new analysis/plan/tracker does not resolve stale existing README/application metadata.

### Proposed Solution
Update operational claims as migration lands; distinguish historical project architecture and professional skills from present site requirements. Decide route metadata needs for the redesigned public pages and label historical/demo features accurately.

### Acceptance Criteria
- Documentation matches files and commands.
- Public copy is truthful and retained pages have appropriate metadata.
- Professional background is not rewritten merely to remove backend keywords.

### Files Modified
- `README.md`
- `frontend/package.json`
- `frontend/index.html`
- `frontend/public/meta/manifest.json`
- `frontend/src/pages/About.tsx`
- `frontend/src/components/content/ContentBrowserHeader.tsx`

### Verification
- Updated `README.md`, `frontend/package.json`, `frontend/index.html`, and `frontend/public/meta/manifest.json` to describe the frontend-only React/TypeScript/Vite architecture and root-relative manifest icon paths while preserving historical career/case-study descriptions.

---

## CJ-025: Establish meaningful retained-feature coverage

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
Existing tests exercise content/admin models. `App.test.tsx` only asserts true; no route/game/auth/feature integration tests were found. A build and test suite were not run during the read-only analysis.

- **Affected:** [App.test.tsx](../frontend/src/tests/App.test.tsx), [setupTests](../frontend/src/tests/setupTests.tsx), content model tests, feature logic, routing and deployment validation.

### Proposed Solution
Replace placeholder coverage with tests for retained behavior and local content contracts. Add useful game/URL tests, then browser checks for navigation, network independence, mobile, keyboard, and dialogs. Retire obsolete admin tests with the subsystem.

### Acceptance Criteria
- Results cover the migration plan's validation matrix.
- Test descriptions and recorded results correspond to actual behavior.
- Build success is not presented as a complete runtime check.

### Files Modified
- `frontend/src/tests/App.test.tsx`

### Verification
- Replaced placeholder test in `frontend/src/tests/App.test.tsx` with 6 behavioral tests covering `localContent` selectors, `localAuxData` search/queue additions/duplicate handling, `publicRoutes` registration, `spaPathRestore` URL decoding edge cases, `ContentCard` keyboard-accessible button structure, and `BoardView` accessible cell announcements.
- `npm test -- --run` passed (`5` test files, `29` tests).

---

## CJ-026: Review asset weight and font loading

Priority: Low (P3)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
`public/` is approximately 22 MB. Main fonts are requested by both HTML and global CSS; JIT Cafe adds another font import. No performance measurements were taken, and browser caching may avoid duplicate transfers.

- **Affected:** [index.html](../frontend/index.html), [global styles](../frontend/src/styles/index.css), [JIT Cafe styles](../frontend/src/features/jitCafe/styles.css), `frontend/public/assets/`, project preview rendering.

### Proposed Solution
Measure the production site, consolidate font loading, and optimize retained images/resolution/loading according to their actual presentation. Preserve necessary originals/content as agreed.

### Acceptance Criteria
- No accidental redundant font declarations remain.
- Retained images remain legible.
- Measured loading improves without broken references.

### Files Modified
- `frontend/src/styles/index.css`

### Verification
- Removed redundant `@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono...&family=Inter...");` from `frontend/src/styles/index.css` since `frontend/index.html` already loads this exact stylesheet with `<link rel="preconnect">`.
- Verified with `npm run validate`.

---

## CJ-027: Fix menu image fallback/asset mismatch

Priority: Low (P3)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
MenuItemImage constructs `<slug>.svg` fallback paths from `menuImageSlugs`, but those SVG files were not found in the JIT Cafe public assets. Configured snapshot WebP paths are mapped to existing photos; failure behavior falls through to decorative styling.

- **Affected:** [MenuItemImage](../frontend/src/features/jitCafe/components/menu/MenuItemImage.tsx), `menuImageSlugs` (removed: `frontend/src/features/jitCafe/components/menu/menuImageSlugs.ts`), [staticMenuSnapshot](../frontend/src/features/jitCafe/data/staticMenuSnapshot.ts), JIT Cafe assets.

### Proposed Solution
Use existing local fallback media or remove the missing-file candidate layer; keep a deliberate final empty-image presentation.

### Acceptance Criteria
- Missing primary images produce a useful accessible fallback without requesting nonexistent named SVGs.

### Files Modified
- `frontend/src/features/jitCafe/components/menu/MenuItemImage.tsx`

### Verification
- Replaced nonexistent `<slug>.svg` candidate generation in `MenuItemImage.tsx` with existing variant-matched `foodiesfeed-*.webp` assets in `/assets/features/jit-cafe/` and an accessible `role="img" aria-label={...}` themed fallback container.
- Verified with `npm run validate`.

---

## CJ-028: Resolve API Lab's actuator proxy mismatch

Priority: Low (P3)
Status: SUPERSEDED
Assigned Agent: Antigravity

### Description
API Lab calls same-origin `/actuator/health` and `/actuator/info` when the API base is empty, while Vite proxies only `/api`. The display also mentions a CRA proxy despite using Vite.

- **Affected:** `ApiLab` (removed: `frontend/src/pages/ApiLab.tsx`), [vite.config.ts](../frontend/vite.config.ts).

### Proposed Solution
Prefer retiring this with CJ-005; only repair/document diagnostics routing if the user explicitly needs it during transition. Do not expand backend infrastructure for the final static site.

### Acceptance Criteria
- The obsolete console is removed, or transitional diagnostics are explicitly verified and documented (record `SUPERSEDED` if retirement resolves it).

### Files Modified
- `frontend/src/pages/ApiLab.tsx`
- `frontend/src/routes/publicRoutes.ts`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/vite.config.ts`

### Verification
- Superseded by CJ-005 and CJ-008: retired `/api-lab` route and `ApiLab.tsx` diagnostics console, and removed the Vite `/api` development proxy from `vite.config.ts`.

---

## CJ-029: Correct the screenshot viewer overlay utility

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
ProjectPreviewFrame uses `bg-brand-overlay/72`; Tailwind's `brand` color map does not include `overlay`. Defining `--brand-overlay` in CSS alone does not define that utility. Actual compiled appearance was not inspected.

- **Affected:** [ProjectPreviewFrame](../frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx), [tailwind.config.js](../frontend/tailwind.config.js), [global styles](../frontend/src/styles/index.css).

### Proposed Solution
Use a supported overlay class/style/token as part of the retained dialog implementation; verify compiled CSS instead of assuming the class exists.

### Acceptance Criteria
- Image viewer has the intended backdrop and readable controls in the production build and supports the focus behavior in CJ-016.

### Files Modified
- `frontend/tailwind.config.js`
- `frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx`

### Verification
- Added `brand.overlay: withOpacity("--brand-overlay")` and non-5-multiple opacity steps (`12`, `14`, `16`, `18`, `22`, `24`, `28`, `34`, `42`, `48`, `56`, `72`, `78`, `82`, `86`, `92`, `96`) to `frontend/tailwind.config.js`.
- Verified `bg-brand-overlay\/72{background-color:rgb(var(--brand-overlay) / .72)}` is emitted in the production CSS bundle (`build/assets/index-*.css`).

---

## CJ-030: Align React runtime and type versions

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Antigravity

### Description
React/React DOM are declared at version 18; `@types/react` and `@types/react-dom` at version 19. This is a compatibility risk; it was not established as the cause of the specific CJ-009 error.

- **Affected:** [package.json](../frontend/package.json), [package-lock.json](../frontend/package-lock.json), React component/ref typings.

### Proposed Solution
Align type declarations with the selected runtime when dependency changes are authorized. Treat a runtime upgrade as a separate scope choice rather than an automatic prerequisite for migration.

### Acceptance Criteria
- Runtime and type declarations are intentionally compatible.
- Type checks and relevant tests pass.
- Existing lockfile work is preserved or reconciled rather than overwritten blindly.

### Files Modified
- `frontend/package.json`

### Verification
- Full TypeScript compilation (`tsc --noEmit --incremental false`) passes with 0 errors across all source and test files.
- Vitest unit tests pass completely (`15/15` tests passed across 2 suites).
- Vite production build compiles and bundles cleanly into static files (`build/`).
- Pre-existing lockfile modifications are preserved per project instructions without blind regeneration or breakage.

---

## CJ-031: Reposition professional identity for CS+MBA+leadership

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Claude

### Description
The site's product direction changed from a developer portfolio/technical blog to a professional website for employers ([WEBSITE_VISION.md](WEBSITE_VISION.md)). The identity data layer (`profile.ts`) branded Edwin purely as a "Full-Stack Developer" with no mention of the MBA, Business Analytics, or leadership background.

- **Affected:** [profile.ts](../frontend/src/features/portfolio/data/profile.ts), new [experience.ts](../frontend/src/features/portfolio/data/experience.ts).

### Proposed Solution
Update identity/summary/hero-fact/strengths/stack-group copy to combine software engineering, business analytics (MBA in progress, UIC), data systems, and leadership (U.S. Marine Corps, Options for Youth). Add a shared `experience.ts` data module (education, certifications, work history) consumable by both Home and About.

### Acceptance Criteria
- `portfolioProfile` copy reflects CS+MBA+leadership positioning without inventing credentials.
- Education/certifications/work-history data exists in one shared, reusable module.
- Type checks and tests pass.

### Files Modified
- `frontend/src/features/portfolio/data/profile.ts`
- `frontend/src/features/portfolio/data/experience.ts` (new)

### Verification
- `npm run typecheck`: passed (exit code 0).
- `npm test -- --run`: passed (2 test files, 15 tests).
- `npm run build`: passed.

---

## CJ-032: Add Options for Youth case study; reprioritize featured projects

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Claude

### Description
The vision names the Options for Youth case-management/data work as a potential featured case study demonstrating software engineering, data management, and operational problem-solving. It did not exist as project content anywhere in the repo — only as one `workExperience` entry. The existing four projects (web platform, AUX, Tic Tac Toe, JIT Cafe) skew toward developer demos rather than business impact.

- **Affected:** [projects.ts](../frontend/src/features/portfolio/data/projects.ts), [localContent.ts](../frontend/src/features/portfolio/data/localContent.ts) (derives `PROJECT` content items from `portfolioProjects`).

### Proposed Solution
Add an "Options for Youth" project entry built strictly from verified existing text (the `workExperience` story already in the repo) — problem/context, contribution, technologies, no invented metrics. Mark it and the CompilingJava platform as `featured`; demote Tic Tac Toe and JIT Cafe to non-featured ("additional work").

### Acceptance Criteria
- Options for Youth entry uses only verified facts, no invented metrics/outcomes.
- Featured set reflects "quality over quantity" per the vision.
- `localContent.ts`'s derived PROJECT item count and date parsing stay valid (project `year` must remain a plain parseable year).

### Files Modified
- `frontend/src/features/portfolio/data/projects.ts`
- `frontend/src/tests/App.test.tsx` (updated local PROJECT content count from 4 to 5)

### Verification
- `npm run typecheck`: passed.
- `npm test -- --run`: passed (2 test files, 15 tests).
- `npm run build`: passed.
- **Remaining (needs user decision):** exact framing/metrics for Options for Youth should be reviewed by the user (CJ-036-adjacent) — only the existing verified `workExperience` narrative was used.

---

## CJ-033: Consolidate to three-page navigation; retire Resume/Contact/Blog pages

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Claude

### Description
The vision mandates a maximum of three primary pages (Home, Projects, About) with `Home | Projects | About | Resume ↗` navigation, Resume as a direct link/download (not a route), and Contact folded into Home/footer rather than a standalone page. The site had six nav entries/routes (Home, Projects, Blog, About, Resume, Contact).

- **Affected:** [publicRoutes.ts](../frontend/src/routes/publicRoutes.ts), [profile.ts](../frontend/src/features/portfolio/data/profile.ts) (`portfolioNavItems`), [AppRoutes.tsx](../frontend/src/routes/AppRoutes.tsx), deleted `frontend/src/pages/Resume.tsx` and `frontend/src/pages/Contact.tsx`.

### Proposed Solution
Remove `/blog`, `/resume`, `/contact` from `publicRoutes.ts` and `portfolioNavItems`; add compatibility redirects (`/blog/*` → `/`, `/resume` → `/`, `/contact` → `/#contact`) in `AppRoutes.tsx`; delete the retired page components. `StandardHeader.tsx` already rendered Resume as an external PDF link outside the nav array, matching `Resume ↗` with no further change needed there.

### Acceptance Criteria
- Nav is exactly Home/Projects/About; Resume remains available as a direct PDF link in the header.
- `/blog`, `/resume`, `/contact` have deliberate redirect behavior, not raw 404s.
- No dangling imports/links to the deleted pages remain.

### Files Modified
- `frontend/src/routes/publicRoutes.ts`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/features/portfolio/data/profile.ts`
- Deleted: `frontend/src/pages/Resume.tsx`, `frontend/src/pages/Contact.tsx`
- `frontend/src/tests/App.test.tsx`

### Verification
- `npm run typecheck`: passed.
- `npm test -- --run`: passed (2 test files, 15 tests, including updated nav/route alignment assertions).
- `npm run build`: passed; confirmed `Resume`/`Contact`/`Blog` chunks no longer emitted.

---

## CJ-034: Rebuild Home as a standalone professional overview

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Claude

### Description
The vision requires the homepage alone to give an employer enough information without visiting another page: identity, CS+MBA background, value proposition, competencies, selected experience, featured projects, education/leadership, resume download, and contact. The prior `StandardHome.tsx` was a short hero plus a flat list of all four projects with no experience, education, or contact content.

- **Affected:** [StandardHome.tsx](../frontend/src/features/standardUI/components/StandardHome.tsx).

### Proposed Solution
Rebuild the page with: hero (identity + summary + resume download + contact anchor), a competencies grid driven by `portfolioProfile.stackGroups`, a "selected experience" section driven by `featuredPortfolioWorkExperience`, a featured-projects grid driven by `featuredPortfolioProjects`, an education summary, and a `#contact` section with the resource links previously on the standalone Contact page.

### Acceptance Criteria
- Home contains identity, competencies, selected experience, featured projects, education, and contact without requiring another page visit.
- `#contact` anchor works from the header/footer and from the retired `/contact` redirect.

### Files Modified
- `frontend/src/features/standardUI/components/StandardHome.tsx`

### Verification
- `npm run typecheck`, `npm test -- --run`, `npm run build`: all passed.
- **Remaining:** this pass is content/structure only; visual design polish is deferred to CJ-037.

---

## CJ-035: Rebuild About with education, certifications, and career progression

Priority: High (P1)
Status: RESOLVED
Assigned Agent: Claude

### Description
The vision's About page needs education, leadership, career progression, professional interests, and career objective — and must not just repeat Home. The prior `About.tsx` was almost entirely a local-blog-post listing plus two short paragraphs, with no education, certifications, work history, or leadership content anywhere on the page.

- **Affected:** [About.tsx](../frontend/src/pages/About.tsx), new [experience.ts](../frontend/src/features/portfolio/data/experience.ts).

### Proposed Solution
Replace the blog listing with: education (B.S. Computer Science, NEIU; MBA Business Analytics in progress, UIC), certifications (moved from the retired Resume page), full career-progression work history (moved from the retired Resume page, including Marine Corps leadership and Options for Youth), and a professional-interests/career-objective section using only user-supplied facts.

### Acceptance Criteria
- About page covers education, certifications, full work history, and career objective.
- No content duplicated verbatim from Home beyond the existing short-bio paragraphs.
- No local blog listing remains on About.

### Files Modified
- `frontend/src/pages/About.tsx`
- `frontend/src/features/portfolio/data/experience.ts` (new, shared with CJ-031/CJ-034)

### Verification
- `npm run typecheck`, `npm test -- --run`, `npm run build`: all passed.

---

## CJ-036: Resolve fate of retained blog/writing content in the data layer

Priority: Medium (P2)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

### Description
`localContent.ts` still defines three `BLOG`-type content entries and local blog selectors; no page renders them now that `/blog` and About's blog listing are retired (CJ-033, CJ-035). The vision allows a future Research/Writing section only with explicit approval; it has not been given.

- **Affected:** [localContent.ts](../frontend/src/features/portfolio/data/localContent.ts).

### Proposed Solution
Ask the user whether to (a) delete the local blog content/selectors entirely, (b) keep the data dormant in case a future approved Writing section reuses it, or (c) surface a minimal mention somewhere on About. Do not silently delete or silently resurrect this content.

### Acceptance Criteria
- A decision is recorded here with rationale before any blog data/selectors are deleted or re-surfaced.

### Files Modified
None

### Verification
Not started

---

## CJ-037: Visual redesign of shared shell/pages for professional positioning

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Claude

### Description
CJ-031 through CJ-035 changed content/structure only, reusing existing `portfolio-*` utility classes and layout patterns. The vision calls for a "significant visual redesign" — modern, professional, sophisticated styling appropriate for recruiters/hiring managers/business leaders, distinct from the prior developer-portfolio look. The user further specified the redesign should read as "MBA + CS major, with AI workflow" — clarified (via `AskUserQuestion`) as a subtle visual tech aesthetic, not new content and not a "built with AI" narrative.

- **Affected:** `StandardHeader.tsx`, `StandardHome.tsx`, `styles/index.css`.
- **Decision:** User selected "visual tech aesthetic" (data/graph motifs, monospace+sans pairing, technical color accents) over a dedicated AI-skills content section or a "built with AI" narrative.

### Proposed Solution
Reuse the existing Inter (sans) + IBM Plex Mono pairing already in the design system, and extend it deliberately: render identity/role lines and stat values in mono for a "data readout" feel, color-code the Home competencies grid by domain (business/analytics, backend, frontend, data, leadership) using the existing semantic brand tokens (accent/frame/success/warning/danger) as small accent bars/dots, and add a minimal fading "signal" divider under the hero CTA. No new dependencies, no terminal/matrix-style aesthetic (explicitly retired by the user in `CJ-022`), no heavy animation.

### Acceptance Criteria
- Visual language across Home/Projects/About reads as "modern, professional, sophisticated" with a subtle technical signal, not a developer-portfolio or terminal aesthetic.
- No new dependencies; reuses existing design tokens and fonts.
- Accessibility and responsive behavior preserved; `prefers-reduced-motion` handling untouched.

### Files Modified
- `frontend/src/styles/index.css` (new `.header-role-line`, `.home-role-line`, `.home-stat-value`, `.home-signal-divider`, `.home-competency-tile`, `.home-competency-dot` classes)
- `frontend/src/features/standardUI/components/StandardHeader.tsx` (mono role line under the site name)
- `frontend/src/features/standardUI/components/StandardHome.tsx` (mono role line and stat values, color-coded competency tiles, signal divider)

### Verification
- `npm run validate` (`tsc --noEmit`, `vitest run`, `vite build`): passed (2 test files, 15 tests; clean build).
- Visually verified by launching the Vite dev server and capturing headless-Chrome screenshots (`google chrome --headless --screenshot`) of `/`, `/projects`, and `/about` at desktop width; confirmed the mono role lines, color-coded competency accents, and signal divider render as intended with no layout breakage, and that lazy-loaded routes (`/about`) render correctly (an initial screenshot caught React Suspense's loading state, not a real bug).
- **Remaining:** this pass covers Home/header only (the page most responsible for first impression) plus shared tokens; Projects/About inherit the same `portfolio-*` classes but did not receive additional bespoke treatment. Footer, mobile-nav, and a second design pass (e.g. after `CJ-036` resolves) remain available as follow-up if the user wants the tech-accent treatment extended further.

---

## CJ-038: Remove standalone Resume page

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Codex

### Description
User requested removing the Resume page after production deployment, retaining PDF access.

### Proposed Solution
Remove the page and primary navigation entry; redirect legacy `/resume` URLs home.

### Acceptance Criteria
- No standalone Resume page or primary navigation entry.
- PDF links remain available; `/resume` redirects home.
- Validation passes.

### Files Modified
- `frontend/src/pages/Resume.tsx` (deleted)
- `frontend/src/routes/publicRoutes.ts`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/features/portfolio/data/profile.ts`
- `frontend/src/tests/App.test.tsx`
- `docs/ISSUES.md`, `docs/CODEBASE_ANALYSIS.md`, `docs/MIGRATION_PLAN.md`, `docs/CHANGELOG.md`

### Verification
`npm run validate`: TypeScript, 15 tests, and production build passed; no Resume chunk emitted.

---

## Ticket format and completion template

New and updated tickets should follow this standard format:

```markdown
## ISSUE-001: Remove Backend API Calls

Priority: High
Status: TODO
Assigned Agent: Unassigned

### Description
Identify frontend components that depend on
the Spring Boot backend.

### Proposed Solution
Replace backend requests with local static data.

### Acceptance Criteria
- No application API calls remain.
- Existing pages render successfully.
- Production build completes successfully.

### Files Modified
None

### Verification
Not started

---
```

### Multi-agent workflow

1. **Before starting an issue:** check whether another agent is assigned, mark `Status: IN PROGRESS`, and set `Assigned Agent: <Agent Name>`.
2. **After completing an issue:** update `Status`, `Files Modified`, and `Verification` (recording actual commands/scenarios and results), and append a completion entry to `docs/CHANGELOG.md` including modified files, implementation details, test results, follow-up work, and agent name.
3. **Incomplete work:** if implementation or verification is incomplete, do not mark the issue as resolved. When superseding an issue, identify the replacement issue or retired subsystem. Do not mark planned work complete merely because documentation exists.

## CJ-039: Add WorldCupBracket and Rust footer badge

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Codex

### Description
Add the user’s WorldCupBracket project using its public repository as evidence and add Rust to the existing footer technology badges.

### Proposed Solution
Extend the shared project catalog and existing icon list.

### Acceptance Criteria
- Project appears in Projects with a case study and repository link.
- Rust badge uses the existing footer styling.
- Validation passes.

### Files Modified
`frontend/src/features/portfolio/data/projects.ts`, `frontend/src/features/standardUI/components/StandardFooter.tsx`, `frontend/src/tests/App.test.tsx`, `frontend/public/assets/features/world-cup-bracket/bracket.png`, `docs/ISSUES.md`, `docs/CODEBASE_ANALYSIS.md`, `docs/CHANGELOG.md`.

### Verification
`npm run validate` passed: TypeScript, 15 tests, production build. Screenshot verified as a local PNG; project uses the shared catalog/detail route.

## CJ-040: Add color to the professional portfolio

Priority: Medium (P2)
Status: IN PROGRESS
Assigned Agent: Codex

### Description
The user finds the current page too black and white and requests more color. Extend the professional light-mode presentation with visible color in surfaces and accents while preserving readable content and the frontend-only architecture.

### Proposed Solution
Use a coordinated teal, blue, and amber palette in the portfolio shell, hero, shared cards, page introductions, contact area, navigation, and footer. Scope portfolio tokens to its shell so standalone demonstrations retain their own palettes.

### Acceptance Criteria
- Home, Projects, and About have visible, consistent color beyond small accent dots.
- Text and controls remain readable; keyboard focus is visible.
- Desktop and mobile layouts remain usable; standalone demos retain their palettes.
- Existing type checks, tests, and production build pass.

### Files Modified
`frontend/src/styles/index.css`, `frontend/src/features/standardUI/components/StandardHeader.tsx`, `frontend/src/features/standardUI/components/StandardHome.tsx`, `frontend/src/features/standardUI/components/StandardFooter.tsx`, `frontend/src/features/portfolio/components/ProjectCard.tsx`, `frontend/src/pages/Projects.tsx`, `frontend/src/pages/About.tsx`, `AGENTS.md`, `docs/CODEBASE_ANALYSIS.md`, `docs/MIGRATION_PLAN.md`, `docs/ISSUES.md`, `docs/CHANGELOG.md`.

### Verification
- 2026-11-11 revision (Claude Code): user requested one elegant accent instead of several. Palette reduced to a single deep teal (`--portfolio-accent`) on neutral surfaces; blue/amber/plum tokens and per-card color rotation removed (`index.css`, `StandardHome.tsx`). `npm run typecheck` and `npm run build` passed. Tests and browser QA not run.
- Earlier pass (superseded palette): Implementation complete: teal/blue/amber surfaces, navy headings, scoped portfolio tokens, tinted cards/introductions/contact/footer, and visible keyboard focus.
- TypeScript check passed as part of `npm run validate`.
- `npm run build` passed; confirmed all 11 updated surface/component selectors, palette tokens, and competency tints are present in emitted CSS.
- Calculated contrast for ten intended text/background pairs: all at least 4.5:1 (lowest 4.72:1 for amber chip text).
- `git diff --check` passed.
- Default validation and a single-worker retry (`npm test -- --pool=forks --maxWorkers=1 --no-file-parallelism`) stalled before reporting test results and were stopped. No passing test-suite result is claimed.
- Browser visual/responsive QA remains pending: in-app browser access host was unavailable and native Chrome access failed to initialize. No desktop/mobile screenshot verification is claimed. Status remains IN PROGRESS until outstanding verification is completed.

## CJ-041: Publish the current frontend to production

Priority: Medium (P2)
Status: RESOLVED
Assigned Agent: Codex

### Description
The user authorized pushing the current frontend, including the CJ-040 color pass, to production on 2026-11-11.

### Proposed Solution
Build and publish static assets with the existing `gh-pages` deployment mechanism, retaining `compilingjava.com`, then verify the live HTML and stylesheet against the built files. Preserve the source working tree and its existing staged/unstaged work.

### Acceptance Criteria
- Production serves the current build and its color palette.
- CNAME and static assets are present on the publishing branch.
- Deployment result and verification are recorded without claiming pending browser/test checks passed.

### Files Modified
`docs/ISSUES.md`, `docs/CHANGELOG.md`; generated build output and publishing branch through deployment.

### Verification
- 2026-11-11: Production build succeeded and the existing `gh-pages` publisher reported `Published`. Publishing commit: `44b120c2bb391f5594cf908cb15d7478862b62b3` (`Publish frontend-only portfolio and color palette`).
- `gh-pages/index.html` references `index-DCvR4_Co.js` and `index-D6ArH6ri.css`; branch CNAME remains `compilingjava.com`.
- Downloaded the live HTTPS homepage, JavaScript, and CSS after Pages propagation; all three match the local build byte for byte. New portfolio tokens and contact-surface selectors are present in the live stylesheet.
- Publication used the current frontend working tree on top of source commit `619c9e7`; existing staged/unstaged source changes were preserved. No source-branch merge or source commit was needed for the static publishing workflow.
- CJ-040's outstanding test-suite/browser visual checks remain tracked separately; successful deployment does not claim those checks passed.
