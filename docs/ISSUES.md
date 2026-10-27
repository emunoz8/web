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
| CJ-001 | High (P1) | TODO (Needs decision) | Unassigned | Migration | Preserve selected API-only content |
| CJ-002 | High (P1) | TODO | Unassigned | Migration | Replace public content API reads |
| CJ-003 | High (P1) | TODO | Unassigned | Migration | Remove global authentication dependency |
| CJ-004 | High (P1) | TODO (Needs decision) | Unassigned | Migration | Retire or archive shared engagement |
| CJ-005 | High (P1) | TODO | Unassigned | Migration | Retire runtime admin publishing/API Lab |
| CJ-006 | High (P1) | TODO (Needs decision) | Unassigned | Migration | Convert or retire live AUX experience |
| CJ-007 | High (P1) | TODO (Needs decision) | Unassigned | Migration | Resolve terminal scope and API commands |
| CJ-008 | High (P1) | TODO | Unassigned | Migration | Remove unused backend request configuration |
| CJ-009 | High (P1) | TODO | Unassigned | Defect | Repair failing TypeScript test fixture |
| CJ-010 | High (P1) | TODO (Needs decision) | Unassigned | Defect | Resolve missing `/projects` route and preview |
| CJ-011 | High (P1) | TODO | Unassigned | Defect | Add global unknown-route behavior |
| CJ-012 | High (P1) | TODO (Needs decision) | Unassigned | Deployment | Establish root/subpath hosting contract |
| CJ-013 | High (P1) | TODO | Unassigned | Defect | Correct SPA path restoration decoding |
| CJ-014 | Medium (P2) | TODO | Unassigned | Tooling | Make validation/publishing reproducible |
| CJ-015 | Medium (P2) | TODO | Unassigned | Accessibility | Make content cards keyboard-operable |
| CJ-016 | Medium (P2) | TODO | Unassigned | Accessibility | Add complete dialog semantics/focus behavior |
| CJ-017 | Medium (P2) | TODO | Unassigned | Accessibility | Label game state and symmetry controls |
| CJ-018 | Medium (P2) | TODO | Unassigned | Accessibility | Remove nested link/button CTA |
| CJ-019 | Medium (P2) | TODO | Unassigned | Architecture | Consolidate content models/presentation helpers |
| CJ-020 | Medium (P2) | TODO (Needs decision) | Unassigned | Navigation | Align route, header, terminal, and blog navigation |
| CJ-021 | Medium (P2) | TODO | Unassigned | Styling | Isolate styles and remove overlapping definitions |
| CJ-022 | Low (P3) | TODO (Needs decision) | Unassigned | Styling | Resolve inactive dark-theme support |
| CJ-023 | Low (P3) | TODO | Unassigned | Cleanup | Review inactive components and content |
| CJ-024 | Medium (P2) | TODO | Unassigned | Documentation | Correct historical runtime claims and metadata |
| CJ-025 | Medium (P2) | TODO | Unassigned | Validation | Add meaningful retained-feature coverage |
| CJ-026 | Low (P3) | TODO | Unassigned | Performance | Review public images and font loading |
| CJ-027 | Low (P3) | TODO | Unassigned | Assets | Align menu image fallback paths with assets |
| CJ-028 | Low (P3) | TODO | Unassigned | Defect | Resolve API Lab actuator proxy mismatch |
| CJ-029 | Medium (P2) | TODO | Unassigned | Styling | Correct unsupported screenshot overlay utility |
| CJ-030 | Medium (P2) | TODO | Unassigned | Compatibility | Align React runtime and type versions |

---

## CJ-001: Preserve selected API-only content

Priority: High (P1)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

### Description
Home and About fetch published content; ProjectDetail falls back to API slugs; Blog has no local dataset. Four local case studies and older public Markdown do not establish a complete content backup. Actual database content was not inspected.

- **Affected:** [StandardHome](../frontend/src/features/standardUI/components/StandardHome.tsx), [About](../frontend/src/pages/About.tsx), [ProjectDetail](../frontend/src/pages/ProjectDetail.tsx), [Blog](../frontend/src/pages/Blog.tsx), [local projects](../frontend/src/features/portfolio/data/projects.ts), `frontend/public/content/`.
- **Dependency:** Content migration must not be declared complete before this inventory is resolved.

### Proposed Solution
Decide which writing/projects/categories/media to retain, obtain an authorized export, and map existing slugs/IDs to local content. Resolve duplicate local/API slugs explicitly.

