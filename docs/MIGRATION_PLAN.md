# CompilingJava frontend-only migration plan

## Status and objective

Created 2026-10-26 from the analysis of commit `6501155`. **No migration or redesign step has been implemented.** This is a prioritized roadmap, not permission to execute every item. The task that created this document authorized only the four requested Markdown documents.

The destination is a polished personal website built primarily with React, TypeScript, Tailwind CSS, Vite, and local content, deployable as static files through GitHub Pages. It must not require Spring Boot, PostgreSQL, an application REST API, application authentication, or a server process to function.

Read [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md) for current behavior, [ISSUES.md](ISSUES.md) for individual work items, and [AGENTS.md](../AGENTS.md) for shared instructions. Issue IDs below refer to the local tracker, not GitHub issues.

## 1. Success criteria

- Every retained public page renders using bundled/local content and browser logic.
- Browsing the site, opening content, and using retained demos makes no application `/api/*` or `/actuator/*` requests, nor equivalent requests to a remote application API base.
- A clean production build works without API URLs, Google sign-in configuration, database credentials, or a backend proxy.
- Published content selected for retention is present locally with its required media and working links.
- Shared-write features are removed, archived, or explicitly presented as local demonstrations; browser storage is not described as shared persistence or secure administration.
- Navigation, direct URL entry, refresh, unknown routes, asset URLs, and PDF links work on the selected Pages URL.
- Relevant type checks, tests, production-build checks, and accessibility/responsive checks pass, with remaining limitations documented.
- Documentation describes the resulting application and the actual content-editing/deployment workflow.

Static content requests, such as retrieving a shipped Markdown/JSON file, are compatible with this goal. External links and optional font downloads are not application REST APIs. Full offline operation is not currently a requirement.

## 2. Decisions that affect implementation

These choices were not settled by the analysis. Resolve a choice when work depends on it; continue independent authorized work without waiting unnecessarily. Recommendations below are defaults for discussion, not records of user approval.

| Decision | Recommended direction | Why it matters | Related issues |
| --- | --- | --- | --- |
| Which API content survives? | Preserve selected published projects/posts, categories, dates, slugs, and media before removing their source | The repository is not a complete content backup | CJ-001, CJ-002 |
| Blog's public role | Retain local writing if content is available; decide archive placement and whether posts receive dedicated URLs | Changes navigation, content model, URL compatibility, and reader behavior | CJ-001, CJ-020 |
| AddToTheAUX | Prefer a self-contained local demo if interaction is valuable; otherwise a screenshot case study | Current search/add/playback behavior cannot remain live under the no-API requirement | CJ-006 |
| Comments and likes | Retire write controls; archive selected public discussion/counts only if useful | Shared engagement cannot be maintained with browser storage alone | CJ-004 |
| Terminal mode | Retain only if wanted as part of the redesign; replace remote/auth commands with local content/navigation | Changes shell complexity, help text, keyboard behavior, and testing | CJ-007 |
| `/projects` | Give the URL an explicit role: catalog or compatibility redirect; align the preview | The URL is currently referenced but unrouted | CJ-010 |
| Final navigation/theme | Define the intended page hierarchy and whether there is one or more UI/theme modes | Existing components and dark styles are not requirements to preserve | CJ-020, CJ-022 |
| Hosting URL | Keep root-domain `compilingjava.com` if that remains the intended domain | A repository `/web/` deployment requires coordinated path changes | CJ-012 |
| Publishing mechanism | Add repeatable GitHub Pages automation when authorized, or document the retained CLI workflow | No workflow is checked in; remote Pages settings are unknown | CJ-014 |

Do not invent missing blog posts, live backend exports, production settings, or historical content. Mark absent material and obtain it through an authorized source before claiming migration completeness.

## 3. Prioritized implementation sequence

### Phase A — Establish the baseline and preserve content

Priority: P1. Status: not started. Issues: CJ-001, CJ-009, CJ-012, CJ-025, CJ-030.

1. Read current source and git status; preserve unrelated edits. The original handoff included an existing lockfile modification.
2. Confirm the retained routes/features, content source, and deployment URL. Record decisions in this document and update tracker statuses.
3. Inventory API-only content separately from the four local case studies. For retained material, collect title, slug, type, dates, body/description, categories, demo/source links, and referenced media. Record where the export came from.
4. Keep an old-to-new URL/content mapping. Local case studies currently override API entries with the same slug; explicitly resolve collisions instead of silently dropping an entry.
5. When code changes are authorized, fix the known admin test fixture mismatch or remove it together with its retired subsystem. Establish an honest type/test baseline; do not mask the failure by excluding files solely to make the check green.

Acceptance:

