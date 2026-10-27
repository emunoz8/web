# CompilingJava codebase analysis

## Evidence and scope

- Analysis date: 2026-10-26.
- Repository: `https://github.com/emunoz8/web`.
- Inspected checkout: commit `6501155` (`Fix mobile nav shake and remove project highlights section`).
- The checkout already had a modification to `frontend/package-lock.json`. It was not changed by the analysis or documentation work.
- This document describes the existing application, not the intended replacement. See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for future work and [ISSUES.md](ISSUES.md) for actionable findings.
- Findings are based on source/configuration inspection and the no-emit TypeScript check recorded below. The browser UI, live backend, database, production domain, and GitHub Pages settings were not exercised or verified.
- Recommendations and source-derived runtime risks are labeled separately from observed command results. An implemented UI flow is not proof that its remote service currently works.

**Central finding:** this checkout contains only the frontend application, but it is not independent of backend services. Public content, authentication, engagement, administration, terminal commands, and AddToTheAUX still contain runtime API dependencies.

## 1. Repository structure and documentation drift

```text
web/
  AGENTS.md                    Shared instructions for future work
  docs/                        Analysis, migration plan, issue tracker
  README.md                    Existing overview; describes absent directories
  TASKS.md                     Historical work log, including backend separation
  frontend/
    index.html                 HTML entrypoint and SPA path restoration
    package.json               Dependencies and development/deployment commands
    package-lock.json          Dependency lockfile; pre-existing local change
    vite.config.ts             React, dev proxy, build output, Vitest
    tsconfig.json              Strict TypeScript configuration
    tailwind.config.js         Brand tokens, fonts, typography plugin
    postcss.config.js          Tailwind and Autoprefixer
    public/
      CNAME                    compilingjava.com
      404.html                 GitHub Pages SPA redirect
      meta/manifest.json       Web app metadata
      robots.txt               Allows crawling
      assets/                  Icons, profile image, PDF, project screenshots
      content/                 Older Markdown/text content, not wired into pages
    src/
      index.tsx, App.tsx        React bootstrap
      routes/                  Route registry, renderer, access guards
      context/                 Auth, theme, UI mode, application shell
      pages/                   Public pages, feature wrappers, login, API Lab
        admin/                 Project and blog administration
      components/              Shared content, auth, layout, helper components
      features/
        portfolio/             Local profile/projects, cards/previews, commands
        standardUI/            Standard shell and current home implementation
        terminalUI/            Terminal shell/session/dragging/telemetry
        ticTacToe/             Local game and lookup data
        addToTheAux/           Spotify-oriented API hooks and interface
        jitCafe/               Three-page static restaurant demonstration
      lib/                     API types/URLs, env, CSRF, content service
      data/                    Legacy NavItem component
      styles/index.css         Global tokens, components, utility styles
      tests/                   Test setup and placeholder application test
      types/                   Google Identity Services declarations
```

There is no `backend/`, standalone `JIT_cafe/`, or `.github/` directory in the inspected checkout. [TASKS.md](../TASKS.md) records a separate backend repository at `https://github.com/emunoz8/web_backend.git`, and [.gitignore](../.gitignore) ignores `backend/`. That separate repository was not inspected.

[README.md](../README.md) still describes Spring Boot, PostgreSQL, backend deployment scripts, and a separate JIT Cafe project as if they are in this repository. These statements are historical documentation, not evidence of the current local structure.

## 2. Stack, dependencies, and commands

Versions below are declarations in [package.json](../frontend/package.json), not claims about the latest available releases or every installed resolved version.

| Concern | Current implementation |
| --- | --- |
| UI | React `^18.2.0`, React DOM `18.2.0` |
| Language | TypeScript `^5.1.6`; strict mode, JSX transform, JSON imports, bundler resolution |
| Routing | `react-router-dom` `7.6.3` |
| Build | Vite `^7.1.3`, `@vitejs/plugin-react` `^4.7.0` |
| Styles | Tailwind CSS `^3.4.17`, typography plugin, PostCSS, Autoprefixer |
| Markdown | `react-markdown`, `remark-gfm`, `rehype-highlight` |
| Icons | `react-icons` `5.4.0` |
| Tests | Vitest `^3.2.4`, jsdom, Testing Library packages |
| Hosting helper | `gh-pages` `^6.3.0` |
| Other declarations | `web-vitals`, browser compatibility data packages, AJV packages |

There is no declared Axios, Redux, Zustand, or query-cache library. Runtime requests use native Fetch. State primarily uses React hooks and Context.

React type packages are declared at version 19 while the runtime is version 18. This is a compatibility review item; the observed TypeScript failure below has a separate, explicit cause.

Commands run from `frontend/`:

| Command | Actual effect |
| --- | --- |
| `npm run dev` / `npm start` | Starts Vite development server |
| `npm run build` | Runs `vite build`; emits `build/`; does not run TypeScript checking |
| `npm run preview` | Previews a built site locally |
| `npm test` | Runs Vitest once |
| `npm run test:watch` | Runs Vitest in watch mode |
| `./node_modules/.bin/tsc --noEmit --incremental false` | Checks source/test types without emitting files |
| `npm run deploy` | Runs the `predeploy` build, then `gh-pages -d build`; publishes remotely |

The manifest also contains dependency-installation convenience scripts. They are not needed for documentation work and should not be invoked automatically. No lint script is declared.

## 3. Initialization and rendering

The source chain is:

```text
frontend/index.html
  → src/index.tsx
  → React.StrictMode
  → ThemeProvider
  → App
  → context/Theme.tsx (application shell)
  → BrowserRouter
  → SiteUiModeProvider
  → AppShellContent
  → AuthProvider
  → Layout
  → StandardUI / TerminalUI / shell-free main
  → AppRoutes
  → matched page
```

- [index.tsx](../frontend/src/index.tsx) calls `ReactDOM.createRoot` on `#root`. Global CSS is imported here and also in `App.tsx`.
- [Theme.tsx](../frontend/src/context/Theme.tsx) owns the router and application framing despite its name. There is no server render or static page generation configured.
- [ThemeProvider.tsx](../frontend/src/context/ThemeProvider.tsx) always selects light mode and removes the root `dark` class. Existing dark CSS does not imply a user-selectable dark theme.
- [Layout.tsx](../frontend/src/components/layout/Layout.tsx) selects the shell based on pathname and site UI mode.
- [authRouting.ts](../frontend/src/lib/authRouting.ts) centralizes login background-route state and shell exceptions.
- [RouteScrollReset.tsx](../frontend/src/components/layout/RouteScrollReset.tsx) resets window and terminal content scroll on pathname/query changes, using the background route while login is overlaid.

`AuthProvider` surrounds all route content. It runs `refreshSession()` on mount, including on Contact, Resume, Tic Tac Toe, JIT Cafe, and locally modeled project pages. A page with local data is therefore not yet free of application-level API traffic.

## 4. UI modes, state, and navigation

### Standard and terminal modes

[SiteUiModeContext.tsx](../frontend/src/context/SiteUiModeContext.tsx) stores the preferred mode under `localStorage['site-ui-mode']`. The default is `standard`. A `ui=standard` or `ui=terminal` query parameter can change the preference. At widths below 768px the effective mode becomes standard, and the toggle is hidden.

- `StandardUI` wraps pages in `StandardHeader`, a constrained `main`, and `StandardFooter`.
- `TerminalUI` wraps the same routed page content in a draggable/fullscreen window alongside logs and a prompt.
- `useTerminalSession` implements command history, keyboard shortcuts, navigation, auth actions, and API commands. History is in memory, capped at 40 commands and 120 displayed log entries.
- `useDraggableTerminalWindow` handles pointer dragging, centering, viewport clamping, and resize adjustment. Position is component state, not a saved layout.
- `publishTerminalTelemetry` / `subscribeTerminalTelemetry` communicate through browser events. This is local UI telemetry, not an external analytics integration.

`/tic-tac-toe`, `/add-to-the-aux`, and the `/jit-cafe` subtree bypass the portfolio shell. AUX additionally uses viewport-locking styles.

### Navigation ownership

Navigation has multiple sources of truth:

1. [publicRoutes.ts](../frontend/src/routes/publicRoutes.ts): routable pages, labels, `showInNav`, and `requiresAdmin` flags.
2. [profile.ts](../frontend/src/features/portfolio/data/profile.ts): actual standard header links: Home, About, Resume, Contact.
3. [terminalShell.ts](../frontend/src/features/portfolio/data/terminalShell.ts): virtual directories, page/project commands, feature launches, and external links.
4. [JIT Cafe Navbar](../frontend/src/features/jitCafe/components/navigation/Navbar.tsx): restaurant Home, Food Menu, Contact us.

The standard header does not derive its navigation from `publicRoutes`. Changing `showInNav` alone will not update it. The terminal's projects shortcut maps to `/`, where current project cards are rendered.

### Authentication state and route behavior

- [AuthContext.tsx](../frontend/src/context/AuthContext.tsx) stores an in-memory session with username, email, roles, and username-change capability. It exposes loading/authenticated/admin states and login/logout/refresh functions.
- `isAdmin` is derived from `ROLE_ADMIN`. Authentication uses server cookies; API Lab additionally accepts an optional bearer token for manual testing.
- [RequireAdmin.tsx](../frontend/src/routes/RequireAdmin.tsx) returns nothing while session loading is pending, redirects guests to login with a return location, and redirects non-admin users home.
- `PrivateRoute.tsx` exists but is not used by the active route registry.
- Login can be a normal route or an overlay. `AppRoutes` keeps the background route rendered and separately renders `/login` when `backgroundLocation` is supplied.