### Acceptance Criteria
- Selected content and media are recoverable locally.
- Missing material is recorded.
- Old URL mappings and export provenance are documented.

### Files Modified
None

### Verification
Not started

---

## CJ-002: Replace public content API reads

Priority: High (P1)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-003: Remove global authentication dependency

Priority: High (P1)
Status: TODO
Assigned Agent: Unassigned

### Description
`AuthProvider` mounts for every route and requests session state. Login exchanges passwords/Google credentials with the backend; guards and consumers depend on that session.

- **Affected:** [Theme application shell](../frontend/src/context/Theme.tsx), [AuthContext](../frontend/src/context/AuthContext.tsx), [Login](../frontend/src/pages/Login.tsx), [RequireAdmin](../frontend/src/routes/RequireAdmin.tsx), [AppRoutes](../frontend/src/routes/AppRoutes.tsx), [authRouting](../frontend/src/lib/authRouting.ts), auth components.
- **Dependencies:** Coordinate CJ-004 through CJ-007 before removing the provider.

### Proposed Solution
Remove auth-dependent interactions as their features migrate, then retire login/guards/provider/background-login logic. Keep shell exceptions needed by retained demos in an appropriately named module.

### Acceptance Criteria
- Static page loads do not request sessions, Google config, or CSRF tokens.
- No live consumers require `useAuth`.
- Retired login and admin URLs have deliberate behavior.

### Files Modified
None

### Verification
Not started

---

## CJ-004: Retire or archive shared engagement

Priority: High (P1)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-005: Retire runtime admin publishing and API Lab

Priority: High (P1)
Status: TODO
Assigned Agent: Unassigned

### Description
Admin pages perform server mutations; API Lab exposes diagnostics, registration/reset, users, content, categories, comments, and likes. None is a static publishing workflow.

- **Affected:** [AdminProjects](../frontend/src/pages/admin/AdminProjects.tsx), [AdminBlog](../frontend/src/pages/admin/AdminBlog.tsx), [ApiLab](../frontend/src/pages/ApiLab.tsx), [route registry](../frontend/src/routes/publicRoutes.ts), `frontend/src/components/content/admin/`.
- **Dependencies:** CJ-001, CJ-002, CJ-003.

### Proposed Solution
Establish repository-based content authoring, then remove runtime admin/API Lab routes and exclusive components/hooks/models. Choose appropriate destinations for obsolete URLs. Preserve shared reader code only if retained consumers need it.

### Acceptance Criteria
- No reachable administration/mutation UI or related requests remain.
- A contributor can add/edit content through the documented build workflow.

### Files Modified
None

### Verification
Not started

---

## CJ-006: Convert or retire live AddToTheAUX

Priority: High (P1)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

### Description
Playlist, current playback, search, and additions use `/api/testing/*`. Search/add require auth; guest preview expires after five minutes. No local fixture fallback exists.

- **Affected:** [AddToTheAux](../frontend/src/pages/AddToTheAux.tsx), [AUX API helper](../frontend/src/features/addToTheAux/lib/api.ts), `frontend/src/features/addToTheAux/hooks/`, [OrbitalPlaylistStage](../frontend/src/features/addToTheAux/components/OrbitalPlaylistStage.tsx), [project metadata](../frontend/src/features/portfolio/data/projects.ts).
- **Decision needed:** Interactive local demo versus archived case study, and the old demo URL destination.

### Proposed Solution
Prefer a local interactive demonstration with fixtures/search/local additions if that experience is retained; otherwise make the case study/screenshots the destination. Remove backend polling, auth gating, guest expiry, and unsupported live claims.

### Acceptance Criteria
- Chosen AUX experience works without application APIs, including after old guest-preview storage has expired.
- Behavior is accurately described.

### Files Modified
None

### Verification
Not started

---

## CJ-007: Resolve terminal scope and remove API commands

Priority: High (P1)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

### Description
`resolveTerminalApiCommand()` fetches session/content/categories. `useTerminalSession()` handles login, logout, and admin navigation. Commands are independent of page content requests.

- **Affected:** [terminalShell](../frontend/src/features/portfolio/data/terminalShell.ts), [useTerminalSession](../frontend/src/features/terminalUI/hooks/useTerminalSession.ts), [TerminalUI](../frontend/src/features/terminalUI/components/TerminalUI.tsx), [SiteUiModeContext](../frontend/src/context/SiteUiModeContext.tsx).
- **Decision needed:** Whether terminal mode remains in the redesign.

