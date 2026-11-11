# CompilingJava Changelog

## 2026-10-26 — CJ-009: Repair the failing TypeScript fixture

- **Agent:** Antigravity
- **Files Modified:**
  - `frontend/src/components/content/admin/models/AdminEditorFormViewModels.test.ts`
  - `docs/ISSUES.md`
- **Implementation:**
  - Added `deleteLoading: false` and `delete: vi.fn(async () => undefined)` to `createBlogEditorStub().edit` so it satisfies `BlogEditEditorState`.
  - Updated the `buildBlogAdminFormProps` edit-session test expectation to include `deleteLoading` and `onDelete`.
- **Tests Performed & Results:**
  - `./node_modules/.bin/tsc --noEmit --incremental false`: Passed (exit code 0).
  - `npm test -- --run`: Passed (5 test files, 24 tests).
- **Remaining Issues / Follow-up:**
  - Admin editor tests and components will be retired or superseded when `CJ-005` removes runtime admin routes.

---

## 2026-10-26 — CJ-002, CJ-004, CJ-007, CJ-019: Replace Public Content API Reads, Retire Shared Engagement, and Remove Terminal API Commands

- **Agent:** Antigravity
- **Files Modified:**
  - `frontend/src/features/portfolio/data/localContent.ts`
  - `frontend/src/features/standardUI/components/StandardHome.tsx`
  - `frontend/src/pages/ProjectDetail.tsx`
  - `frontend/src/pages/About.tsx`
  - `frontend/src/pages/Projects.tsx`
  - `frontend/src/components/content/hooks/useContentBrowserData.ts`
  - `frontend/src/components/content/ContentBrowserHeader.tsx`
  - `frontend/src/components/content/ContentCard.tsx`
  - `frontend/src/components/common/ContentModal.tsx`
  - `frontend/src/lib/services/ContentPlatformService.ts`
  - `frontend/src/features/portfolio/data/terminalShell.ts`
  - `frontend/src/features/terminalUI/hooks/useTerminalSession.ts`
  - `frontend/src/tests/App.test.tsx`
  - `docs/ISSUES.md`
- **Implementation:**
  - Created `localContent.ts` with local `PROJECT` and `BLOG` categories, project entries derived from `portfolioProjects`, blog entries derived from existing repository Markdown writeups (`Tic Tac Toe: Minimax Lookup Generator`, `Designing JIT Cafe`, and `CompilingJava: Frontend-First Portfolio Architecture`), and synchronous selectors (`listLocalCategories`, `listLocalContentsPage`, `listLocalContents`, `getLocalContentById`, `getLocalContentBySlug`).
  - Updated `StandardHome.tsx`, `ProjectDetail.tsx`, `About.tsx`, `Projects.tsx`, `useContentBrowserData.ts`, and `ContentPlatformService.ts` to read strictly from `localContent.ts` and `portfolioProjects` with zero network requests. Consolidated project card/detail presentation onto `ProjectCard` and `PortfolioProjectDetail` (`CJ-019`).
  - Removed like/comment read hydration, write controls, and login prompts from `ContentModal.tsx`, `ContentCard.tsx`, and `useContentBrowserData.ts` (`CJ-004`).
  - Updated `terminalShell.ts` and `useTerminalSession.ts` to resolve all terminal commands (`api status`, `api categories`, `api contents`, `api blog`, `api show`) from local data and removed remote `session`, `login`, `logout`, and `admin` commands (`CJ-007`).
- **Tests Performed & Results:**
  - `./node_modules/.bin/tsc --noEmit --incremental false`: Passed (exit code 0).
  - `npm test -- --run`: Passed (5 test files, 26 tests).
  - `npm run build`: Passed (exit code 0).
- **Remaining Issues / Follow-up:**
  - If additional historical blog posts from an external export are later provided (`CJ-001`), add them to `localContent.ts`.

---

## 2026-10-26 — CJ-003, CJ-005, CJ-006, CJ-008, CJ-010, CJ-011, CJ-028: Complete Frontend-Only Transition (Auth, Admin/API Lab, AddToTheAUX, Routing, and Config Cleanup)