These browser guards are UI behavior, not a substitute for server authorization. In the intended static site, private server operations will be retired rather than simulated as secure client-only administration.

## 5. Complete page and route inventory

`AppRoutes` applies a Suspense fallback to route elements and wraps routes marked `requiresAdmin` in the admin guard. Home, Login, and ProjectDetail are eagerly imported. Other top-level page modules are lazy-loaded.

In this table, **local** means page-specific content/logic is local; the global session request still applies. **API-dependent** means an implementation exists but needs a service whose runtime availability was not verified.

| Route / source | Purpose and component flow | Data/state and current completeness | Entry and exit paths |
| --- | --- | --- | --- |
| `/` — [Home](../frontend/src/pages/Home.tsx), [StandardHome](../frontend/src/features/standardUI/components/StandardHome.tsx) | Profile hero and project catalog; local `ProjectCard` plus API project cards | Local profile/four projects; API list requests page 0, size 100, type PROJECT. API entries with local slugs are excluded. Static cards remain on API failure; an error is shown. | Standard/terminal home links; links to About, Contact, project details |
| `/about` — [About](../frontend/src/pages/About.tsx) | Biography and latest writing | Local biography; latest three BLOG entries fetched; clicking a post retrieves full content by ID and opens `ContentModal`, which also loads engagement | Standard/terminal navigation; blog buttons open modal; shell provides onward navigation |
| `/resume` — [Resume](../frontend/src/pages/Resume.tsx) | Summary, education, work history, certifications, resources | Local arrays/profile data and PDF; no page-specific API | Standard/terminal links; PDF, Contact, external credentials/profile links |
| `/contact` — [Contact](../frontend/src/pages/Contact.tsx) | Contact/resource links | Local profile resources; mailto and external/PDF links, no form submission | Standard/terminal navigation and home CTA |
| `/projects/:id` — [ProjectDetail](../frontend/src/pages/ProjectDetail.tsx) | Case study, screenshots, feature list, demo/source links | `id` is actually used as a slug. Local project lookup first; otherwise API lookup by slug, type check for PROJECT, Markdown description, optional iframe. Unknown/error state uses `NotFoundState`. | Home project cards/terminal commands; Back to home and live-demo links |
| `/blog` — [Blog](../frontend/src/pages/Blog.tsx) | `ContentBrowserPage` archive with categories, feed, details | API-dependent; page size 20, infinite loading plus Load More button, engagement hydration. Full posts open in modal, not dedicated post routes. | Direct URL/terminal command/admin user-view link; modal close and shell navigation |
| `/login` — [Login](../frontend/src/pages/Login.tsx) | Password/Google sign-in as page or modal | API-dependent; Google configuration has env fallback; external GSI script; returns to stored destination or home | Terminal, protected routes, likes/comments, AUX; modal close uses history back |
| `/admin/projects` — [AdminProjects](../frontend/src/pages/admin/AdminProjects.tsx) | Content browser plus create/edit/delete project workflow | API-dependent/admin-protected; title, slug, Markdown description, project URL, optional existing/new category at creation | Terminal admin command/direct URL; Open User View returns home |
| `/admin/blog` — [AdminBlog](../frontend/src/pages/admin/AdminBlog.tsx) | Content browser plus blog publishing/editing/deletion | API-dependent/admin-protected; title, slug, Markdown body, optional category at creation | Blog's admin link/direct URL; Open User View goes to Blog |
| `/api-lab` — [ApiLab](../frontend/src/pages/ApiLab.tsx) | Manual request console and request/response history | API-dependent/admin-protected; auth, content, categories, comments, users, likes, actuator. Last 30 request records held in state. | Direct URL; normal shell navigation |
| `/add-to-the-aux` — [AddToTheAux](../frontend/src/pages/AddToTheAux.tsx) | Orbital playlist, mobile list, search, current playback, add-track flow | API-dependent. Ten visible desktop playlist slots; authenticated search/add; five-minute guest preview in sessionStorage; no local music fixture fallback | Case study/terminal/direct URL; login overlay and external Spotify playlist link; no standard portfolio header |
| `/tic-tac-toe` — [TicTacToeFeature](../frontend/src/features/ticTacToe/TicTacToeFeature.tsx) | Game against lookup AI, hint tree, symmetry previews | Local JSON and TS; player/AI starts, delayed AI turn, retry, best-move lookup and equivalent states implemented. Gameplay not browser-tested in this audit. | Case study/terminal/direct URL; no standard portfolio header or dedicated home link |
| `/jit-cafe` — [HomePage](../frontend/src/features/jitCafe/pages/HomePage.tsx) | Restaurant introduction and historical product screenshots | Local content and images. Ordering/staff flows shown here are screenshots, not implemented pages | Case study/terminal/direct URL; restaurant navbar and menu/contact CTAs |
| `/jit-cafe/menu` — [MenuPage](../frontend/src/features/jitCafe/pages/MenuPage.tsx) | Featured/category menu groups, prices, images, horizontal browsing | Local TS snapshot, alphabetical item sorting within sections, carousel controls, mobile automatic section snapping. No live ordering/cart API. | Restaurant navbar/home CTA; restaurant navigation |
| `/jit-cafe/contact-us` — [ContactUsPage](../frontend/src/features/jitCafe/pages/ContactUsPage.tsx) | Restaurant contact details and hours | Hardcoded prototype phone/email/hours; no request/form | Restaurant navbar/home CTA; tel/mailto links |
| Unregistered — [Projects](../frontend/src/pages/Projects.tsx) | Separate managed project catalog | Source exists and requests API projects, but has no active route/import. It is not the current home catalog. | No active route entry |