### Proposed Solution
If retained, separate command definitions/local resolution from rendering and use local selectors. Retire remote/auth commands or replace them with clearly local equivalents. Update help, aliases, routes, and telemetry text together.

### Acceptance Criteria
- No supported command issues application API requests.
- Help and navigation agree with the final routes.
- Retained shortcuts and history work.

### Files Modified
None

### Verification
Not started

---

## CJ-008: Remove backend request/configuration remnants

Priority: High (P1)
Status: TODO
Assigned Agent: Unassigned

### Description
Main/AUX API bases, Google client ID, CSRF helpers, legacy REACT_APP exposure/types, and Vite proxy remain. AUX permits a separate origin while CSRF initialization uses the main API base; cross-origin behavior was not verified.

- **Affected:** [api.ts](../frontend/src/lib/api.ts), [csrf.ts](../frontend/src/lib/csrf.ts), [env.ts](../frontend/src/lib/env.ts), [vite-env.d.ts](../frontend/src/vite-env.d.ts), [vite.config.ts](../frontend/vite.config.ts), [Google declarations](../frontend/src/types/google-identity.d.ts), AUX API helper.
- **Dependencies:** CJ-002 through CJ-007.

### Proposed Solution
After consumers migrate, remove unused networking/env/proxy/auth declarations; retain useful content types in a local content module if needed.

### Acceptance Criteria
- Build needs no backend environment.
- Reference searches and network inspection find no remaining application API, CSRF, or auth dependency (static asset fetching is still allowed).

### Files Modified
None

### Verification
Not started

---

## CJ-009: Repair the failing TypeScript fixture

Priority: High (P1)
Status: TODO
Assigned Agent: Unassigned

### Description
`./node_modules/.bin/tsc --noEmit --incremental false` exited 2 during baseline analysis. At line 36, the blog editor fixture lacks `deleteLoading` and `delete`, required by `BlogEditEditorState`.

- **Affected:** [AdminEditorFormViewModels.test.ts](../frontend/src/components/content/admin/models/AdminEditorFormViewModels.test.ts), [useAdminBlogEditor.ts](../frontend/src/components/content/admin/hooks/useAdminBlogEditor.ts).

### Proposed Solution
Add the missing fixture properties when code changes are authorized, or retire the test with the entire obsolete admin subsystem. Do not conceal the failure through weakened type checking.

### Acceptance Criteria
- The no-emit check passes for the resulting source tree.
- Relevant retained tests pass (or if retired, record as superseded by CJ-005).

### Files Modified
None

### Verification
Not started (baseline `./node_modules/.bin/tsc --noEmit --incremental false` reproduced exit code 2).

---

## CJ-010: Resolve `/projects` and its broken preview

Priority: High (P1)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-011: Provide a global not-found route

Priority: High (P1)
Status: TODO
Assigned Agent: Unassigned

### Description
`AppRoutes` maps registered routes with no top-level wildcard. JIT Cafe has a nested wildcard redirect; project details have a content-specific missing state. Neither covers all unknown URLs.

- **Affected:** [AppRoutes](../frontend/src/routes/AppRoutes.tsx), [publicRoutes](../frontend/src/routes/publicRoutes.ts), [ProjectDetail](../frontend/src/pages/ProjectDetail.tsx), [JitCafeFeature](../frontend/src/features/jitCafe/JitCafeFeature.tsx).

### Proposed Solution
Add coherent application not-found behavior and explicit redirects for retired URLs. Keep deployment fallback and application not-found handling distinct.

### Acceptance Criteria
- Unknown top-level and deep paths show a usable destination.
- Retained routes and login retirement mappings do not regress.

### Files Modified
None

### Verification
Not started

---

## CJ-012: Establish the hosting base-path contract

Priority: High (P1)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

### Description
CNAME, root-relative assets, router without basename, default Vite base, root manifest start URL, and `/?spa-path=` redirect assume root hosting. Repository `/web/` hosting is not configured. Live Pages/DNS/HTTPS settings are unknown.

- **Affected:** [vite.config.ts](../frontend/vite.config.ts), [Theme](../frontend/src/context/Theme.tsx), [index.html](../frontend/index.html), [404.html](../frontend/public/404.html), [CNAME](../frontend/public/CNAME), [manifest](../frontend/public/meta/manifest.json), asset/route data.
- **Decision needed:** Custom-domain root versus repository subpath.