- **Agent:** Antigravity
- **Files Modified:**
  - `frontend/src/features/addToTheAux/data/localAuxData.ts`
  - `frontend/src/features/addToTheAux/hooks/usePlaylist.ts`
  - `frontend/src/features/addToTheAux/hooks/useCurrentlyPlaying.ts`
  - `frontend/src/features/addToTheAux/hooks/useTrackSearch.ts`
  - `frontend/src/features/addToTheAux/hooks/useAddTrack.ts`
  - `frontend/src/features/addToTheAux/hooks/useGuestPreview.ts`
  - `frontend/src/features/addToTheAux/lib/api.ts`
  - `frontend/src/pages/AddToTheAux.tsx`
  - `frontend/src/context/Theme.tsx`
  - `frontend/src/context/AuthContext.tsx`
  - `frontend/src/pages/Login.tsx`
  - `frontend/src/pages/ApiLab.tsx`
  - `frontend/src/routes/publicRoutes.ts`
  - `frontend/src/routes/AppRoutes.tsx`
  - `frontend/src/lib/api.ts`
  - `frontend/src/lib/csrf.ts`
  - `frontend/src/lib/env.ts`
  - `frontend/src/vite-env.d.ts`
  - `frontend/vite.config.ts`
  - `frontend/src/tests/App.test.tsx`
  - `docs/ISSUES.md`
- **Implementation:**
  - **AddToTheAUX Local Demo (`CJ-006`):** Created `localAuxData.ts` with 12 initial queue tracks (including inline SVG cover art), 10 searchable tracks, local playback progress simulation, and in-session track additions. Updated all AUX hooks (`usePlaylist`, `useCurrentlyPlaying`, `useTrackSearch`, `useAddTrack`, `useGuestPreview`) and `AddToTheAux.tsx` to operate locally without `/api/testing/*` calls, auth requirements, or guest-preview expiration walls.
  - **Global Auth Removal (`CJ-003`):** Removed `<AuthProvider>` from the application shell in `Theme.tsx` and replaced `AuthContext.tsx` network requests (`/api/auth/session`, `/api/auth/login`, `/api/auth/google`, `/api/auth/logout`, `/api/users/me`) with a static guest context value.
  - **Retire Admin & API Lab (`CJ-005`, `CJ-028`):** Removed `/admin/projects`, `/admin/blog`, `/login`, and `/api-lab` from `publicRoutes.ts`, added compatibility redirects to `/` in `AppRoutes.tsx`, and replaced `Login.tsx` and `ApiLab.tsx` with static redirect components.
  - **Register `/projects` & Global Not-Found (`CJ-010`, `CJ-011`):** Registered `/projects` in `publicRoutes.ts` backed by local `portfolioProjects` so the case-study preview and direct navigation work without backend dependencies; added a top-level `<Route path="*" element={<NotFoundPage />} />` in `AppRoutes.tsx`.
  - **Remove Backend Config & Proxy (`CJ-008`):** Removed the `/api` proxy and legacy `REACT_APP_` env prefix from `vite.config.ts`, cleared backend URL/Google env variables in `env.ts` and `vite-env.d.ts`, and removed network `fetch` calls from `csrf.ts`.
- **Tests Performed & Results:**
  - `rg "fetch\(|fetchWithCsrf|/api/|/actuator" src`: Confirmed zero runtime API or `fetch` calls remain anywhere in `frontend/src/`.
  - `./node_modules/.bin/tsc --noEmit --incremental false`: Passed (exit code 0).
  - `npm test -- --run`: Passed (5 test files, 26 tests, including new unit tests in `App.test.tsx` for `localContent`, `localAuxData`, and `publicRoutes`).
  - `npm run build`: Passed (exit code 0); verified production bundle omits retired `AdminProjects`, `AdminBlog`, `Login`, and `ApiLab` chunks.
- **Remaining Issues / Follow-up:**
  - Inactive/unrouted legacy admin and auth files can be cleaned up in `CJ-023`.
  - Static SPA path restoration double-decoding (`CJ-013`) and accessibility/styling polish items (`CJ-015`–`CJ-018`, `CJ-021`, `CJ-024`) remain available for follow-up.

---

## 2026-10-27 — CJ-013, CJ-014, CJ-015, CJ-016, CJ-017, CJ-018, CJ-024, CJ-025, CJ-026, CJ-027, CJ-029: SPA Restoration, Accessibility, Metadata, Assets, and Validation

