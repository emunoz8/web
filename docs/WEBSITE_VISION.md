# CompilingJava website vision

Recorded 2026-10-27 from the user's direction. This document is a product-direction record, not an implementation log. It supersedes prior "developer portfolio / technical blog" framing as the site's primary purpose. See [AGENTS.md](../AGENTS.md) for collaboration rules, [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md) for current implementation, [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for the frontend-only migration (unaffected by this document), and [ISSUES.md](ISSUES.md) for tracked work items.

## 1. Purpose shift

CompilingJava stops being primarily a programming portfolio/technical blog. It becomes Edwin Munoz's professional website for employers, recruiters, and hiring managers. It must communicate the combination of:

- Computer Science / software engineering background (B.S., Northeastern Illinois University).
- MBA in progress, Business Analytics concentration, University of Illinois Chicago.
- Software development, systems engineering, data management/analytics/reporting, operational technology solutions.
- Youth development / program coordination experience (Options for Youth).
- United States Marine Corps leadership experience.
- Ability to translate organizational needs into technical solutions.

Target outcome: a visitor understands, within one visit, who the person is, their technical and business skills, problems solved, projects built, how CS + MBA complement each other, why that is valuable, and how to make contact — then wants to follow up.

## 2. Structure: three-page maximum

| Page | Role |
| --- | --- |
| Home | Primary professional introduction. Identity, CS+MBA framing, value proposition, competencies, selected experience/accomplishments, featured projects, education/leadership, resume download, contact. Must stand alone — an employer should not need to click further to understand qualifications. |
| Projects | A small number of substantial case studies, not a repository list. Each: problem, context, responsibilities/contributions, technologies, architecture, resulting impact. Options for Youth's case-management work is a candidate featured case study (software engineering + data management + operational problem-solving). Quality over quantity. |
| About | Deeper narrative: education (B.S. CS; MBA in progress), program-coordination experience, Marine Corps leadership, professional interests (analytics, software engineering, information systems, AI), career objective/philosophy. Must not restate Home content. |

Navigation: `Home | Projects | About | Resume ↗` (Resume is a link/download, not a route). Contact lives on Home and/or the footer. No standalone Skills, Experience, Education, Contact, Resume, or Blog pages. A future Research/Writing section is explicitly out of scope until separately approved.

**Recommendation on page count:** keep three pages (not two). The existing `Resume.tsx` content (detailed multi-employer work history, certifications) and the Options for Youth case study both carry real narrative weight that would overload a two-page site (Home + Projects-and-About combined). Three focused pages with no filler pages matches the content volume without violating the "streamlined" goal. Revisit only if About and Projects end up thin after content is drafted.

## 3. Content ground rules

- Do not invent accomplishments, metrics, certifications, employment history, or technical experience. Use only verified repository/profile data or content the user explicitly supplies.
- Historical technology mentions (Java, Spring Boot, PostgreSQL, Spotify, etc. in past project descriptions) describe prior work and may stay — they are not claims about the site's current runtime.
- Business/leadership framing (MBA, analytics, Marine Corps leadership, Options for Youth) must appear alongside technical content, not as a separate disconnected section.

## 4. Design direction

Modern, professional, sophisticated, technically credible — for recruiters, hiring managers, business leaders, and technical peers. Prioritize clean typography/hierarchy, minimal navigation, responsive layout, accessibility, fast load, clear presentation of accomplishments, consistent styling. Avoid gimmicky developer aesthetics, excessive animation, unnecessary complexity. This is a **significant visual redesign**, tracked separately from this document (see Section 6).

## 5. Technical constraints (unchanged)

Frontend-only; React/TypeScript/Tailwind/Vite unless a change is justified; no backend/database/server dependency; static-hostable on GitHub Pages. Consistent with [AGENTS.md](../AGENTS.md) and the completed frontend-only migration in [MIGRATION_PLAN.md](MIGRATION_PLAN.md).

## 6. Current site vs. this vision — gap analysis

Based on `frontend/src/routes/publicRoutes.ts`, `features/portfolio/data/profile.ts`, `projects.ts`, and `pages/{About,Resume,Contact}.tsx` as of this writing:

### Page count and navigation
- Current nav (`portfolioNavItems` in `profile.ts`) is six items: Home, Projects, Blog, About, Resume, Contact — each a full route in `publicRoutes.ts`. Vision allows four nav entries, one of which (Resume) is a download link, not a page.
- `Blog` and its `/about`-embedded "Latest posts" widget (`About.tsx`) target local case-study/technical-writing content — orthogonal to the new employer-facing purpose. No blog content currently exists as a polished asset per `CODEBASE_ANALYSIS.md`'s CJ-001 finding.
- `Resume.tsx` is a full page, not a download action; `Contact.tsx` is a full page, not a Home/footer section.
- Non-navigable feature routes (`/add-to-the-aux`, `/tic-tac-toe`, `/jit-cafe/*`) remain registered. They are candidate **Projects-page case-study content**, not separate top-level pages — already `showInNav: false`, so no nav change needed there, but their current presentation (full standalone interactive routes with no return path framing as "projects") does not match the vision's "case study with problem/context/impact" structure.

### Positioning and identity
- `portfolioProfile` (`profile.ts`) brands Edwin as `"Full-Stack Developer | Java, Spring Boot & React"` with a purely technical `summary`, `heroFacts`, and `stackGroups` (Backend/Frontend/Data/Cloud only). No mention of the MBA, Business Analytics, UIC, data analytics/reporting, or a business+technology positioning anywhere in the data layer.
- `shortAbout` and `aboutParagraphs` mention the Marine Corps only as "diesel mechanic" background, not as leadership experience. Options for Youth is absent from `profile.ts`/`projects.ts` entirely; it exists today only as one work-history entry inside `Resume.tsx`'s `workExperience` array, with no technical/data detail surfaced as a project.
- `Resume.tsx` already contains the fullest career narrative (seven roles including Marine Corps leadership, Options for Youth, and prior mechanical/technician roles) but this detail is disconnected from `profile.ts` and from the Projects data model, and is not framed for a CS+MBA/business-impact reading.

### Projects page
- `projects.ts` has four entries: `compilingjava-web-platform`, `atta` (AddToTheAUX), `tic-tac-toe-revisited`, `jit-cafe`. All four are developer-portfolio/demo projects; none is the Options for Youth case-management platform the vision calls out as a potential featured case study. That case study does not yet exist as structured content anywhere in the repo — it needs to be authored from user-supplied facts, not inferred from the current `workExperience.story` prose (which is resume-level summary, not case-study-level detail: no architecture, no explicit business impact beyond "replaced manual reporting").
- Existing four projects skew toward "developer portfolio" (game AI, Spotify demo, restaurant UI, the site's own platform) rather than "business impact." Under the vision's "quality over quantity" rule, some may be demoted to shorter mentions or dropped from the primary Projects page rather than each getting a full case-study treatment.

### About page
- Current `About.tsx` is almost entirely a blog-post list (`listLocalContents({ type: "BLOG" ... })`) plus two short paragraphs from `shortAbout`. It has no education, MBA, leadership, or career-objective content — the opposite emphasis from the vision's About page.

### Resume/Contact
- `Resume.tsx` duplicates identity/summary content already on Home-equivalent data and functions as a destination page rather than a download trigger. `Contact.tsx` is a standalone page of icon links; the vision wants this folded into Home/footer.

## 7. Prioritized redesign roadmap

This is sequencing guidance, not authorization to implement. No application code should change until the user approves specific steps.

1. **Content decisions (blocking everything else).** Get from the user: MBA/business-analytics framing details, Options for Youth case-management platform facts (problem, role, tech, data/process changes, outcome — no invented metrics), which of the four existing dev projects to keep/feature/demote, and final resume document if it should change from the current PDF.
2. **Information architecture.** Finalize the three-page map (Home/Projects/About) and nav (`Home | Projects | About | Resume ↗`); decide Resume as external link vs. `/assets/documents/...` download vs. a route that 302s to the PDF; decide Contact placement (Home section vs. footer vs. both).
3. **Data layer rework.** Repoint `profile.ts` identity/summary/stack/hero-fact copy at the CS+MBA+leadership positioning; fold `Resume.tsx`'s `workExperience` into a reusable local data source consumed by Home/About instead of a resume-only page; add an Options for Youth entry to the local project/case-study data model once facts are supplied.
4. **Page consolidation.** Merge Resume and Contact content into Home/footer; retire the `/blog` route and About's blog-list section (or relocate any content worth keeping once the user confirms writing has no home in the new structure); keep `/projects/:id` for case-study detail but reduce the catalog to the prioritized set from step 1.
5. **Visual redesign.** Apply the new professional/sophisticated design direction across the three retained pages and shared shell (header/footer/nav), after steps 1–4 settle what content actually needs to be designed for.
6. **Validation and docs.** Re-run `npm run validate`; update `README.md`, `CODEBASE_ANALYSIS.md`, and `ISSUES.md` to reflect the new page set and retired routes; record this roadmap's resolved decisions back into this file.

## 8. Pages/data to consolidate or remove

- **Remove as top-level nav/pages:** `/blog`, `/resume` (becomes a link), `/contact` (folds into Home/footer).
- **Keep, scope down:** `/projects` and `/projects/:id` — same routes, narrowed content set and case-study-style detail per project.
- **Keep as-is (not in scope of this vision change):** `/add-to-the-aux`, `/tic-tac-toe`, `/jit-cafe/*` as non-nav interactive routes linked from Projects case studies, consistent with current `showInNav: false` handling.
- **Content to retire or relocate:** `About.tsx`'s blog-list section (`listLocalContents({ type: "BLOG" ... })` usage) has no clear home under the new About page purpose unless the user wants a small "writing" mention; default recommendation is to drop it unless the user says otherwise.
- **Content to repurpose rather than delete:** `Resume.tsx`'s `workExperience` array is the best-detailed career data in the repo today and should become the shared source for Home's "selected experience" and About's "career progression," not be deleted with the page.

## 9. Open decisions requiring the user

- Exact Options for Youth case-study facts (cannot be drafted from existing `workExperience.story` alone without inventing detail).
- Which of the four current Projects entries are "featured" vs. demoted/cut under quality-over-quantity.
- Resume delivery mechanism (static PDF link vs. GitHub Pages-hosted download vs. updated document).
- Whether any blog/writing content survives in any form, and if so where.
- Final nav/footer treatment of Contact (Home section, footer, or both).