- Content to retain is identified and recoverable; unknown/unavailable material is recorded.
- Feature and URL decisions needed for the next phase are documented.
- Validation results identify baseline failures separately from newly introduced failures.

### Phase B — Create the local content boundary

Priority: P1. Status: not started. Issues: CJ-002, CJ-019.

Recommended implementation direction:

- Use TypeScript for structured metadata/profile/navigation and Markdown for longer articles/case studies. JSON is appropriate for exported data such as the existing game lookup.
- Prefer source-controlled content imported through Vite, including raw Markdown imports where suitable, so missing imports are caught during development/build. Keep public assets for images, icons, and documents.
- Use stable slugs as public content identifiers. Avoid recreating a server pagination/DTO abstraction if the retained collection can be filtered locally.
- Represent the data the pages actually need: title, slug, dates/year, summary/body, optional categories, media/previews, technology tags, and links. Preserve historical numeric IDs only where an archive/mapping needs them.
- Provide shared local selectors for lookup by slug, categories, latest posts, filtering, and ordering. Keep content access separate from presentation so a redesign can change layouts independently.
- Consolidate local and managed project rendering; migrate useful data from both `PortfolioProject` and `ContentItem` rather than retaining two competing catalogs.

Acceptance:

- Retained data/media is local and references resolve.
- Slugs are unique and old URLs have documented destinations.
- Shared content selectors do not import API, CSRF, or auth modules.

### Phase C — Migrate public content consumers

Priority: P1. Status: not started. Issues: CJ-002, CJ-010, CJ-019, CJ-020.

Recommended order:

1. Home project catalog: replace supplementary API loading with the consolidated local collection.
2. ProjectDetail: remove unknown-local-slug API fallback; render retained local data and a clear missing-content state.
3. About writing: use local latest-post selection and local full bodies.
4. Blog archive: use local category/filtering and the chosen reader/URL model.
5. Shared content display: separate content reading from engagement and authentication. Reuse or replace Markdown/preview components based on the redesign direction.

Keep the behavior change reviewable before substantial visual replacement. This does not require preserving current markup or styles; it separates content correctness from design choices.

Acceptance:

- Home/About/Blog/project details work with backend requests blocked.
- Existing retained slugs resolve, and nonexistent slugs no longer trigger remote lookups.
- API errors, database-source labels, and backend loading states are absent from migrated reader flows.
- Blog links and category behavior match the chosen navigation model.

### Phase D — Resolve demos and remove user/server workflows

Priority: P1. Status: not started. Issues: CJ-003 through CJ-008.

Execute these related changes in coherent patches so intermediate code does not call missing providers or services:

- **Engagement:** implement the chosen retirement/archive behavior. Remove like/comment/reply/delete mutations and login prompts. If a local interactive sample is approved, label it clearly and keep its state local.
- **AUX:** replace playlist/search/current-track hooks with approved local fixtures and local interaction, or retire the runtime route in favor of its case study. Remove login gating, guest-expiry requirements, and live-playback claims. Keep track artwork/assets locally if the demo is expected to work without external image dependencies.
- **Terminal:** if retained, use local content/navigation commands and remove session/status/auth/API calls. Update help, command aliases, telemetry messages, and project/feature targets.
- **Administration:** remove runtime admin/editor/API Lab routes and their exclusive consumers after the repository-based publishing workflow is ready. Define useful redirect/not-found behavior for retired URLs.
- **Authentication:** remove login/Google integration, session/username/logout operations, auth guards, background-login routing, and finally the global AuthProvider once its consumers are gone.
- **Infrastructure:** remove unused API services/types, CSRF helpers, backend environment configuration, Google declarations, and the development API proxy after all references are resolved. Do not remove ordinary local-data fetching solely because it uses Fetch.

Tic Tac Toe's lookup/logic and JIT Cafe's menu snapshot can remain local foundations. Historical project descriptions may still mention Java, Spring Boot, PostgreSQL, or Spotify as technologies used in those projects; distinguish that from the website requiring them now.

Acceptance:

- No route or terminal command can trigger application API, actuator, session, Google login, or CSRF traffic.
- No active UI advertises server-backed actions that no longer work.
- Static pages no longer mount an authentication provider.
- Local demo state resets/persists according to its documented behavior and is not presented as shared service data.

### Phase E — Make static hosting reliable

Priority: P1 for routing/base fixes; P2 for automation. Status: not started. Issues: CJ-010 through CJ-014.