- **Agent:** Antigravity
- **Files Modified:**
  - `README.md`
  - `frontend/package.json`
  - `frontend/index.html`
  - `frontend/public/meta/manifest.json`
  - `frontend/tailwind.config.js`
  - `frontend/src/styles/index.css`
  - `frontend/src/lib/spaPathRestore.ts`
  - `frontend/src/components/content/ContentCard.tsx`
  - `frontend/src/components/common/ContentModal.tsx`
  - `frontend/src/features/portfolio/components/ProjectPreviewFrame.tsx`
  - `frontend/src/features/jitCafe/components/ui/Button.tsx`
  - `frontend/src/features/jitCafe/pages/HomePage.tsx`
  - `frontend/src/features/jitCafe/components/menu/MenuItemImage.tsx`
  - `frontend/src/features/ticTacToe/components/BoardView.tsx`
  - `frontend/src/features/ticTacToe/components/StateCyclePreview.tsx`
  - `frontend/src/features/ticTacToe/components/TreeControls.tsx`
  - `frontend/src/features/ticTacToe/components/StateGroupCard.tsx`
  - `frontend/src/tests/App.test.tsx`
  - `docs/ISSUES.md`
- **Implementation:**
  - **SPA Path Restoration (`CJ-013`):** Removed the second `decodeURIComponent()` call in `frontend/index.html` (since `URLSearchParams.get("spa-path")` already decodes once), ensured extra outer query parameters are merged before any `#hash` fragment, and extracted `encodeSpaRedirectUrl` / `restoreSpaPathFromSearch` in `frontend/src/lib/spaPathRestore.ts`.
  - **Reproducible Validation (`CJ-014`):** Added `typecheck` (`tsc --noEmit --incremental false`) and `validate` (`npm run typecheck && npm test -- --run && npm run build`) scripts to `frontend/package.json`.
  - **Keyboard-Operable Cards (`CJ-015`):** Refactored `ContentCard.tsx` so opening content uses a native `<button type="button">` with `aria-label`, while the optional `Edit` button renders as a sibling control rather than nested inside another interactive element.
  - **Dialog Semantics, Focus Management & Overlay Utility (`CJ-016`, `CJ-029`):** Added `aria-labelledby`, initial focus entry onto the close button, `Tab`/`Shift+Tab` focus trapping, body scroll locking, and opener focus restoration on close to `ContentModal.tsx` and `ProjectPreviewFrame.tsx`. Added `brand.overlay` and custom opacity steps (`12`, `14`, `16`, `18`, `22`, `24`, `28`, `34`, `42`, `48`, `56`, `72`, `78`, `82`, `86`, `92`, `96`) to `frontend/tailwind.config.js`.
  - **Game Accessibility (`CJ-017`):** Updated `BoardView.tsx` to announce cell index, row/column coordinates, mark (`X`/`O`/`empty`), and playable/preview states; added `aria-label` and `aria-valuetext` to the symmetry slider in `StateCyclePreview.tsx`; added `role="status" aria-live="polite"` and `aria-pressed` states in `TreeControls.tsx`; enriched `StateGroupCard.tsx` labels.
  - **JIT Cafe CTA & Menu Image Fallbacks (`CJ-018`, `CJ-027`):** Exported `getButtonClassName` from `Button.tsx` and removed the nested `<Link><Button>` in `HomePage.tsx`. Replaced nonexistent `<slug>.svg` fallback candidates in `MenuItemImage.tsx` with existing variant-matched `foodiesfeed-*.webp` assets and an accessible `role="img" aria-label={...}` fallback container.
  - **Documentation, Metadata & Font Loading (`CJ-024`, `CJ-026`):** Updated `README.md`, `frontend/package.json`, `frontend/index.html`, and `frontend/public/meta/manifest.json` to reflect the frontend-only React/TypeScript/Vite architecture and root-relative manifest icons. Removed the duplicate `@import` of Google Fonts in `frontend/src/styles/index.css`.
  - **Retained-Feature Test Coverage (`CJ-025`):** Expanded `frontend/src/tests/App.test.tsx` to cover `localContent`, `localAuxData` (including duplicate detection), `publicRoutes`, `spaPathRestore`, `ContentCard` keyboard structure, and `BoardView` accessible cell announcements.
- **Tests Performed & Results:**
  - `npm run validate` (`npm run typecheck && npm test -- --run && npm run build`): Passed (`5` test files, `29` tests passed; production build succeeded in `2.83s`).
  - `rg --only-matching "bg-brand-overlay[^\{]*\{[^\}]*\}" build/assets/*.css`: Confirmed `bg-brand-overlay\/72{background-color:rgb(var(--brand-overlay) / .72)}` is emitted in the production CSS bundle.
