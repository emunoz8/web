export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type ProjectPreview =
  | {
      kind: "route";
      src: string;
      title: string;
      caption: string;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
      title: string;
      caption: string;
    };

export type PortfolioProject = {
  slug: string;
  title: string;
  tagline: string;
  year: string;
  shortDescription: string;
  description: string[];
  features: string[];
  techStack: string[];
  previews: ProjectPreview[];
  liveDemo: ProjectLink | null;
  githubLinks: ProjectLink[];
  githubNote?: string;
  featured?: boolean;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "world-cup-bracket",
    title: "World Cup Bracket",
    tagline: "Rust desktop app for World Cup 2026 predictions and qualification scenarios",
    year: "2026",
    shortDescription:
      "A Rust desktop application for arranging group standings, predicting the World Cup knockout bracket, and exploring live qualification scenarios.",
    description: [
      "Built with egui and eframe, World Cup Bracket turns group-stage predictions into a clickable path from the Round of 32 to the Final. FIFA Annex C allocation data connects qualifying third-place teams to their possible knockout opponents.",
      "Optional live scores and standings power qualification analysis, including advancement estimates and per-team outcome scenarios. Named saves, JSON import and export, and a printable bracket report make predictions easy to revisit and share.",
    ],
    features: [
      "Drag-to-reorder group standings and clickable knockout-round picks",
      "Third-place opponent allocation based on FIFA Annex C",
      "Optional live data from ESPN and football-data.org",
      "Qualification scenarios and Monte Carlo advancement estimates",
      "Named saves, JSON import/export, and printable bracket reports",
    ],
    techStack: ["Rust", "egui", "eframe", "JSON"],
    previews: [
      {
        kind: "image",
        src: "/assets/features/world-cup-bracket/bracket.png",
        alt: "World Cup Bracket desktop application showing the empty knockout bracket",
        title: "Knockout bracket",
        caption: "The desktop app presents the knockout tree from the Round of 32 through the Final.",
      },
    ],
    liveDemo: null,
    githubLinks: [
      {
        label: "WorldCupBracket repository",
        href: "https://github.com/emunoz8/WorldCupBracket",
        external: true,
      },
    ],
  },
  {
    slug: "options-for-youth",
    title: "Options for Youth — Mentoring Program Platform",
    tagline: "Full-stack case-management system for a Chicago youth mentoring program",
    year: "2026",
    shortDescription:
      "A full-stack case-management system built for Options for Youth, a Chicago youth mentoring program operating inside four CPS partner schools — replacing a patchwork of Google Sheets with a real database and a purpose-built app covering enrollment, attendance, mentoring notes, risk tracking, consent forms, and reporting.",
    description: [
      "Before this project, the program ran on a set of interlinked Google Sheets tabs — one for the roster, one for attendance, one for individual contact notes, one for group notes, and so on. It worked, but it had real limits: no enforced data integrity (nothing stopped a typo'd student ID from silently breaking a lookup), no real audit trail for sensitive changes like risk-level updates, and no way to safely let multiple mentors work in the sheets at once without stepping on each other.",
      "A Postgres database is the single source of truth, sitting behind a Node/Express API deployed on Google Cloud Run. The staff-facing frontend is a Google Apps Script web app, embedded in the program's existing Google Sites intranet, so staff open the same bookmarks and navigation they already use, with no new login system to learn. A DocuSign integration handles legally required guardian/student consent forms in both English and Spanish, with signatures collected either remotely (email/text) or in person on a mentor's device.",
      "Three problems along the way were worth solving carefully rather than patching over: a cross-layer timezone bug where dates silently shifted a day for users west of UTC (traced to Postgres's default date parsing combining badly with JavaScript's UTC-midnight date-string handling, and fixed at the database driver level); a DocuSign routing-order bug where a recipient's pre-placed signature fields would silently disappear under specific conditions, eventually traced through controlled A/B testing to an undocumented interaction between a template's saved routing order and the API's per-envelope override; and a duplicate student record for the same real student, discovered via a one-digit-too-long ID, merged into a single canonical record with zero loss of guardian contacts, enrollment history, or notes.",
    ],
    features: [
      "Intake & roster — enrollment form, guardian contacts, demographics, and household/wellbeing details, with year-over-year re-enrollment preserving a returning student's original intake year and grade instead of overwriting them",
      "Attendance & sign-in — a kiosk-style sign-in flow for group sessions and individual walk-ins, letting students pick which mentor they're there to see so multiple mentors can share one kiosk",
      "Mentoring notes — a week-calendar interface for group and individual contact notes, with validation (a note needs a topic, summary, and at least one mentor present) and the ability to backdate a missed day",
      "Risk-level tracking — an append-only history of risk-level changes per student, each with a reason, instead of a single mutable field that silently loses its own history",
      "Consent forms (DocuSign) — a two-recipient sequential signing flow (guardian, then student), bilingual templates, a photo/video release checkbox that defaults to granted but stays editable, and an in-person signing option for families without an email or phone on file",
      "Pre/post surveys — a 37-question assessment at the start and end of the program year, with results tied to a specific program year so question sets can evolve without corrupting past answers",
      "Dashboard & reporting — a live program snapshot (active students, attendance, documentation completion, who hasn't been seen recently), with month-by-month lookback and export to Excel and Google Sheets for grant reporting",
      "Admin tools — mentor caseload assignment (a standing school/grade rule with per-student override), a CPS partner-school staff directory, and a program-wide announcement board",
    ],
    techStack: [
      "PostgreSQL (Cloud SQL)",
      "Node.js",
      "Express",
      "Google Apps Script",
      "Google Cloud Run",
      "DocuSign API",
      "Google Sheets / Excel export",
    ],
    previews: [],
    liveDemo: null,
    githubLinks: [],
    githubNote: "Internal program system; live and in daily use by program staff, not publicly available.",
    featured: true,
  },
  {
    slug: "compilingjava-web-platform",
    title: "CompilingJava Web Platform",
    tagline: "Full-stack portfolio and publishing system",
    year: "2026",
    shortDescription:
      "The platform behind this portfolio, built to publish projects and blog content, manage admin workflows, and host interactive feature routes inside one maintainable application.",
    description: [
      "This project is the system that powers the site itself. Instead of a static portfolio, I built a small content platform that supports public project pages, blog publishing, administrative editing, and interactive demo routes under the same application shell.",
      "The goal was to build something maintainable enough to evolve over time. New content can be added through the app, public pages stay structured, and new features such as JIT Cafe, AddToTheAUX, and Tic Tac Toe can be shipped as first-class parts of the site rather than one-off embeds.",
    ],
    features: [
      "Unified project and blog publishing model backed by a shared content system",
      "Protected admin workflows for creating, editing, and organizing content",
      "Authentication, session, and CSRF handling for production-ready admin access",
      "Support for interactive feature routes living alongside traditional portfolio pages",
    ],
    techStack: ["React", "TypeScript", "Tailwind CSS", "Java", "Spring Boot", "PostgreSQL", "Google Cloud Run"],
    previews: [
      {
        kind: "route",
        src: "/projects",
        title: "Projects page preview",
        caption: "The platform serves structured portfolio content and internal project routes from one application shell.",
      },
    ],
    liveDemo: {
      label: "View live site",
      href: "/",
    },
    githubLinks: [],
    githubNote: "Repository is private while the production platform is under active development.",
    featured: true,
  },
  {
    slug: "atta",
    title: "AddToTheAUX",
    tagline: "Interactive Spotify queue experience",
    year: "2026",
    shortDescription:
      "A Spotify-connected application that turns shared playlist contribution into a more deliberate product experience, with guest preview, authentication, and custom queue interaction.",
    description: [
      "AddToTheAUX was built to move away from a standard list-based queue interface. The application treats playlist contribution as an actual product flow: people can see what is playing, browse the playlist, search for tracks, and contribute songs through a custom orbit-based interface.",
      "The frontend is intentionally more visual than a typical internal tool, but the engineering value is in the system around it: authenticated contribution, guest preview limits, Spotify-backed search, and a backend layer that keeps integration logic outside the browser.",
    ],
    features: [
      "Live playlist and currently playing views backed by Spotify data",
      "Guest preview flow that allows limited exploration before login is required",
      "Authenticated track submission with backend-controlled playlist operations",
      "Stateful React interface built around a custom orbit-style browsing model",
    ],
    techStack: ["React", "TypeScript", "Java", "Spring Boot", "Spotify Web API", "OAuth"],
    previews: [
      {
        kind: "image",
        src: "/assets/features/atta/atta_landing.png",
        alt: "AddToTheAUX landing view",
        title: "Landing view",
        caption: "The product opens with a guided landing surface instead of a conventional utility-style queue screen.",
      },
      {
        kind: "image",
        src: "/assets/features/atta/atta_current.png",
        alt: "AddToTheAUX current track view",
        title: "Current track view",
        caption: "The currently playing state stays central to the experience, with contribution and playback context kept in view.",
      },
      {
        kind: "image",
        src: "/assets/features/atta/atta_nowPlaying.png",
        alt: "AddToTheAUX now playing screen",
        title: "Now playing screen",
        caption: "Playback context stays prominent, with the current song and shared queue state presented as the core interaction surface.",
      },
      {
        kind: "image",
        src: "/assets/features/atta/atta_search.png",
        alt: "AddToTheAUX search flow",
        title: "Search flow",
        caption: "Track discovery and contribution are handled through a dedicated search surface instead of a plain add-song form.",
      },
      {
        kind: "image",
        src: "/assets/features/atta/atta_link.png",
        alt: "AddToTheAUX invite link flow",
        title: "Invite and access flow",
        caption: "Guest access and contribution are built around a deliberate share and entry flow rather than a raw playlist link.",
      },
    ],
    liveDemo: {
      label: "Open live demo",
      href: "/add-to-the-aux",
    },
    githubLinks: [],
    githubNote: "A public repository is not linked for this project.",
  },
  {
    slug: "tic-tac-toe-revisited",
    title: "Tic Tac Toe",
    tagline: "Minimax lookup generator with React game UI",
    year: "2025",
    shortDescription:
      "A game AI project where a Java generator precomputes optimal Tic Tac Toe moves, compresses the reachable state space, and exports a lookup consumed by the frontend UI.",
    description: [
      "This project started as a way to revisit game-playing ideas from an AI course and finish something I had wanted to build for years. The result was a Java generator that computes optimal Tic Tac Toe play ahead of time and writes the output to a compact JSON lookup.",
      "That lookup is then consumed by the browser UI so the game can respond instantly with optimal moves. The interesting part is not just the game itself, but the engineering around canonical state generation, symmetry reduction, memoization, and test coverage.",
    ],
    features: [
      "Java 17 lookup generator that computes optimal play using a Negamax-style minimax recurrence",
      "Symmetry-aware state reduction so equivalent boards are solved once and reused",
      "Lookup JSON consumed by a React frontend for instant browser-side move selection",
      "JUnit coverage for win detection, blocking logic, terminal states, and canonicalization",
    ],
    techStack: ["Java 17", "JUnit", "JSON", "React", "TypeScript"],
    previews: [
      {
        kind: "image",
        src: "/assets/features/tic-tac-toe/ttt_start.png",
        alt: "Tic Tac Toe start screen",
        title: "Start screen",
        caption: "The game opens with a simpler onboarding state before the match and AI interaction begin.",
      },
      {
        kind: "image",
        src: "/assets/features/tic-tac-toe/ttt_playerStart.png",
        alt: "Tic Tac Toe player start state",
        title: "Player-first state",
        caption: "The interface supports a clean player-first flow before the lookup-driven AI responses take over.",
      },
      {
        kind: "image",
        src: "/assets/features/tic-tac-toe/ttt_Hints.png",
        alt: "Tic Tac Toe hints view",
        title: "Hints view",
        caption: "The UI exposes guidance states so the game can show more than just the final optimal move.",
      },
      {
        kind: "image",
        src: "/assets/features/tic-tac-toe/ttt_AiMoveWithHints.png",
        alt: "Tic Tac Toe AI move with hints",
        title: "AI move with hints",
        caption: "Lookup-backed move selection and hinting are presented directly in the game surface without running search in the browser.",
      },
      {
        kind: "image",
        src: "/assets/images/projects/tictactoe-minimax-diagram.jpg",
        alt: "Tic Tac Toe minimax diagram",
        title: "Reference diagram",
        caption: "The project connects classic minimax reasoning to a precomputed lookup workflow.",
      },
    ],
    liveDemo: {
      label: "Play live demo",
      href: "/tic-tac-toe",
    },
    githubLinks: [
      {
        label: "Game UI repository",
        href: "https://github.com/emunoz8/tic-tac-toe-game-ui",
        external: true,
      },
      {
        label: "Lookup generator repository",
        href: "https://github.com/emunoz8/tictactoe-minimax-lookup-generator",
        external: true,
      },
    ],
  },
  {
    slug: "jit-cafe",
    title: "JIT Cafe",
    tagline: "Guest-facing restaurant website in React",
    year: "2026",
    shortDescription:
      "A restaurant-style frontend where the menu is the main experience, built as a scoped React feature with responsive browsing, structured content, and a polished public surface.",
    description: [
      "JIT Cafe is a public restaurant website prototype built to feel like a finished customer-facing product rather than a generic application shell. The site focuses on three pages: a home page, a menu experience, and a contact page.",
      "The menu is the center of the project. Typography, spacing, section structure, card design, and mobile browsing behavior were all shaped around making the menu feel like the product instead of just another utility screen.",
    ],
    features: [
      "Three-page public website flow built as a scoped React feature route",
      "Menu-centered browsing with responsive card layouts and mobile section snapping",
      "Static menu snapshot approach for predictable rendering and easy iteration",
      "Feature-level styling that integrates into the larger portfolio without leaking globally",
    ],
    techStack: ["React", "TypeScript", "Tailwind CSS", "React Router", "Static content modeling"],
    previews: [
      {
        kind: "image",
        src: "/assets/features/jit-cafe/online-order-build-your-order.png",
        alt: "JIT Cafe online order build your order view",
        title: "Build your order",
        caption: "The guest flow starts with a menu-first ordering surface designed to feel like the product, not a generic catalog.",
      },
      {
        kind: "image",
        src: "/assets/features/jit-cafe/online-order-customize-item.png",
        alt: "JIT Cafe online order item customization view",
        title: "Customize item",
        caption: "Item customization is handled in its own polished step so guests can adjust portions, add-ons, and details without leaving the flow.",
      },
      {
        kind: "image",
        src: "/assets/features/jit-cafe/online-order-cart-review.png",
        alt: "JIT Cafe online order cart review view",
        title: "Cart review",
        caption: "The cart keeps the order readable and structured before checkout, instead of collapsing everything into a dense summary block.",
      },
      {
        kind: "image",
        src: "/assets/features/jit-cafe/online-order-checkout.png",
        alt: "JIT Cafe online order checkout view",
        title: "Checkout",
        caption: "Checkout extends the same visual system so the transition from browsing to purchase feels continuous.",
      },
      {
        kind: "image",
        src: "/assets/features/jit-cafe/online-order-track-order.png",
        alt: "JIT Cafe online order tracking view",
        title: "Track order",
        caption: "Post-purchase tracking keeps the guest-facing experience intact after the order is placed.",
      },
      {
        kind: "image",
        src: "/assets/features/jit-cafe/staff-incoming-orders.png",
        alt: "JIT Cafe staff incoming orders dashboard",
        title: "Incoming orders",
        caption: "The staff interface gives the internal side of the product a focused order-management surface instead of an afterthought admin table.",
      },
      {
        kind: "image",
        src: "/assets/features/jit-cafe/staff-menu-catalog.png",
        alt: "JIT Cafe staff menu catalog view",
        title: "Menu catalog",
        caption: "Staff can manage the catalog through a structured backend-facing surface that stays aligned with the public menu model.",
      },
      {
        kind: "image",
        src: "/assets/features/jit-cafe/staff-menu-item-editor.png",
        alt: "JIT Cafe staff menu item editor",
        title: "Item editor",
        caption: "The menu editor shows how the project handles maintainable content updates behind the guest-facing restaurant experience.",
      },
    ],
    liveDemo: {
      label: "Open live demo",
      href: "/jit-cafe",
    },
    githubLinks: [],
    githubNote: "A public repository is not linked for this project.",
  },
];

export const portfolioProjectsBySlug = Object.fromEntries(
  portfolioProjects.map((project) => [project.slug, project]),
) as Record<string, PortfolioProject>;

export const featuredPortfolioProjects = portfolioProjects.filter((project) => project.featured);