[JitCafeFeature.tsx](../frontend/src/features/jitCafe/JitCafeFeature.tsx) defines its own nested Routes under `/jit-cafe/*`, using `JitCafeLayout` and Outlet. Unknown JIT Cafe subpaths redirect to `/jit-cafe`. There is no equivalent top-level wildcard route.

### Local case studies

[portfolio/data/projects.ts](../frontend/src/features/portfolio/data/projects.ts) defines:

| Slug | Live demonstration | Preview content |
| --- | --- | --- |
| `compilingjava-web-platform` | `/` | Route iframe currently targets unregistered `/projects` |
| `atta` | `/add-to-the-aux` | Local screenshots |
| `tic-tac-toe-revisited` | `/tic-tac-toe` | Local screenshots and algorithm diagram |
| `jit-cafe` | `/jit-cafe` | Local screenshots, including historical ordering/staff flows |

`portfolioProjectsBySlug` provides the local lookup. `PortfolioProjectDetail` renders structured local fields; `ManagedProjectDetail` renders the smaller API model. Static entries win on matching slugs and are filtered from the supplementary API list. Backend updates to a matching slug therefore do not replace the local case study.

## 6. Components, hooks, and reusable patterns

| Family | Main components/hooks | Relationships and reuse |
| --- | --- | --- |
| Layout | `Layout`, `RouteScrollReset`, `StandardUI`, `TerminalUI` | Route content is shared between two portfolio shells; feature routes bypass them |
| Portfolio | `ProjectCard`, `ProjectPreviewFrame`, profile/project data | Typed data drives cards/details; preview supports iframe or clickable image viewer |
| Content browsing | `ContentBrowserPage`, `ContentBrowserHeader`, `ContentCategoryFilter`, `ContentFeed`, `ContentCard`, `RetroBootLoader` | Browser hook supplies category/feed/modal states; loader appears after 300ms initial delay |
| Browser state | `useContentBrowserData`, `ContentCategorySelectionModel`, `ContentFeedCollectionModel`, `ContentModalItemModel` | Pagination, deduplication, category labels, missing-engagement detection, selected item |
| Content detail | `ContentModal`, `MarkdownRenderer` | Modal combines content, project links/embed, likes, threaded comments/replies/deletion and login navigation |
| Admin | `AdminContentPageScaffold`, `AdminPageHeader`, project/blog create/edit forms | Reuses filters/feed/modal; page view-model maps shared props; form view-models map editor states |
| Admin logic | `useAdminProjectEditor`, `useAdminBlogEditor`, draft/category models | Validation, payload normalization, sequential create/category/attach, refresh after mutations |
| Authentication | `LoginFrame`, `LoginContent`, `PasswordLoginForm`, `GoogleSignInSection` | Page coordinates server session and third-party sign-in lifecycle |
| Terminal | `TerminalHeader`, `TerminalLog`, `TerminalPrompt`, session and dragging hooks | Local shell routing plus auth/API side effects; global shortcuts and bounded log history |
| Tic Tac Toe | `BoardView`, tree header/controls/body/links, `StateGroupCard`, `StateCyclePreview`, `HintMessage` | Game history belongs to feature; pure board/symmetry helpers and `LookupStrategyService` determine moves |
| AUX | `OrbitalPlaylistStage`, orbit/suggestion cards, `OrbitSearchPanel`, `MobilePlaylistPanel`, `CurrentlyPlayingWidget` | Page coordinates remote hooks; stage handles animation, wheel input, errors, guest overlay |
| JIT Cafe | Navbar/Footer, `Button`, `EmptyState`, `MenuItemImage` | Feature layout and local menu; image component tries configured source, named SVG fallback, then decorative fallback |

The Markdown renderer supports GFM and syntax highlighting. It forces links to open in a new tab. The current renderer receives content strings; it does not itself fetch Markdown files.

Admin category creation/attachment occurs after content creation in separate requests. Edit forms update core content fields; they do not expose full category management. API Lab has additional attach/detach controls. These are implementation boundaries, not proof of successful live workflows.

### Apparently inactive source

Import/reference inspection found no active consumers for:

- `pages/Projects.tsx`.
- `components/layout/Navbar.tsx`, `Footer.tsx`, `Sidebar.tsx`, `TerminalShell.tsx` (the last is a re-export).
- `routes/PrivateRoute.tsx`, `data/NavItem.tsx`.
- `components/helpers/Paragrapher.tsx`, common GitHub/LinkedIn link components.
- `components/content/admin/AdminAccessNotice.tsx`.
- `features/portfolio/components/ProjectsStorySection.tsx`, `features/standardUI/components/StandardHomeStory.tsx`.
- `reportWebVitals.ts`.

These are cleanup candidates, not authorization to delete them. Recheck references before later removal. Likewise, files in `public/content/` are not wired into the current pages, but can still be served as public files.

## 7. Local data and assets

- [profile.ts](../frontend/src/features/portfolio/data/profile.ts): profile copy, standard navigation, technology groups, resources, PDF URL.
- [projects.ts](../frontend/src/features/portfolio/data/projects.ts): structured case studies with descriptions, feature lists, tech stack, previews, demo/repository links.
- [staticMenuSnapshot.ts](../frontend/src/features/jitCafe/data/staticMenuSnapshot.ts): restaurant section/item data and image mapping. Its comment names `/api/restaurant/v1/menu` as an original source; no runtime request to that endpoint exists in this feature.
- [gameConstants.ts](../frontend/src/features/ticTacToe/constants/gameConstants.ts): imports bundled lookup JSON, validates metadata, and exposes lookup/win/symmetry constants. `configureGameConstants()` creates the strategy input.
- `features/ticTacToe/logic/`: canonicalizes boards, maps symmetric moves, detects wins/turns, and evaluates lookup outcomes. No Java process or backend is required to play the browser game.
- `public/assets/documents/Edwin_Munoz_CV2026.pdf`: resume asset used across pages.
- `public/content/markdown/home.md`, project Markdown files, and `public/content/text/aboutMe.txt`: older, currently unwired content. They are not known to be a complete export of API content.

The inspected public directory was approximately 22 MB. Literal `/assets/...` source references checked during the analysis resolved to existing paths. That check does not prove dynamic/generated asset references or deployed URLs work. Menu image fallback code constructs named `.svg` paths, while the inspected JIT Cafe asset directory contains the configured WebP photos and PNG screenshots/logos rather than those fallback SVGs.

## 8. Complete application API dependency map

### Request infrastructure and environment

[lib/api.ts](../frontend/src/lib/api.ts) normalizes the API base and builds URLs. It also defines `CategoryDomain`, `CategoryItem`, `ContentItem`, and `PagedResponse`. `ContentItem` has numeric ID, slug, title, timestamp, PROJECT/BLOG type, optional description/Markdown/project URL, and optional engagement.

[lib/csrf.ts](../frontend/src/lib/csrf.ts) implements `fetchWithCsrf()`. Unsafe methods call `ensureCsrfToken()`, which checks `XSRF-TOKEN` and otherwise requests `/api/auth/csrf`; the token is sent as `X-XSRF-TOKEN`. Requests include credentials. Concurrent initialization shares a pending token request.

[ContentPlatformService.ts](../frontend/src/lib/services/ContentPlatformService.ts) uses an internal `ApiClient` for JSON, errors, credentials, and mutations. It assumes a backend supporting content, categories, comments, and likes. Database implementation/schema cannot be verified from this frontend repository.

[env.ts](../frontend/src/lib/env.ts) reads:

| Variable | Behavior |
| --- | --- |
| `VITE_API_BASE_URL` | Main API base; empty means same-origin paths |
| `VITE_GOOGLE_CLIENT_ID` | Google sign-in fallback client identifier |
| `VITE_AUX_API_BASE_URL` | AUX base; falls back to main API base |
| `VITE_AUX_API_PREFIX` | AUX path prefix; default in feature API helper is `/api/testing` |

No local `.env` files were present during inspection. Vite's `envPrefix` still includes `REACT_APP_`, and `vite-env.d.ts` still declares legacy variables, although `env.ts` no longer reads them. Environment values exposed to Vite's frontend are not a location for server secrets.

### Authentication

| Method and endpoint | Caller/function | Trigger |
| --- | --- | --- |
| `GET /api/auth/session` | `AuthContext.refreshSession()` | App mount and successful login/username change |
| `POST /api/auth/login` | `AuthContext.login()` | Password form |
| `GET /api/auth/google/config` | `Login.loadGoogleConfig()` | Login component mount; env fallback on failure |
| `POST /api/auth/google` | `AuthContext.loginWithGoogle()` | GSI credential callback |
| `PATCH /api/users/me/username` | `AuthContext.updateUsername()` | Exposed context operation; no identified UI consumer |
| `POST /api/auth/logout` | `AuthContext.logout()` | Terminal logout; also referenced by inactive legacy navigation |
| `GET /api/auth/csrf` | `requestTokenFromServer()` | Unsafe requests without an existing token |

