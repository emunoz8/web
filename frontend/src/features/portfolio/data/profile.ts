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
];

export const portfolioProfile = {
  name: "Edwin Munoz",
  title: "Software Engineer | MBA Candidate, Business Analytics",
  techStackLine: "Software Engineering | Business Analytics | Data Systems | Leadership",
  techHighlights: [
    { label: "Engineering", value: "Java, Spring Boot, React, TypeScript" },
    { label: "Business", value: "MBA in progress, Business Analytics (UIC)" },
    { label: "Data", value: "Relational modeling and operational reporting" },
    { label: "Leadership", value: "U.S. Marine Corps and program coordination" },
  ] satisfies PortfolioTechHighlight[],
  location: "Chicago, Illinois",
  summary:
    "I connect software engineering with business analytics and operational leadership — building systems that solve real organizational problems, then evaluating their impact the way a business leader would.",
  heroFacts: [
    { label: "Focus", value: "Engineering + business analytics" },
    { label: "Education", value: "B.S. Computer Science; MBA in progress" },
    { label: "Background", value: "Software, data systems, Marine Corps leadership" },
    { label: "Location", value: "Chicago, Illinois" },
  ] satisfies PortfolioFact[],
  shortAbout: [
    "Hi, I'm Edwin Muñoz — a software engineer and MBA candidate based in Chicago. I hold a B.S. in Computer Science from Northeastern Illinois University and I'm pursuing an MBA in Business Analytics at the University of Illinois Chicago, and I build software and data systems that solve real operational problems.",
    "Before software, I served as a Corporal in the U.S. Marine Corps, where I supervised a small maintenance team and learned to lead under pressure. Today I combine that leadership background with hands-on software and data work, including the attendance, session, and outcomes tracking systems I built for Options for Youth, a Chicago youth-development program where I also serve as a program coordinator and mentor.",
  ],
  aboutParagraphs: [
    "I enjoy building software that is grounded in actual use cases rather than demo-only ideas. A lot of my work starts with a real operational need, then grows into a more durable system with proper backend structure, better UI, and cleaner deployment practices.",
    "Today I work closely with high school students as a program coordinator and mentor in Chicago. Alongside that work, I build software and data systems that support program operations, workflow automation, and public-facing web experiences — and I'm pursuing an MBA in Business Analytics at UIC to connect that technical work more directly to business strategy and decision-making.",
    "I work comfortably across the stack, from backend services and data models to frontend interfaces and deployment concerns, and I bring a leadership mindset from the Marine Corps to how I plan and execute that work. The common thread is practical software that is readable, maintainable, and useful to the people and organizations relying on it.",
  ],
  strengths: [
    "Translating organizational needs into technical and data solutions",
    "Designing full-stack web applications around real operational workflows",
    "Building Java and Spring Boot APIs with clear domain structure",
    "Applying business analytics and data-driven thinking to engineering decisions",
    "Leading teams and operations under pressure, from military service to program coordination",
    "Shipping software iteratively without losing architectural clarity",
  ],
  stackGroups: [
    {
      label: "Business and analytics",
      items: ["MBA, Business Analytics (in progress)", "Data-driven decision making", "Process improvement", "Stakeholder translation"],
    },
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
      label: "Leadership",
      items: ["U.S. Marine Corps (Corporal)", "Program coordination", "Team supervision", "Operational reliability"],
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