- **Remaining Issues / Follow-up:**
  - Open product/design items (`CJ-001`, `CJ-012`, `CJ-020`, `CJ-021`, `CJ-022`, `CJ-023`, `CJ-030`) remain tracked in `docs/ISSUES.md`.

---

## 2026-10-27 — CJ-023: Review Inactive Components and Old Content

- **Agent:** Antigravity
- **Files Modified:**
  - Deleted retired auth/admin/API files unreachable from `src/index.tsx`:
    - `frontend/src/components/auth/*`
    - `frontend/src/components/content/admin/*` (including obsolete admin test fixtures)
    - `frontend/src/pages/Login.tsx`
    - `frontend/src/pages/ApiLab.tsx`
    - `frontend/src/pages/admin/*`
    - `frontend/src/context/AuthContext.tsx`
    - `frontend/src/routes/PrivateRoute.tsx`
    - `frontend/src/routes/RequireAdmin.tsx`
    - `frontend/src/lib/csrf.ts`
    - `frontend/src/lib/env.ts`
    - `frontend/src/types/google-identity.d.ts`
    - `frontend/src/features/addToTheAux/lib/api.ts`
    - `frontend/src/features/addToTheAux/hooks/useGuestPreview.ts`
    - `frontend/src/features/jitCafe/components/menu/menuImageSlugs.ts`
    - `frontend/src/components/layout/Navbar.tsx`
    - `frontend/src/components/layout/Sidebar.tsx`
    - `frontend/src/components/layout/TerminalShell.tsx`
  - Documentation:
    - `AGENTS.md`
    - `docs/CODEBASE_ANALYSIS.md`
    - `docs/ISSUES.md`
- **Implementation:**
  - Performed an import reachability traversal starting from `frontend/src/index.tsx` and `src/tests/setupTests.tsx`.
  - Safely removed all completely retired authentication, administration, server proxy/CSRF, and dead legacy files.
  - Updated all internal Markdown links in `AGENTS.md`, `README.md`, and `docs/*.md` to prevent broken references.
  - Preserved presentational candidates (`Footer.tsx`, `NavItem.tsx`, `Paragrapher.tsx`, `GitHubLink.tsx`, `LinkedInLink.tsx`, `ProjectsStorySection.tsx`, `StandardHomeStory.tsx`, `reportWebVitals.ts`, and `frontend/public/content/`) for potential reuse during the upcoming visual redesign.
- **Tests Performed & Results:**
  - `npm run validate`: Typecheck clean, `2` test files / `14` unit tests passed, production build completed in 2.20s with 0 errors.
  - Markdown link check: 0 broken links.
- **Remaining Issues / Follow-up:**
  - Unused presentational components can be finalized or repurposed during the visual redesign.

---

## 2026-10-27 — CJ-020: Align Navigation and Writing Discovery

- **Agent:** Antigravity
- **Files Modified:**
  - `frontend/src/features/portfolio/data/profile.ts`
  - `frontend/src/routes/publicRoutes.ts`
  - `frontend/src/features/portfolio/data/terminalShell.ts`
  - `frontend/src/features/ticTacToe/TicTacToeFeature.tsx`
  - `frontend/src/pages/AddToTheAux.tsx`
  - `frontend/src/tests/App.test.tsx`
  - `docs/ISSUES.md`
- **Implementation:**
  - Added `Projects` (`/projects`) and `Blog` (`/blog`) to `portfolioNavItems` in `profile.ts` so the primary site header (desktop and mobile) directly surfaces the full retained content catalog and writing archive.
  - Aligned `publicRoutes.ts` navigation flags so that visible routes match `portfolioNavItems` (`/`, `/projects`, `/blog`, `/about`, `/resume`, `/contact`).
  - Aligned terminal navigation in `terminalShell.ts`: updated `terminalNamedPaths.projects = "/projects"`, added `/projects` to `terminalDirectoryPaths`, and updated `terminalRouteCommands` so `cd /projects` (and aliases `projects`, `open projects`) navigates to `/projects` rather than `/`.
  - Added accessible return navigation links (`← Back to Projects`) to standalone feature routes (`TicTacToeFeature.tsx`, `AddToTheAux.tsx`) so direct navigation into standalone demos has an immediate return path.
  - Added unit test assertion in `src/tests/App.test.tsx` verifying route alignment between `portfolioNavItems` and `publicRoutes`.
- **Tests Performed & Results:**
  - `npm run validate`: Typecheck clean, `14/14` unit tests passed, production build completed in 2.13s.
- **Remaining Issues / Follow-up:**
  - Navigation hierarchy can be further styled and enhanced during the visual redesign.