Login loads `https://accounts.google.com/gsi/client` and sends the returned ID token to the application backend. This is not a self-contained static authentication system.

### Content and categories

All operations below are implemented in `ContentPlatformService` unless otherwise stated.

| Method and endpoint | Function | Consumers |
| --- | --- | --- |
| `GET /api/contents?type=…&category=…&q=…&page=…&size=…` | `listContentsPage()`, `listContents()` | StandardHome, About, content-browser hook, terminal; inactive Projects page |
| `GET /api/contents/id/{id}` | `getContentById()` | About, browser modal opener, admin edit initialization |
| `GET /api/contents/slug/{slug}` | `getContentBySlug()` | ProjectDetail API fallback, terminal |
| `GET /api/categories?domain=PROJECT|BLOG` | `listCategories()` | Browser hook and terminal |
| `POST /api/admin/projects` | `createProject()` | Project editor hook |
| `PUT /api/admin/projects/{id}` | `updateProject()` | Project editor hook |
| `POST /api/admin/blogs` | `createBlog()` | Blog editor hook |
| `PUT /api/admin/blogs/{id}` | `updateBlog()` | Blog editor hook |
| `DELETE /api/admin/contents/{id}` | `deleteContent()` | Both editor hooks |
| `POST /api/admin/categories` | `createCategory()` | Both create workflows |
| `POST /api/admin/contents/{contentId}/categories/{categoryId}` | `attachCategory()` | Both create workflows |

Relevant orchestration sources: [useContentBrowserData](../frontend/src/components/content/hooks/useContentBrowserData.ts), [useAdminProjectEditor](../frontend/src/components/content/admin/hooks/useAdminProjectEditor.ts), [useAdminBlogEditor](../frontend/src/components/content/admin/hooks/useAdminBlogEditor.ts).

### Engagement

| Method and endpoint | Function | Consumers |
| --- | --- | --- |
| `GET /api/comments?contentId={id}` | `listComments()` | Feed engagement count fallback |
| `GET /api/comments/tree?contentId={id}` | `listCommentTree()` | ContentModal thread display |
| `POST /api/comments` | `createComment()` | New comments/replies; body includes content ID, text, parent ID |
| `DELETE /api/comments/{id}` | `deleteComment()` | Modal delete controls |
| `GET /api/contents/{id}/likes/count` | `getLikeCount()` | Feed fallback and modal |
| `GET /api/contents/{id}/likes/me` | `isLikedByMe()` | Authenticated feed fallback and modal |
| `POST /api/contents/{id}/likes` | `like()` | Modal |
| `DELETE /api/contents/{id}/likes` | `unlike()` | Modal |

`getEngagementSummary()` combines likes, flat-comment count, and optional personal like status. If a content-list response omits engagement, the browser hook requests this for each missing item: two requests per guest item or three per authenticated item. Failures in this fallback can be displayed as zero engagement. Full content retrieval and engagement are separate operations.

[ContentModal.tsx](../frontend/src/components/common/ContentModal.tsx) uses `loadLikes()`, `loadComments()`, `toggleLike()`, `postComment()`, and `deleteComment()`. Guests are routed to login for mutation attempts. Delete controls are shown for admins or matching comment usernames; actual authorization belongs to the absent backend.

### Terminal dependencies

[terminalShell.ts](../frontend/src/features/portfolio/data/terminalShell.ts) mixes static command definitions and network execution:

- `fetchSessionLines()` directly requests `GET /api/auth/session`.
- `resolveTerminalApiCommand()` handles `api status`, `api projects`, `api blogs`, category commands, and `api content <slug>` with `fetch` aliases.
- Content/category commands use the same content service endpoints listed above.
- [useTerminalSession](../frontend/src/features/terminalUI/hooks/useTerminalSession.ts) handles login/admin navigation and calls context logout.

Removing page API consumers alone would leave these calls reachable.

### AddToTheAUX dependencies

[features/addToTheAux/lib/api.ts](../frontend/src/features/addToTheAux/lib/api.ts) implements `buildApiUrl()` and `fetchJson()`. It uses the shared CSRF helper, despite allowing a separate AUX base. If separate service origins remain during transition, CSRF initialization still targets the main API configuration; interoperability was not verified.

Default paths below use `/api/testing`; the prefix is configurable.

| Method and endpoint | Hook | Behavior |
| --- | --- | --- |
| `GET /api/testing/playlist` | `usePlaylist` | Initial load and reload after addition; sorts by added time |
| `GET /api/testing/currently-playing` | `useCurrentlyPlaying` | Roughly 15-second polling; skips hidden-document requests; enabled for authenticated or unexpired guest use |
| `GET /api/testing/track-search?q=…&limit=…` | `useTrackSearch` | Authenticated only; minimum two characters, 250ms debounce, current page limit eight |
| `POST /api/testing/playlist/items` | `useAddTrack` | JSON `{ uri }`; authenticated only; handles 401/403 and duplicate 409 responses |