- Confirm the root-domain or repository-subpath target before changing Vite base or router strategy.
- Align Vite asset base, BrowserRouter basename if used, asset/PDF URLs, internal iframe paths, manifest start URL, canonical URLs, and the 404 fallback as one hosting contract.
- Correct the SPA restoration decoding behavior and handle ordinary unknown routes with a useful application not-found page.
- Resolve `/projects` deliberately; update the existing embedded preview and all references accordingly.
- Preserve the current `build/` output convention unless a future task explicitly changes all consumers of it.
- Establish repeatable validation and publishing with appropriate Node/dependency setup. If using Actions, produce the Pages artifact from the frontend build and document required remote settings.
- Verify CNAME/domain/HTTPS against actual hosting settings before declaring deployment complete. Publishing or changing external settings requires authorization from the task/session.

Acceptance:

- Build succeeds without backend environment variables.
- Direct links and refreshes work at the selected deployment root, including nested JIT Cafe paths.
- Queries, hashes, Unicode, encoded percent characters, and unknown paths have tested behavior.
- Assets/PDF load from their intended URLs; static `/api` paths are never used by the app.

### Phase F — Redesign shared UI and pages

Priority: P2, after dependent product choices. Status: not started. Issues: CJ-015 through CJ-024, CJ-026, CJ-027, CJ-029.

- Define the navigation hierarchy, shared spacing/type/color rules, responsive behavior, and accessible interaction patterns before rebuilding individual screens.
- Decide whether terminal and standalone feature shells remain. Existing designs are reference material, not constraints.
- Consolidate reusable links, cards, content sections, image previews, empty states, and dialogs where they serve the chosen design. Avoid building a large component framework without real consumers.
- Scope feature styles or use a consistent isolation strategy; address duplicate shared utilities and stale checkout/staff styles as features are replaced.
- Rebuild portfolio pages and demos in reviewable increments. Keep game rules and content models independent of their new presentation.
- Address keyboard activation, modal naming/focus behavior, game control labels, nested interactive elements, and reduced-motion behavior as part of the relevant components.
- Update truthful site metadata/copy and project descriptions. Keep professional skill/history content unless the user wants it changed.
- Remove confirmed inactive components/assets/dependencies only after references and content value have been checked.

Acceptance:

- Navigation is coherent across desktop/mobile and any retained modes.
- Keyboard users can reach and operate all actions; dialogs manage focus; controls have meaningful accessible names.
- No feature navigation introduces unintended styling changes elsewhere.
- Layouts work with long content, small screens, large text, and reduced-motion preferences.

### Phase G — Validate and document completion

Priority: release gate. Status: not started. Issues: CJ-014, CJ-024, CJ-025 and remaining open release blockers.

Run focused automated checks and browser scenarios; record actual results, not expected outcomes. Update the three project documents and shared instructions to reflect the final implementation. Mark issues resolved only with evidence, or superseded with an explanation when a subsystem was intentionally retired.

Do not mark the migration complete merely because the project bundles successfully or the home page renders. The no-backend contract applies to every retained route, command, and interaction.

## 4. Validation matrix

| Area | Required scenarios |
| --- | --- |
| Content | Local slug lookup, duplicate detection, ordering/latest selection, categories, empty collections, Markdown/media links |
| Routing | All retained pages, old URL mappings, `/projects`, unknown paths, nested feature routes, direct load and refresh |
| Hosting | Selected base path, CNAME artifact, assets/PDF, query/hash preservation, percent/Unicode URL handling |
| Network independence | Block application APIs; inspect network on navigation, content opening, terminal commands, demo interaction, and expired historical guest-preview storage |
| State | UI mode preference if retained, storage-unavailable behavior where relevant, local demo reset/persistence, route transitions |
| Tic Tac Toe | Both starters, legal moves, win/draw/retry, lookup mapping, hints, symmetry selection, compact layout |
| JIT Cafe | Snapshot rendering, category/carousel navigation, images/fallbacks, phone/contact links, mobile menu |
| AUX | Chosen local-demo or archive behavior; no misleading live search/playback/auth controls |
| Accessibility | Keyboard-only navigation, dialog focus entry/trap/return, accessible names, contrast, reduced motion, large text |
| Tooling | No-emit TypeScript check, relevant Vitest tests, production build, local production preview |
| Documentation | Architecture matches source; decisions recorded; issue statuses supported; edit/build/publish instructions reproducible |

The current tests mainly cover content/admin models. Add meaningful behavior tests for retained functionality; do not create tests that merely mirror the new implementation or preserve obsolete admin abstractions.

## 5. Progress and handoff workflow

- All phases above are unstarted at this handoff; only documentation was created.
- Reference issue IDs in future tasks and commits if commits are authorized.
- When scope changes, update the affected phase, issue, and current-state analysis together.
- Keep content preservation and migration separate from destructive data/service retirement. This repository contains no backend directory to delete.
- Record any deployment result with the actual target and revision. Keep unverified remote settings explicitly unverified until checked.
- Preserve a traceable route/content mapping so a later redesign does not silently invalidate published links.