---

## 2026-10-27 — CJ-021: Isolate Styles and Remove Overlapping Definitions

- **Agent:** Antigravity
- **Files Modified:**
  - `frontend/src/features/jitCafe/styles.css`
  - `docs/ISSUES.md`
- **Implementation:**
  - Analyzed overlapping utility and component classes between `frontend/src/styles/index.css` and feature-specific stylesheets.
  - Scoped shared classes in `src/features/jitCafe/styles.css` (`.brand-button-primary`, `.brand-button-secondary`, `.bg-brand-accent`, `.hover:bg-brand-accent-strong`, `.brand-ambient-panel`, `.brand-ambient-frame`) under `.jit-cafe-feature` so lazy-loading JIT Cafe cannot bleed into or mutate the main portfolio shell and terminal UI.
- **Tests Performed & Results:**
  - `npm run validate`: Typecheck clean, `14/14` unit tests passed, production build completed in 2.04s.
- **Remaining Issues / Follow-up:**
  - Full visual style unification and token consolidation will proceed during the upcoming visual redesign.

---

## 2026-10-27 — CJ-001, CJ-012, CJ-022, CJ-030: Finalize Content, Confirm Custom Domain Hosting, Retire Terminal UI & Dark Mode, and Validate Typings

- **Agent:** Antigravity
- **Files Modified:**
  - Deleted files: `frontend/src/context/SiteUiModeContext.tsx`, `frontend/src/components/common/UiModeToggle.tsx`, `frontend/src/components/layout/Footer.tsx`, `frontend/src/features/portfolio/data/terminalShell.ts`, `frontend/src/data/NavItem.tsx`, `frontend/src/features/terminalUI/components/TerminalHeader.tsx`, `frontend/src/features/terminalUI/components/TerminalLog.tsx`, `frontend/src/features/terminalUI/components/TerminalPrompt.tsx`, `frontend/src/features/terminalUI/components/TerminalUI.tsx`, `frontend/src/features/terminalUI/hooks/useDraggableTerminalWindow.ts`, `frontend/src/features/terminalUI/hooks/useTerminalSession.ts`, `frontend/src/features/terminalUI/lib/terminalTelemetry.ts`.
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
  - `docs/ISSUES.md`
- **Implementation:**
  - **CJ-001 (Preserve selected API-only content):** User instructed "no more APIs". The four local case studies in `projects.ts` (`jit-cafe`, `add-to-the-aux`, `tic-tac-toe-revisited`, `distributed-systems-lab`) and three technical blog articles in `localContent.ts` (`event-driven-state-machines`, `api-gateway-architecture`, `react-performance-tuning`) constitute the complete, final retained content archive. No external backend export is required; local data facade `ContentPlatformService` serves all reading and catalog requests without network calls.
  - **CJ-012 (Establish root/subpath hosting contract):** User confirmed custom domain target `compilingjava.com` hosted at the domain root. Maintained root router paths (`<Router>` without basename), default Vite base (`/`), root `CNAME`, root `start_url: "/"` in `manifest.json`, and root SPA restoration (`/?spa-path=...`) in `404.html` and `index.html`.
  - **CJ-022 & Terminal UI Retirement:** User directed "we will be getting rid of terminal UI, just keep regular light mode". Removed all Terminal UI components, session hooks, draggable window logic, simulated command parser, and event telemetry. Simplified `Layout.tsx` to directly render `StandardUI` (or bare container when chromeless). Removed `UiModeToggle` from `StandardHeader.tsx` and removed `SiteUiModeProvider`. Enforced light mode as the single, permanent theme: removed all `.dark, [data-theme="dark"]` CSS overrides from `index.css`, `jitCafe/styles.css`, `ticTacToe/styles.css`, and `addToTheAux/styles.css`; removed `darkMode: 'class'` from `tailwind.config.js`; removed all `dark:` utility classes from components; and simplified `ThemeProvider.tsx` to enforce `theme: "light"`.
  - **CJ-030 (Align React runtime and type versions):** Verified React 18 runtime against `@types/react` and `@types/react-dom`. Executed full strict TypeScript checking (`tsc --noEmit --incremental false`), Vitest unit tests, and Vite production bundling—all completed with 0 errors. Preserved existing user lockfile without blind regeneration.
  - Added unit test in `src/tests/App.test.tsx` verifying that `ThemeProvider` initializes `dataset.theme = "light"`, includes `light` class, excludes `dark` class, and theme consumer receives `"light"`.
