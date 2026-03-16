export type PortfolioNavItem = {
  label: string;
  to: string;
};

export type PortfolioResourceLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type PortfolioStackGroup = {
  label: string;
  items: string[];
};

export type PortfolioFact = {
  label: string;
  value: string;
};

export type PortfolioTechHighlight = {
  label: string;
  value: string;
};

export const portfolioNavItems: PortfolioNavItem[] = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/about" },
  { label: "Resume", to: "/resume" },
  { label: "Contact", to: "/contact" },
];

export const portfolioProfile = {
  name: "Edwin Munoz",
  title: "Software Engineer | Backend Systems and Product Engineering",
  techStackLine: "Java | Spring Boot | React | PostgreSQL | Cloud",
  techHighlights: [
    { label: "Primary backend", value: "Java and Spring Boot" },
    { label: "Frontend", value: "React and TypeScript" },
    { label: "Data", value: "PostgreSQL and relational design" },
    { label: "Cloud", value: "Deployment and production iteration" },
  ] satisfies PortfolioTechHighlight[],
  location: "Chicago, Illinois",
  summary:
    "I build backend-first web products that turn real operational workflows into maintainable software, from Spring Boot APIs and relational models to React interfaces and production deployment.",
  heroFacts: [
    { label: "Focus", value: "Backend-first product systems" },
    { label: "Backend", value: "Java, Spring Boot, PostgreSQL" },
    { label: "Frontend", value: "React and TypeScript" },
    { label: "Location", value: "Chicago, Illinois" },
  ] satisfies PortfolioFact[],
  shortAbout: [
    "My background is in building software that helps organizations run more effectively, especially tools that reduce administrative overhead and turn manual workflows into maintainable systems.",
    "Before working in tech, I served in the U.S. Marine Corps as a diesel mechanic and later became a Corporal. That experience still shapes how I approach engineering: stay calm, stay structured, and build for real-world reliability.",
  ],
  aboutParagraphs: [
    "I enjoy building software that is grounded in actual use cases rather than demo-only ideas. A lot of my work starts with a real operational need, then grows into a more durable system with proper backend structure, better UI, and cleaner deployment practices.",
    "Today I work closely with high school students as a program coordinator and mentor in Chicago. Alongside that work, I build software systems that support program operations, content publishing, workflow automation, and public-facing web experiences.",
    "I work comfortably across the stack, from backend services and data models to frontend interfaces and deployment concerns. The common thread is practical software that is readable, maintainable, and useful to the people relying on it.",
  ],
  strengths: [
    "Designing full-stack web applications around real operational workflows",
    "Building Java and Spring Boot APIs with clear domain structure",
    "Creating React interfaces that are straightforward, responsive, and maintainable",
    "Modeling relational data and application flows for long-term product growth",
    "Shipping software iteratively without losing architectural clarity",
  ],
  stackGroups: [
    {
      label: "Backend",
      items: ["Java", "Spring Boot", "REST APIs", "Session and auth flows"],
    },
    {
      label: "Frontend",
      items: ["React", "TypeScript", "Tailwind CSS", "Responsive UI systems"],
    },
    {
      label: "Data",
      items: ["PostgreSQL", "Relational modeling", "Content structures", "Query design"],
    },
    {
      label: "Cloud and delivery",
      items: ["Google Cloud Run", "Deployment", "Production debugging", "Operational iteration"],
    },
  ] satisfies PortfolioStackGroup[],
  resumeUrl: "/assets/documents/Edwin_Munoz_CV2026.pdf",
  resources: [
    { label: "Email", href: "mailto:ioemunoz8@gmail.com" },
    { label: "GitHub", href: "https://github.com/emunoz8", external: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/edwinmunoz9/", external: true },
    { label: "Resume PDF", href: "/assets/documents/Edwin_Munoz_CV2026.pdf" },
  ] satisfies PortfolioResourceLink[],
};