### Proposed Solution
Confirm the intended domain; align router/assets/fallback/metadata consistently for that target. Preserve root paths if the site stays at the custom-domain root.

### Acceptance Criteria
- Direct routes, assets, iframes, PDF, queries, and hashes work from the selected hosting URL.
- Remote settings are documented only after verification.

### Files Modified
None

### Verification
Not started

---

## CJ-013: Correct double decoding in SPA restoration

Priority: High (P1)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-014: Make validation and publishing reproducible

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-015: Make content cards keyboard-operable

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

### Description
`ContentCard` attaches opening behavior to a clickable `<li>` without keyboard support. Nested Edit is a separate button.

- **Affected:** [ContentCard](../frontend/src/components/content/ContentCard.tsx), [ContentFeed](../frontend/src/components/content/ContentFeed.tsx).

### Proposed Solution
Use an appropriate native link/button for opening content and keep edit actions separate if still present; expose useful accessible names/focus indication.

### Acceptance Criteria
- Every retained card can be opened using the keyboard with correct semantics, without activating edit or creating nested interactive controls.

### Files Modified
None

### Verification
Not started

---

## CJ-016: Complete dialog semantics and focus management

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

### Description
Content/login dialogs lack accessible names and focus management. Screenshot dialog is named but has no focus trap/return. Escape and backdrop close are implemented, which does not complete dialog behavior.

- **Affected:** [ContentModal](../frontend/src/components/common/ContentModal.tsx), [LoginFrame](../frontend/src/components/auth/LoginFrame.tsx), [ProjectPreviewFrame](../frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx).

### Proposed Solution
For retained dialogs, provide naming, focus entry/trapping/restoration, background interaction handling, Escape/close behavior, and scroll management. Retire login dialog through migration instead of investing in obsolete UI.

### Acceptance Criteria
- Keyboard and screen-reader checks confirm a named dialog, contained interaction, and focus return to its opener on close.

### Files Modified
None

### Verification
Not started

---

## CJ-017: Improve game control announcements

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

### Description
`BoardView` announces only cell index, omitting X/O/empty state. Symmetry range inputs have no explicit accessible label. Status is ordinary text.

- **Affected:** [BoardView](../frontend/src/features/ticTacToe/components/BoardView.tsx), [StateCyclePreview](../frontend/src/features/ticTacToe/components/StateCyclePreview.tsx), [TreeControls](../frontend/src/features/ticTacToe/components/TreeControls.tsx), [StateGroupCard](../frontend/src/features/ticTacToe/components/StateGroupCard.tsx).

### Proposed Solution
Expose board position/state and meaningful slider labels/value text; review turn/result announcements and keyboard behavior inside selectable state cards.

### Acceptance Criteria
- A nonvisual keyboard user can understand positions, play legal moves, inspect hints, and recognize game completion.

### Files Modified
None

### Verification
Not started

---

## CJ-018: Remove the nested interactive JIT Cafe CTA

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

### Description
The home page wraps `<Button>` in a router `<Link>` for Explore food menu.

- **Affected:** [HomePage](../frontend/src/features/jitCafe/pages/HomePage.tsx), [Button](../frontend/src/features/jitCafe/components/ui/Button.tsx).

### Proposed Solution
Render a single navigation link with the required button styling, or use a component interface that emits one appropriate interactive element.

### Acceptance Criteria
- The CTA has one focus stop and correct link semantics, and navigation still works.

### Files Modified
None

### Verification
Not started

---

## CJ-019: Consolidate local content and presentation helpers

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-020: Align navigation and writing discovery

Priority: Medium (P2)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

### Description
Standard header uses profile navigation, not route `showInNav` flags; Blog is absent there. Terminal maintains separate routes/aliases. Blog posts are modal-only. Standalone game/AUX omit standard return navigation.

- **Affected:** [publicRoutes](../frontend/src/routes/publicRoutes.ts), [profile.ts](../frontend/src/features/portfolio/data/profile.ts), [terminalShell](../frontend/src/features/portfolio/data/terminalShell.ts), [StandardHeader](../frontend/src/features/standardUI/components/StandardHeader.tsx), [Blog](../frontend/src/pages/Blog.tsx), standalone demos.
- **Decisions needed:** Blog, `/projects`, terminal, and demo navigation scope.