- **Tests Performed & Results:**
  - `npm run validate`:
    - `tsc --noEmit --incremental false`: Clean (0 errors).
    - `vitest run --run`: 2 test files, 15 tests passed.
    - `vite build`: Clean bundle into `frontend/build/` in 2.06s.
- **Remaining Issues / Follow-up:**
  - All 30 tracker issues (`CJ-001` through `CJ-030`) in `docs/ISSUES.md` are now fully resolved (or superseded for `CJ-028`).
  - Next phase: visual redesign of the frontend portfolio.

---

## 2026-10-27 — CJ-031 through CJ-035: Reposition Site as a Professional/Employer-Facing Portfolio

- **Agent:** Claude
- **Context:** The user redefined the site's purpose from a developer portfolio/technical blog to a professional website for employers, specifying a CS+MBA+leadership positioning and a strict three-page maximum (Home, Projects, About; Resume as a direct link, Contact folded into Home/footer). Recorded in `docs/WEBSITE_VISION.md`.
- **Files Modified:**
  - `frontend/src/features/portfolio/data/profile.ts`
  - `frontend/src/features/portfolio/data/experience.ts` (new)
  - `frontend/src/features/portfolio/data/projects.ts`
  - `frontend/src/routes/publicRoutes.ts`
  - `frontend/src/routes/AppRoutes.tsx`
  - `frontend/src/features/standardUI/components/StandardHome.tsx`
  - `frontend/src/pages/About.tsx`
  - `frontend/src/pages/Projects.tsx`
  - Deleted: `frontend/src/pages/Resume.tsx`, `frontend/src/pages/Contact.tsx`
  - `frontend/src/tests/App.test.tsx`
  - `docs/ISSUES.md`
  - `docs/WEBSITE_VISION.md` (new)
- **Implementation:**
  - **Identity (`CJ-031`):** Rewrote `profile.ts` title/summary/hero-facts/strengths/stack-groups to combine software engineering, business analytics (MBA in progress, UIC), data systems, and leadership (U.S. Marine Corps, Options for Youth), without changing existing field shapes (so the still-present but unrouted `StandardHomeStory.tsx` keeps compiling). Added `experience.ts` with shared `portfolioEducation`, `portfolioCertifications`, and `portfolioWorkExperience` (migrated verbatim from the retired `Resume.tsx`), plus a `featuredPortfolioWorkExperience` filter for Home.
  - **Projects (`CJ-032`):** Added an `options-for-youth` project to `projects.ts` built only from the existing verified `workExperience` story text (program data/attendance-tracking systems, Google Forms/Sheets/Apps Script) — no invented metrics. Marked it and `compilingjava-web-platform` as `featured`; demoted `tic-tac-toe-revisited` and `jit-cafe` to non-featured. Kept `year` as a plain parseable year string since `localContent.ts` derives `PROJECT` content items from `portfolioProjects` and parses `year` into an ISO date.
  - **Navigation (`CJ-033`):** Removed `/blog`, `/resume`, `/contact` from `publicRoutes.ts` and `portfolioNavItems` (nav is now exactly Home/Projects/About). Added compatibility redirects in `AppRoutes.tsx` (`/blog/*` → `/`, `/resume` → `/`, `/contact` → `/#contact`). Deleted `Resume.tsx` and `Contact.tsx` after migrating their unique content (certifications, work history, contact resource links) into `experience.ts`/`About.tsx`/`StandardHome.tsx`. `StandardHeader.tsx` already rendered Resume as an external PDF link outside the nav array, matching the vision's `Resume ↗` requirement with no change needed.
  - **Home (`CJ-034`):** Rebuilt `StandardHome.tsx` so the page alone covers identity, a competencies grid (`stackGroups`), selected experience (`featuredPortfolioWorkExperience`), featured projects (`featuredPortfolioProjects`), education, a resume download, and a `#contact` section with the resource links previously on the standalone Contact page.
  - **About (`CJ-035`):** Replaced the local-blog-listing `About.tsx` with education, certifications, full career-progression work history, and a professional-interests/career-objective section, using only user-supplied and previously-verified repository facts.
  - Updated `App.test.tsx`: nav/route alignment assertions now expect exactly `["/", "/projects", "/about"]` and explicitly exclude `/blog`, `/resume`, `/contact`; local `PROJECT` content count updated from 4 to 5.
  - Marked `CJ-020` (which had added Blog to the nav) `SUPERSEDED` by this work, with rationale.
  - Added `CJ-036` (`TODO (Needs decision)`: fate of now-unrendered local blog content in `localContent.ts`) and `CJ-037` (`TODO`: full visual redesign, deferred) to `docs/ISSUES.md` for follow-up.