`useGuestPreview` saves a start time under `sessionStorage['add-to-the-aux-guest-preview-started-at']`; the preview lasts five minutes. Expiry overlays login and disables continued polling. Search/addition already require login. No local playlist/search/current-track dataset exists. Spotify image/link values come from responses; an external Spotify playlist link is constructed from playlist ID. No direct browser Spotify API integration was found.

### API Lab additional surface

[ApiLab.tsx](../frontend/src/pages/ApiLab.tsx) calls `fetchWithCsrf()` through `runApiCall()`, loads category options, and repeats the content/category/comment/like/admin operations above. It also exposes:

| Method and endpoint | Purpose |
| --- | --- |
| `GET /actuator/health`, `GET /actuator/info` | Backend diagnostics |
| `GET /api/auth/login` | Authentication hint endpoint |
| `GET /api/auth/session`, `POST /api/auth/login`, `POST /api/auth/logout` | Manual session operations |
| `POST /api/auth/register` | Registration |
| `GET /api/auth/verify?token=…`, `GET /api/auth/confirm-email?token=…` | Opens backend verification redirects in a new tab |
| `POST /api/auth/verify/resend` | Resend verification |
| `POST /api/auth/password/reset-link` | Request reset link |
| `GET /api/auth/password/validate?token=…` | Validate reset token |
| `POST /api/auth/password/reset` | Set new password |
| `POST /api/users`, `GET /api/users/{id}` | Manual user creation/retrieval |
| `DELETE /api/admin/contents/{contentId}/categories/{categoryId}` | Category detachment |

The console's optional bearer token is added to requests marked `requiresAuth`; cookie credentials remain included. These controls are not ordinary public registration/password-reset pages.

### External resources that are not application APIs

Google Fonts is referenced from both the main HTML and global CSS; JIT Cafe imports its own font stylesheet. The site also links to GitHub, LinkedIn, credentials, email/phone destinations, and Spotify. External fonts/links differ from runtime application REST dependencies. A fully offline requirement has not been requested.

## 9. Frontend implementation assessment

### Existing strengths

- Most features have dedicated components/hooks/data directories.
- Public content service logic is centralized enough to identify its callers.
- Structured local project/profile data is already available.
- Tic Tac Toe demonstrates a complete browser-local logic/data pattern.
- JIT Cafe already uses a local menu snapshot and local imagery.
- Content model helpers separate several pure transformations from rendering.
- Major feature routes use lazy loading; many images use lazy loading.
- Many asynchronous flows expose loading, error, and empty states; several reads use AbortController.

### Architectural obstacles to a redesign

- Local `PortfolioProject` and API `ContentItem` are separate presentation models. Catalog cards, details, and URL/excerpt helpers are duplicated.
- Global authentication affects pages that otherwise need only local data.
- `ContentModal` combines content display, project previews, auth routing, and every engagement workflow in one component.
- `terminalShell.ts` lives under `data/` but contains networking and executable command parsing.
- Route, header, terminal, and feature navigation are maintained independently.
- Multiple generations of layout/story components remain in source.
- Static metadata and presentation copy repeatedly describe a live full-stack publishing platform. Professional skills and historical project stack descriptions should not be mistaken for runtime dependencies and removed indiscriminately.

Snapshot size indicators: global CSS 2,221 lines; AUX CSS 1,502; JIT Cafe CSS 4,170; Tic Tac Toe CSS 970. API Lab is 1,332 lines, ContentModal 516, and ProjectDetail 481. These counts describe the inspected revision, not permanent targets.

### Styling and responsive behavior

[tailwind.config.js](../frontend/tailwind.config.js) maps brand colors to CSS custom properties, uses class-based dark variants, defines Inter/IBM Plex Mono font families, and enables typography styles. Global CSS mixes Tailwind layers, custom component classes, brand tokens, terminal layout, portfolio UI, and login styles.

JIT Cafe scopes its variable definitions to `.jit-cafe-feature`, but many component and `brand-*` utility selectors are global. Its stylesheet also contains ordering/checkout/tracking/staff styles without corresponding active pages. Lazy feature CSS can therefore introduce overlapping rules; cross-route visual effects require browser verification. The screenshot viewer uses `bg-brand-overlay/72`, but `overlay` is not defined in Tailwind's brand color extension even though `--brand-overlay` exists in CSS.

Responsive implementations include wrapped mobile portfolio navigation, terminal suppression below 768px, separate AUX desktop/mobile arrangements, compact game-tree rendering, and JIT Cafe carousels/mobile section snapping. Fixed/viewport-relative modal and feed heights, nested terminal scrolling, and AUX viewport locking warrant testing rather than assumptions about usability.

### Accessibility observations

