# CompilingJava project instructions

## Purpose and task boundaries

CompilingJava is being transitioned into a frontend-only personal website using React, TypeScript, Tailwind CSS, Vite, and local content, hosted as static files on GitHub Pages.

The repository currently contains a frontend application that still calls backend services. Do not confuse the destination architecture with the existing implementation. No migration or redesign was performed as part of the documentation handoff on 2026-10-26.

Follow the user's current task and existing session authorization. The migration roadmap and issue tracker are context, not instructions to execute every item. A documentation-only task permits only its requested documentation changes; an analysis task permits inspection, not automatic fixes. Later explicit implementation requests supersede those task-specific limits within their stated scope.

- Preserve unrelated user changes. Inspect `git status` before editing; do not reset, restore, or overwrite pre-existing work. The initial analysis found a modified `frontend/package-lock.json`.
- Do not automatically redesign pages, delete components, change dependencies, or retire features merely because an issue identifies them.
- Do not create commits, push, publish, or change hosting settings unless authorized by the current task/session. Existing authorization should not be requested again.
- Do not infer that absent backend directories need to be recreated or deleted.
- Use independent exploration to resolve source facts. Ask for product choices only when necessary for dependent work, and continue other authorized work where possible.

## Start here

1. Read [docs/CODEBASE_ANALYSIS.md](docs/CODEBASE_ANALYSIS.md) for architecture, page/component inventories, API interactions, and deployment facts.
2. Read [docs/MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md) for sequence, acceptance criteria, and unresolved product choices.
3. Read [docs/ISSUES.md](docs/ISSUES.md) for stable `CJ-###` work items and status.
4. Inspect the relevant current source; the documents are a baseline that must be updated as code changes.

The original analysis examined commit `6501155`. Its no-emit TypeScript check failed because an admin test fixture lacks `deleteLoading` and `delete` (CJ-009). It did not run a production build/test suite, exercise the browser UI, call backend services, or verify DNS/GitHub Pages settings. Do not report those checks as passed based on the handoff.

## Architecture map

- Application/tooling root: `frontend/`; there is no root package.json.
- Bootstrap: `frontend/index.html` → `src/index.tsx` → `App.tsx` → `context/Theme.tsx`.
- `Theme.tsx` contains BrowserRouter, SiteUiModeProvider, and the shell with AuthProvider. `ThemeProvider.tsx` separately forces light mode.
- `components/layout/Layout.tsx` selects StandardUI, TerminalUI, or shell-free feature content.
- `routes/publicRoutes.ts` registers pages; `routes/AppRoutes.tsx` renders them with Suspense/admin guards and optional login overlay.
- `features/portfolio/data/` holds profile/project data and the terminal command module. The terminal module also contains API execution logic despite its `data/` location.
- `features/standardUI/` contains the active standard shell and home page. `pages/Home.tsx` delegates to `StandardHome`.
- `features/terminalUI/` contains terminal presentation, session logic, dragging, and local event telemetry.
- `features/ticTacToe/` contains browser-local game logic and imported lookup JSON.
- `features/jitCafe/` contains nested Home/Menu/Contact pages and a static menu snapshot. Ordering/staff screenshots are not active ordering/admin routes.
- `features/addToTheAux/` currently requires playlist/search/playback APIs and authentication.
- `components/content/` contains a shared content browser and admin/editor infrastructure. `components/common/ContentModal.tsx` also owns engagement/auth-dependent behavior.
- `lib/api.ts`, `lib/csrf.ts`, `lib/env.ts`, and `lib/services/ContentPlatformService.ts` implement main API configuration/requests/types. AUX has another API helper.
- `public/assets/` contains images/icons/PDF; `public/content/` contains older unwired Markdown/text. Do not assume those files are a complete export of API content.

Navigation is currently defined in several places: route registry, profile header links, terminal commands, and JIT Cafe navigation. `showInNav` does not drive the standard header. Check all relevant surfaces when changing routes.

Known routing distinctions: `/projects/:id` treats `id` as a slug; four local case studies override matching API slugs. `/projects` has no registered route, though a preview targets it. Blog posts currently open in a modal. A global not-found route is absent. See the tracker before treating these as intended behavior.

## Frontend-only requirements

For authorized migration/new functionality:

- Do not introduce Spring Boot, PostgreSQL, server functions, a replacement application REST API, or runtime application authentication as a solution.
- Use local TypeScript/JSON/Markdown and static assets for retained content. Prefer a small shared local content boundary over reproducing server DTO/pagination abstractions without need.
- Preserve selected content, media, slugs, and useful published URLs before retiring API sources. Record unknown/missing content; never invent an export.
- Browser storage can hold preferences or explicitly local demo state. It cannot provide shared comments/playlists or secure administration; do not describe it that way.
- Resolve the future of AUX, comments/likes, terminal mode, blog navigation, and obsolete URLs using the user's direction and documented decisions. Do not silently select a destructive feature outcome.
- Remove global session requests and terminal/API Lab/feature requests as well as obvious page fetches before claiming backend independence.
- Ordinary static file loading and external links are allowed. Optional external font requests do not imply an application backend. Full offline support is not an established requirement.
- Professional experience and historical case studies may legitimately mention backend technologies. Update runtime claims without deleting accurate career/project history solely because it mentions Java or databases.

## Development conventions