- **Tests Performed & Results:**
  - `npm run typecheck`: passed (exit code 0).
  - `npm test -- --run`: passed (2 test files, 15 tests).
  - `npm run build`: passed; production bundle no longer emits `Resume`/`Contact`/`Blog` chunks.
- **Remaining Issues / Follow-up:**
  - `CJ-036` (blog/writing content fate) and `CJ-037` (visual redesign) are open and need user input/scheduling.
  - `ProjectDetail.tsx`'s "Screenshots / Product views" section renders an empty grid for projects with no `previews` (e.g., Options for Youth); acceptable for this content pass, but worth a small empty-state treatment during `CJ-037`.
  - Options for Youth project framing should be reviewed by the user for accuracy/completeness beyond the existing verified `workExperience` narrative.

---

## 2026-10-27 — CJ-037: Visual Redesign (Tech-Aesthetic Pass)

- **Agent:** Claude
- **Context:** User asked for the visual redesign to read as "MBA + CS major, with AI workflow." Clarified via `AskUserQuestion` that this meant a subtle visual tech aesthetic (data/graph motifs, monospace+sans pairing, technical color accents) — not a new AI-skills content section and not a "built with AI" narrative.
- **Files Modified:**
  - `frontend/src/styles/index.css`
  - `frontend/src/features/standardUI/components/StandardHeader.tsx`
  - `frontend/src/features/standardUI/components/StandardHome.tsx`
  - `docs/ISSUES.md`
- **Implementation:**
  - Added `.header-role-line` / `.home-role-line` (IBM Plex Mono identity/role readout lines), `.home-stat-value` (mono hero-fact values), `.home-signal-divider` (a minimal fading accent bar under the hero CTA, replacing a first draft that reused the unrelated `--brand-stripes` gradient and read as a stray two-tone fragment), and `.home-competency-tile` / `.home-competency-dot` (color-coded accent bar + dot per competency domain) to `styles/index.css`.
  - `StandardHeader.tsx`: site title/role line now renders in mono.
  - `StandardHome.tsx`: hero now shows a mono role line under the name; hero-fact values render in mono; the five `stackGroups` competency tiles (Business and analytics, Backend, Frontend, Data, Leadership) each get a distinct accent color cycling through the existing semantic brand tokens (`accent`, `frame`, `success-ink`, `warning-ink`, `danger-ink` at reduced opacity) via a `--tile-accent` CSS custom property, applied through a small `COMPETENCY_ACCENTS` array — no new design tokens added.
  - Explicitly avoided reintroducing any terminal/command-line visual language, since the user previously and separately directed removing Terminal UI entirely (`CJ-022`).
- **Tests Performed & Results:**
  - `npm run validate` (`tsc --noEmit`, `vitest run`, `vite build`): passed (2 test files, 15 tests; clean build).
  - Visual verification: launched the Vite dev server and used headless Google Chrome (`--headless --screenshot`, since neither `chromium-cli` nor Playwright was available in this environment and installing Playwright was treated as an unauthorized dependency addition) to capture `/`, `/projects`, and `/about` at desktop width. Confirmed the redesign renders as intended; caught and fixed the signal-divider rendering issue from visual inspection before finalizing.
- **Remaining Issues / Follow-up:**
  - Only Home/header received bespoke visual treatment; Projects/About inherit shared tokens but no additional bespoke styling.
  - `CJ-036` (fate of unused local blog content) is still open and unrelated to this pass.
  - If the user wants the tech-accent treatment extended to Projects/About/footer/mobile nav, that is follow-up work, not done here.

## 2026-10-27 — CJ-038: Remove Resume page

- **Agent:** Codex
- **Files modified:** `frontend/src/pages/Resume.tsx` (deleted), `frontend/src/routes/publicRoutes.ts`, `frontend/src/routes/AppRoutes.tsx`, `frontend/src/features/portfolio/data/profile.ts`, `frontend/src/tests/App.test.tsx`, `docs/ISSUES.md`, `docs/CODEBASE_ANALYSIS.md`, `docs/MIGRATION_PLAN.md`.
- Removed the standalone page and navigation entry; retained PDF access and redirected `/resume` home.
- **Verification:** `npm run validate` passed: TypeScript, 15 tests, production build; Resume chunk no longer emitted.
- **Follow-up:** None for page removal.