- `ContentCard` handles clicks on a `<li>` without native keyboard activation or equivalent keyboard handling.
- ContentModal and modal LoginFrame have dialog roles but no accessible name, focus trap, initial focus, or focus restoration. The image viewer has a label but lacks focus management too.
- Tic Tac Toe `BoardView` labels cells only by index, not marker/state. `StateCyclePreview` range controls lack explicit accessible labels.
- JIT Cafe Home nests a `Button` inside a `Link` in its menu CTA.
- Positive patterns include native controls in many other areas, descriptive image alternatives, labeled carousel controls, AUX polite status announcements, and reduced-motion CSS.

Keyboard navigation, screen-reader output, color contrast, touch behavior, and focus visibility have not been validated in a browser. JavaScript smooth scrolling also warrants reduced-motion review.

## 10. GitHub Pages and deployment

Sources: [vite.config.ts](../frontend/vite.config.ts), [package.json](../frontend/package.json), [index.html](../frontend/index.html), [404.html](../frontend/public/404.html), [CNAME](../frontend/public/CNAME), [manifest](../frontend/public/meta/manifest.json).

| Setting | Verified configuration | Implication |
| --- | --- | --- |
| Output directory | Vite `build.outDir = 'build'` | Matches `gh-pages -d build` |
| Deployment automation | CLI scripts; no checked-in Actions workflow | Repository-side Pages settings and actual publishing process remain unknown |
| Custom domain | CNAME `compilingjava.com`; homepage/metadata use this domain | Root hosting is the apparent intended configuration; DNS/HTTPS are unverified |
| Asset base | No explicit Vite `base`; many `/assets/...` paths | Assumes domain-root hosting |
| Router base | BrowserRouter without basename | Also assumes root hosting |
| Dev proxy | `/api` forwarded to `http://localhost:8080` | Development convenience only; not available from Pages |
| Diagnostics proxy | No `/actuator` proxy | API Lab diagnostic paths do not reach localhost:8080 through this proxy by default |
| SPA fallback | 404 redirect to `/?spa-path=…`, restored by HTML script | Requires direct-navigation/query/hash/encoding tests |
| Manifest | Root `start_url`; public icons | Must change with any repository-subpath strategy |
| Search metadata | One static title/canonical URL and full-stack descriptions | No route-specific metadata or sitemap is configured |

`homepage` in package.json is metadata; it does not set Vite's base. Deploying unchanged under `https://emunoz8.github.io/web/` would conflict with root-relative routing/assets and the root 404 redirect. If the custom domain remains at the root, those root-relative paths can be appropriate.

The fallback script reads `spa-path` with `URLSearchParams` and then calls `decodeURIComponent()` again. Since parameter parsing already decodes the outer encoding, escaped percent characters in the original URL can be changed or cause a decoding exception. This is a source-derived defect risk; it was not exercised on GitHub Pages.

GitHub Pages cannot serve the current Spring endpoints or database operations. Without an API base, production requests target the static site's own `/api/...` paths. With a configured remote base, the frontend still depends on that service. Neither state meets the intended backend-free requirement.

## 11. Verification results and limits

The following read-only command ran from `frontend/` during analysis:

```sh
./node_modules/.bin/tsc --noEmit --incremental false
```

It exited with code 2:

```text
src/components/content/admin/models/AdminEditorFormViewModels.test.ts(36,5):
error TS2739: ... is missing the following properties from type
'BlogEditEditorState': deleteLoading, delete
```

The failing fixture is in [AdminEditorFormViewModels.test.ts](../frontend/src/components/content/admin/models/AdminEditorFormViewModels.test.ts). No fix was applied. `vite build` does not include this check, so build success alone would not establish type correctness.

Existing tests cover content selection/collection/modal models, admin draft/category models, and admin view-model mappings. [App.test.tsx](../frontend/src/tests/App.test.tsx) is only `expect(true).toBe(true)`; it does not render the application. No application routing, game, auth, or feature integration tests were found in the inspected source.

No dependency installation, build, test-suite execution, application mutation, backend request, commit, branch creation, or deployment occurred during the analysis. Unverified items include backend endpoint compatibility, published content completeness, DNS/Pages settings, production environment values, visual behavior, bundle output, performance, and external link availability.

## 12. Handoff priorities

1. Preserve any API-only content that should survive the migration before retiring its source.
2. Consolidate local content and remove public page API dependencies.
3. Resolve AUX and shared-engagement scope; retire runtime auth/admin/API tooling accordingly.
4. Remove remaining terminal/API/env/proxy dependencies and establish static-host routing.
5. Redesign shared presentation and pages with explicit navigation/accessibility contracts.
6. Validate the final site as a static build with no application API requirements.

These are future recommendations. The analysis and documentation do not authorize implementation. Continue with [MIGRATION_PLAN.md](MIGRATION_PLAN.md), [ISSUES.md](ISSUES.md), and [AGENTS.md](../AGENTS.md), and follow the user's next task.