- Use TypeScript and functional React components/hooks. Keep feature UI, hooks, local data, and pure logic separated according to existing useful boundaries.
- Keep page entrypoints focused; place genuinely shared presentation in shared components and feature-specific behavior under its feature.
- Separate content access/selection from rendering so the redesign can change layouts without rewriting content rules.
- Prefer native links/buttons, labeled form controls, meaningful image alternatives, and complete dialog focus behavior. Account for keyboard, mobile, large text, and reduced motion.
- Use a coherent shared token system and scoped feature styling. Existing CSS is not fully isolated; check navigation between features for style leakage. Do not create another parallel theme/style system casually.
- Check route destinations, navigation, demo/iframe targets, and asset paths together. Root-relative paths currently assume custom-domain root hosting.
- Do not add libraries for behavior that the existing stack can handle clearly. Dependency changes must be part of the authorized work; preserve the lockfile's unrelated edits.
- Test meaningful behavior proportional to the change. Avoid implementation-mirroring tests or tests for trivial documentation edits. Retire obsolete tests alongside retired features rather than preserving unused server abstractions.
- Use `rg`/`rg --files` for source discovery. Confirm actual imports/callers before deleting apparently inactive files.

## Commands and validation

Run application commands from `frontend/`:

```sh
npm run dev
./node_modules/.bin/tsc --noEmit --incremental false
npm test
npm run build
npm run preview
```

Use the commands appropriate to the task, not the entire list automatically. Vite emits `frontend/build/`. `npm run build` does not currently run TypeScript checking. Vitest uses jsdom and `src/tests/setupTests.tsx`. Existing coverage primarily targets content/admin model helpers; the application test is a placeholder.

Do not install dependencies merely to inspect or document the project. Do not run a build/test that writes artifacts during an explicitly strict read-only task; a no-emit check may be suitable when permitted. For implementation, distinguish baseline failures from regressions and record actual results.

For documentation-only work, validate local Markdown links, cross-document consistency, issue statuses, and the final diff. Do not change application code to make an audit finding disappear.

## Deployment conventions

- `frontend/public/CNAME` contains `compilingjava.com`; current router/assets/fallback assume hosting at the domain root.
- `frontend/vite.config.ts` uses output `build` and a development `/api` proxy to localhost:8080. The proxy is not a production service and is scheduled for removal after its consumers migrate.
- `frontend/public/404.html` redirects to `/?spa-path=…`; `frontend/index.html` restores that path. Double decoding is tracked in CJ-013.
- No Actions workflow existed at handoff. `npm run deploy` runs a build and publishes via `gh-pages -d build`; do not treat it as a harmless validation command.
- Package `homepage` metadata does not configure Vite's base. A `/web/` deployment requires coordinated router, assets, manifest, iframe, and fallback changes.
- Verify root/subpath hosting, deep-link refresh, query/hash encoding, unknown paths, images/PDF, and absence of API requests before declaring readiness.
- Keep remote Pages/DNS/HTTPS settings explicitly unverified until checked. A local production build does not prove a live deployment works.

## Documentation and multi-agent workflow

The Markdown documentation is the shared project memory across collaborating agents (including Antigravity, Codex, Claude Code, and Gemini CLI). Never assume another agent has access to your conversation history, and never overwrite another agent's changes without reviewing them.

### Before making changes

Read the latest versions of:

- `AGENTS.md`
- [docs/CODEBASE_ANALYSIS.md](docs/CODEBASE_ANALYSIS.md)
- [docs/MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md)
- [docs/ISSUES.md](docs/ISSUES.md)
- `docs/CHANGELOG.md` (if it exists)

### Issue management lifecycle

1. **Before starting an issue:**
   - Read its description in [docs/ISSUES.md](docs/ISSUES.md) and inspect the relevant source files.
   - Identify the files requiring modification and check whether another agent is already assigned/working on the issue.
   - Mark the issue status as `IN PROGRESS` and record your `Assigned Agent` name in [docs/ISSUES.md](docs/ISSUES.md).
2. **While implementing:**
   - Keep changes focused on the selected issue; do not redesign unrelated pages or modify unrelated functionality.
   - Run appropriate tests and build checks.
   - Document anything that could affect other components.
3. **After completing an issue:**
   - Update its `Status`, `Files Modified`, and `Verification` fields in [docs/ISSUES.md](docs/ISSUES.md) (keep index and detail statuses consistent). If implementation or verification is incomplete, do not mark the issue resolved.
   - Record the fix in `docs/CHANGELOG.md` with the files modified, implementation explanation, tests performed and results, remaining issues/follow-up work, and your agent name.

### Standard ticket format

Tickets in [docs/ISSUES.md](docs/ISSUES.md) should be written using this structure:

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

### Document maintenance rules

- `CODEBASE_ANALYSIS.md` describes current implementation and verified evidence. Update affected sections when architecture changes; preserve the distinction between historical baseline and present state.
- `MIGRATION_PLAN.md` describes future sequence and acceptance criteria. Record resolved product choices with the decision/date; do not leave a settled question marked undecided.
- `ISSUES.md` tracks work items, priority, status, assigned agent, description/evidence, proposed solution, acceptance criteria, modified files, and verification. Resolve only after implementation/validation; use Superseded with a rationale for retired subsystems.
- Update this file when architecture, commands, or project conventions materially change. Do not turn transient observations into permanent restrictions without a project reason.
- Use repository-relative Markdown links and concrete file/function names. Avoid absolute developer-machine paths, secret values, unsupported completion claims, and reliance on chat history.
- When a source file is renamed/deleted, fix affected documentation links in the same authorized change. Keep uncertain remote/runtime behavior labeled as unverified.
- Summaries should state what changed, what was validated, and material limitations. No application migration, redesign, or fix is complete merely because a plan has been documented.