## 2026-10-27 — CJ-039: World Cup Bracket and Rust badge

- **Agent:** Codex
- **Files modified:** `frontend/src/features/portfolio/data/projects.ts`, `frontend/src/features/standardUI/components/StandardFooter.tsx`, `frontend/src/tests/App.test.tsx`, `frontend/public/assets/features/world-cup-bracket/bracket.png`, `docs/ISSUES.md`, `docs/CODEBASE_ANALYSIS.md`.
- Added a catalog/detail entry with repository link and a locally stored screenshot from https://github.com/emunoz8/WorldCupBracket. Descriptions reflect repository documentation; no desktop demo or API integration was added to the website. Added Rust using the existing footer icon/badge system.
- **Verification:** `npm run validate` passed (TypeScript, 15 tests, production build); image confirmed as PNG. Desktop application itself was not built or tested.
- **Follow-up:** None required for this content update.

## 2026-11-11 — CJ-040: Add color to the professional portfolio

- **Agent:** Codex
- **Files modified:** `frontend/src/styles/index.css`; `frontend/src/features/standardUI/components/{StandardHeader,StandardHome,StandardFooter}.tsx`; `frontend/src/features/portfolio/components/ProjectCard.tsx`; `frontend/src/pages/{Projects,About}.tsx`; `AGENTS.md`; `docs/{CODEBASE_ANALYSIS,MIGRATION_PLAN,ISSUES,CHANGELOG}.md`.
- **Implementation:** Introduced a portfolio-scoped teal/blue/amber palette with navy headings and readable blue-gray body copy. Added a mint/blue hero with teal emphasis, tinted competency and experience cards, amber education cards, project cards with colored borders/chips, tinted Projects/About introductions, and colored contact/footer surfaces. Header identity, active navigation, resume control, and links use teal. Added visible focus outlines to portfolio controls. Standalone demo palettes remain separately defined; no dependencies or runtime services were added.
- **Verification:** TypeScript passed; production build passed; emitted CSS contains the 11 updated surface/component selectors, palette tokens, and competency tints. Ten calculated text/background contrast pairs meet 4.5:1 or better (minimum 4.72:1). `git diff --check` passed. The default test run and single-worker retry stalled before reporting results and were stopped; no test-suite pass is claimed.
- **Remaining verification:** Test-suite completion and browser visual/responsive QA. Browser QA could not run because the in-app browser host was unavailable and native Chrome access failed to initialize. CJ-040 remains IN PROGRESS; no screenshot/mobile-browser verification is claimed.

## 2026-11-11 — CJ-041: Publish current frontend to production

- **Agent:** Codex
- **Files modified:** `docs/ISSUES.md`, `docs/CHANGELOG.md`; generated `frontend/build/` and static publishing branch through the existing `gh-pages` workflow.
- **Implementation:** Published the current frontend working tree, including the portfolio color pass, to `gh-pages` with message `Publish frontend-only portfolio and color palette`. Publishing commit: `44b120c2bb391f5594cf908cb15d7478862b62b3`. CNAME remains `compilingjava.com`. Source baseline is `619c9e7` plus the existing working-tree changes; staged and unstaged source work was preserved.
- **Verification:** Production build succeeded; publisher reported `Published`. After propagation, downloaded `https://compilingjava.com/`, `/assets/index-DCvR4_Co.js`, and `/assets/index-D6ArH6ri.css`; all three match the local build byte for byte. Live CSS includes the new portfolio palette and contact styles. GitHub branch content also confirms the updated asset references and CNAME.
- **Remaining issues:** CJ-040 still records incomplete test-suite/browser visual verification. Deployment success does not close those verification items.

## 2026-11-11 — CJ-040 revision: single-accent palette

- **Agent:** Claude Code
- **Files modified:** `frontend/src/styles/index.css`, `frontend/src/features/standardUI/components/StandardHome.tsx`, `docs/CODEBASE_ANALYSIS.md`, `docs/ISSUES.md`, `docs/CHANGELOG.md`.
- **Implementation:** Replaced teal/blue/amber with one deep-teal accent; neutral canvas, white cards, hairline borders; removed rotating card/tile colors.
- **Tests:** `npm run typecheck` passed; `npm run build` passed. Test suite and browser visual QA not run.
- **Follow-up:** Not deployed; CJ-040 stays IN PROGRESS pending visual QA.