### Proposed Solution
Choose final information architecture and shared route metadata; decide writing placement/deep links and standalone demo return paths. Align terminal commands if retained.

### Acceptance Criteria
- Every retained public feature has an intentional discovery and return path.
- Navigation targets agree with routes.
- Modal versus page reading is documented.

### Files Modified
None

### Verification
Not started

---

## CJ-021: Isolate styles and remove overlapping definitions

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-022: Resolve inactive dark-theme support

Priority: Low (P3)
Status: TODO (Needs decision)
Assigned Agent: Unassigned

### Description
ThemeProvider forces light mode while dark tokens/variants remain. The standard/terminal UI toggle is a different concept.

- **Affected:** [ThemeProvider](../frontend/src/context/ThemeProvider.tsx), [global styles](../frontend/src/styles/index.css), [Tailwind config](../frontend/tailwind.config.js), dark variants in components/feature CSS.

### Proposed Solution
Decide whether the redesign supports light only or an actual theme choice; then remove inactive branches or implement/test the intended behavior. Do not infer that terminal means dark mode.

### Acceptance Criteria
- Theme controls, context, tokens, and documentation describe the same supported states.

### Files Modified
None

### Verification
Not started

---

## CJ-023: Review inactive components and old content

Priority: Low (P3)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-024: Update documentation, metadata, and runtime claims

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-025: Establish meaningful retained-feature coverage

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-026: Review asset weight and font loading

Priority: Low (P3)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

---

## CJ-027: Fix menu image fallback/asset mismatch

Priority: Low (P3)
Status: TODO
Assigned Agent: Unassigned

### Description
MenuItemImage constructs `<slug>.svg` fallback paths from `menuImageSlugs`, but those SVG files were not found in the JIT Cafe public assets. Configured snapshot WebP paths are mapped to existing photos; failure behavior falls through to decorative styling.

- **Affected:** [MenuItemImage](../frontend/src/features/jitCafe/components/menu/MenuItemImage.tsx), [menuImageSlugs](../frontend/src/features/jitCafe/components/menu/menuImageSlugs.ts), [staticMenuSnapshot](../frontend/src/features/jitCafe/data/staticMenuSnapshot.ts), JIT Cafe assets.

### Proposed Solution
Use existing local fallback media or remove the missing-file candidate layer; keep a deliberate final empty-image presentation.

### Acceptance Criteria
- Missing primary images produce a useful accessible fallback without requesting nonexistent named SVGs.

### Files Modified
None

### Verification
Not started

---

## CJ-028: Resolve API Lab's actuator proxy mismatch

Priority: Low (P3)
Status: TODO
Assigned Agent: Unassigned

### Description
API Lab calls same-origin `/actuator/health` and `/actuator/info` when the API base is empty, while Vite proxies only `/api`. The display also mentions a CRA proxy despite using Vite.

- **Affected:** [ApiLab](../frontend/src/pages/ApiLab.tsx), [vite.config.ts](../frontend/vite.config.ts).

### Proposed Solution
Prefer retiring this with CJ-005; only repair/document diagnostics routing if the user explicitly needs it during transition. Do not expand backend infrastructure for the final static site.

### Acceptance Criteria
- The obsolete console is removed, or transitional diagnostics are explicitly verified and documented (record `SUPERSEDED` if retirement resolves it).

### Files Modified
None

### Verification
Not started

---

## CJ-029: Correct the screenshot viewer overlay utility

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

### Description
ProjectPreviewFrame uses `bg-brand-overlay/72`; Tailwind's `brand` color map does not include `overlay`. Defining `--brand-overlay` in CSS alone does not define that utility. Actual compiled appearance was not inspected.

- **Affected:** [ProjectPreviewFrame](../frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx), [tailwind.config.js](../frontend/tailwind.config.js), [global styles](../frontend/src/styles/index.css).

### Proposed Solution
Use a supported overlay class/style/token as part of the retained dialog implementation; verify compiled CSS instead of assuming the class exists.

### Acceptance Criteria
- Image viewer has the intended backdrop and readable controls in the production build and supports the focus behavior in CJ-016.

### Files Modified
None

### Verification
Not started

---

## CJ-030: Align React runtime and type versions

Priority: Medium (P2)
Status: TODO
Assigned Agent: Unassigned

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
None

### Verification
Not started

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
