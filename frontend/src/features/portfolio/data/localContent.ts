import type { CategoryDomain, CategoryItem, ContentItem } from "../../../lib/api";
import { portfolioProjects, type PortfolioProject } from "./projects";

export type LocalContentItem = ContentItem & {
  categories: string[];
};

export type LocalContentPage = {
  content: ContentItem[];
  engagementById: Record<number, { likes: number; comments: number; likedByMe: boolean }>;
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

const LOCAL_PROJECT_CATEGORIES: CategoryItem[] = [
  {
    id: 101,
    domain: "PROJECT",
    slug: "web-platform",
    label: "Web Platform",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: 102,
    domain: "PROJECT",
    slug: "frontend",
    label: "Frontend & UI",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: 103,
    domain: "PROJECT",
    slug: "ai-games",
    label: "AI & Games",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
];

const LOCAL_BLOG_CATEGORIES: CategoryItem[] = [
  {
    id: 201,
    domain: "BLOG",
    slug: "java",
    label: "Java & Algorithms",
    createdAt: "2025-08-06T00:00:00.000Z",
  },
  {
    id: 202,
    domain: "BLOG",
    slug: "react",
    label: "React & Frontend",
    createdAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: 203,
    domain: "BLOG",
    slug: "architecture",
    label: "Architecture",
    createdAt: "2026-10-26T00:00:00.000Z",
  },
];

const PROJECT_CATEGORY_MAP: Record<string, string[]> = {
  "compilingjava-web-platform": ["web-platform", "frontend"],
  atta: ["web-platform", "frontend"],
  "tic-tac-toe-revisited": ["ai-games", "frontend"],
  "jit-cafe": ["frontend", "web-platform"],
};

function buildProjectMarkdown(project: PortfolioProject): string {
  const paragraphs = project.description.join("\n\n");
  const featuresList = project.features.map((feature) => `- ${feature}`).join("\n");
  const stackLine = project.techStack.join(" • ");

  return [
    `# ${project.title}`,
    `### ${project.tagline}`,
    "",
    paragraphs,
    "",
    "## Key implementation details",
    "",
    featuresList,
    "",
    "## Tech Stack",
    "",
    stackLine,
  ].join("\n");
}

const LOCAL_PROJECT_ITEMS: LocalContentItem[] = portfolioProjects.map((project, index) => ({
  id: index + 1,
  title: project.title,
  slug: project.slug,
  createdAt: `${project.year}-01-15T00:00:00.000Z`,
  type: "PROJECT",
  description: project.shortDescription,
  bodyMd: buildProjectMarkdown(project),
  projectUrl: project.liveDemo?.href ?? null,
  categories: PROJECT_CATEGORY_MAP[project.slug] ?? ["web-platform"],
}));

const TIC_TAC_TOE_BLOG_MD = `# Tic Tac Toe: Minimax Lookup Generator

This project started as something I wanted to build years earlier in an AI course. We used *Artificial Intelligence: A Modern Approach* and spent a lot of time working through game-playing problems, search, and Minimax. At the time, I understood the idea, but I did not have the skill to build the full Tic-Tac-Toe agent I had in mind.

That finally changed. I finished the project as a Java lookup generator that computes optimal Tic-Tac-Toe moves ahead of time, compresses the state space, and writes the result to JSON for a frontend UI to consume. That lookup now powers the interactive feature route inside this site.

![Book Cover](/assets/images/projects/book-cover.jpg)
*Artificial Intelligence: A Modern Approach - 4th Edition*

![Tic-Tac-Toe Minimax Diagram](/assets/images/projects/tictactoe-minimax-diagram.jpg)
*Diagram from Chapter 5 showing Minimax in Tic-Tac-Toe*

---

## What I built

- A Java 17 project that computes optimal Tic-Tac-Toe moves using Minimax implemented as Negamax
- A lookup generator that writes a compact \`tictactoe_combined_lookup.json\` file
- A symmetry-aware state reducer so equivalent boards are solved once instead of repeatedly
- A tested service layer that validates move quality, terminal handling, and canonical board generation

## How it works

Each board is represented as a 9-character string:

- Empty board: \`"---------"\`
- X opens in the center: \`"----X----"\`
- O responds in the corner: \`"O---X----"\`

From there, the generator recursively evaluates legal moves, scores positions, and stores the best move for each canonical non-terminal board state.

The implementation uses:

- Minimax via Negamax recurrence
- Depth-adjusted terminal scoring so the solver prefers faster wins and slower losses
- Memoization to reuse solved subproblems
- Symmetry reduction across the 8 Tic-Tac-Toe board symmetries
- Early win-check cutoff with \`MIN_MOVES_TO_WIN = 5\`

## Results

The finished generator documents and enforces the actual legal game space instead of brute forcing every labeling:

- Raw upper bound of cell labelings: \`3^9 = 19,683\`
- Legal complete game sequences: \`255,168\`
- Reachable legal board states: \`5,478\`
- Canonical reachable states after symmetry reduction: \`765\`
- Canonical non-terminal states used for the current X-start lookup: \`627\`

That JSON is consumed directly by the frontend game UI so the browser responds instantly with optimal moves without running a server or live tree search every turn.`;

const JIT_CAFE_BLOG_MD = `# Designing JIT Cafe: Menu-First Frontend Architecture

JIT Cafe is a guest-facing restaurant website built as a React project. It is designed like the public website for a restaurant, with a home page that introduces the brand, a food menu page that acts as the main experience, and a contact page that gives the site a complete business-facing surface.

The main purpose of the website is to show how a restaurant menu can carry the identity of the site instead of feeling like a utility page. The layout, card design, category browsing, typography, spacing, and imagery are all meant to make the menu feel readable, polished, and central to the overall experience.

## What the website is

At its core, this is a restaurant website prototype centered on the customer-facing experience. Instead of focusing on dashboards or admin tools, it focuses on what a visitor would actually see first: the restaurant identity, the menu, and the contact information.

Each page has a clear job:

- The home page introduces the restaurant and sets the visual tone
- The menu page does the main browsing work and acts as the centerpiece
- The contact page rounds out the site with core business-facing information

## Static snapshot modeling

The menu is driven by a typed local snapshot with responsive section carousels and mobile section snapping, allowing predictable rendering and zero backend runtime dependencies while keeping the browsing experience fast and self-contained.`;

const STATIC_PLATFORM_BLOG_MD = `# CompilingJava: Frontend-First Portfolio Architecture

CompilingJava brings together project case studies, technical writing, and interactive frontend demonstrations—including Tic Tac Toe, JIT Cafe, and AddToTheAUX—inside a single React and TypeScript application.

## Why a static-first architecture

By modeling project case studies, interactive lookups, and writing as local version-controlled TypeScript, JSON, and Markdown modules:

- Every route and interactive demo loads immediately without waiting on cold-start API containers or database queries
- Precomputed datasets (like the canonical Tic Tac Toe Minimax lookup table and JIT Cafe menu snapshot) run entirely in the browser
- The entire site deploys cleanly as static assets on GitHub Pages`;

const LOCAL_BLOG_ITEMS: LocalContentItem[] = [
  {
    id: 1001,
    title: "CompilingJava: Frontend-First Portfolio Architecture",
    slug: "compilingjava-frontend-architecture",
    createdAt: "2026-10-26T00:00:00.000Z",
    type: "BLOG",
    description:
      "How CompilingJava packages interactive React feature demos, precomputed lookups, and structured case studies into a self-contained static web application.",
    bodyMd: STATIC_PLATFORM_BLOG_MD,
    categories: ["architecture", "react"],
  },
  {
    id: 1002,
    title: "Designing JIT Cafe: Menu-First Frontend Architecture",
    slug: "jit-cafe-react-restaurant-website",
    createdAt: "2026-03-11T00:00:00.000Z",
    type: "BLOG",
    description:
      "Building a guest-facing restaurant website in React where the menu is the central visual and structural experience, backed by a static menu snapshot.",
    bodyMd: JIT_CAFE_BLOG_MD,
    categories: ["react", "architecture"],
  },
  {
    id: 1003,
    title: "Tic Tac Toe: Minimax Lookup Generator",
    slug: "tic-tac-toe-minimax-lookup-generator",
    createdAt: "2025-08-06T00:00:00.000Z",
    type: "BLOG",
    description:
      "Precomputing optimal Tic-Tac-Toe play in Java 17 using Negamax and board symmetry reduction to export a compact JSON lookup for instant browser play.",
    bodyMd: TIC_TAC_TOE_BLOG_MD,
    categories: ["java", "architecture"],
  },
];

const ALL_LOCAL_ITEMS: LocalContentItem[] = [...LOCAL_PROJECT_ITEMS, ...LOCAL_BLOG_ITEMS];

function stripCategories(item: LocalContentItem): ContentItem {
  const { categories: _categories, ...contentItem } = item;
  return contentItem;
}

export function listLocalCategories(domain: CategoryDomain): CategoryItem[] {
  return domain === "PROJECT" ? [...LOCAL_PROJECT_CATEGORIES] : [...LOCAL_BLOG_CATEGORIES];
}

export function listLocalContentsPage(params: {
  type: CategoryDomain;
  category?: string;
  q?: string;
  page?: number;
  size?: number;
}): LocalContentPage {
  const page = Math.max(0, params.page ?? 0);
  const size = Math.max(1, params.size ?? 20);
  const categorySlug = params.category?.trim().toLowerCase() ?? "";
  const query = params.q?.trim().toLowerCase() ?? "";

  const source = params.type === "PROJECT" ? LOCAL_PROJECT_ITEMS : LOCAL_BLOG_ITEMS;

  const filtered = source.filter((item) => {
    if (categorySlug && !item.categories.includes(categorySlug)) {
      return false;
    }
    if (query) {
      const haystack = `${item.title} ${item.slug} ${item.description ?? ""} ${item.bodyMd ?? ""}`.toLowerCase();
      return haystack.includes(query);
    }
    return true;
  });

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const slice = filtered.slice(start, start + size).map(stripCategories);

  return {
    content: slice,
    engagementById: {},
    number: page,
    size,
    totalPages,
    totalElements,
    numberOfElements: slice.length,
    first: page === 0,
    last: page + 1 >= totalPages,
    empty: slice.length === 0,
  };
}

export function listLocalContents(params: {
  type: CategoryDomain;
  category?: string;
  q?: string;
  page?: number;
  size?: number;
}): ContentItem[] {
  return listLocalContentsPage(params).content;
}

export function getLocalContentById(contentId: number): ContentItem | null {
  const found = ALL_LOCAL_ITEMS.find((item) => item.id === contentId);
  return found ? stripCategories(found) : null;
}

export function getLocalContentBySlug(slug: string): ContentItem | null {
  const normalized = slug.trim().toLowerCase();
  const found = ALL_LOCAL_ITEMS.find((item) => item.slug.toLowerCase() === normalized);
  return found ? stripCategories(found) : null;
}
