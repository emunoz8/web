import { apiBaseUrl, apiUrl, type ContentItem, type CategoryDomain, type CategoryItem } from "../../../lib/api";
import { contentPlatformService } from "../../../lib/services/ContentPlatformService";
import { portfolioProfile } from "./profile";
import { portfolioProjects } from "./projects";

export type TerminalTone = "info" | "success" | "error";

export type TerminalRouteCommand = {
  id: string;
  label: string;
  command: string;
  aliases: string[];
  description: string;
  to: string;
  openInNewTab?: boolean;
};

export type TerminalExternalCommand = {
  id: string;
  label: string;
  command: string;
  aliases: string[];
  description: string;
  href: string;
  openInNewTab: boolean;
};

export type TerminalResolution =
  | {
      kind: "clear";
      canonicalCommand: string;
      lines: string[];
      tone: TerminalTone;
    }
  | {
      kind: "message";
      canonicalCommand: string;
      lines: string[];
      tone: TerminalTone;
    }
  | {
      kind: "route";
      canonicalCommand: string;
      lines: string[];
      tone: TerminalTone;
      to: string;
    }
  | {
      kind: "external";
      canonicalCommand: string;
      lines: string[];
      tone: TerminalTone;
      href: string;
      openInNewTab: boolean;
    };

export type TerminalProjectCommand = {
  slug: string;
  command: string;
  aliases: string[];
  description: string;
  to: string;
};

type TerminalApiCommand = {
  command: string;
  aliases: string[];
  description: string;
};

type TerminalTreeEntry = {
  label: string;
  children?: TerminalTreeEntry[];
};

const terminalRootDirectory = "/srv/portfolio";
const terminalNamedPaths: Record<string, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  resume: "/resume",
  contact: "/contact",
  blog: "/blog",
};
const terminalDirectoryPaths = new Set([
  "/",
  "/about",
  "/projects",
  "/resume",
  "/contact",
  "/blog",
]);

export const terminalShellLabel = "CompilingJava shell :: simulated command surface";

const terminalApiCommands: TerminalApiCommand[] = [
  {
    command: "api status",
    aliases: ["fetch status"],
    description: "Fetch API base configuration and session state.",
  },
  {
    command: "api projects",
    aliases: ["fetch projects"],
    description: "Fetch published project entries from the API.",
  },
  {
    command: "api blogs",
    aliases: ["fetch blogs"],
    description: "Fetch published blog entries from the API.",
  },
  {
    command: "api categories projects",
    aliases: ["fetch categories projects", "api categories project", "fetch categories project"],
    description: "Fetch project categories from the API.",
  },
  {
    command: "api categories blogs",
    aliases: ["fetch categories blogs", "api categories blog", "fetch categories blog"],
    description: "Fetch blog categories from the API.",
  },
  {
    command: "api content <slug>",
    aliases: ["fetch content <slug>", "api project <slug>", "fetch project <slug>", "api blog <slug>", "fetch blog <slug>"],
    description: "Fetch a published content entry by slug.",
  },
];

export const terminalRouteCommands: TerminalRouteCommand[] = [
  {
    id: "home",
    label: "Home",
    command: "cd ~",
    aliases: ["cd /", "home"],
    description: "Return to the root prompt.",
    to: "/",
  },
  {
    id: "about",
    label: "About",
    command: "cd /about",
    aliases: ["about", "open about"],
    description: "Read background, strengths, and experience.",
    to: "/about",
  },
  {
    id: "projects",
    label: "Projects",
    command: "cd /projects",
    aliases: ["projects", "open projects"],
    description: "Inspect featured work and platform builds.",
    to: "/projects",
  },
  {
    id: "resume",
    label: "Resume",
    command: "less resume",
    aliases: ["cd resume", "open resume"],
    description: "Open the resume page.",
    to: "/resume",
  },
  {
    id: "contact",
    label: "Contact",
    command: "cd /contact",
    aliases: ["contact", "mail"],
    description: "Open the contact page.",
    to: "/contact",
  },
  {
    id: "blog",
    label: "Blog",
    command: "cd /blog",
    aliases: ["blog"],
    description: "Open the writing archive.",
    to: "/blog",
  },
  {
    id: "tic-tac-toe",
    label: "TicTacToe",
    command: "./tic-tac-toe",
    aliases: ["tic-tac-toe"],
    description: "Launch the tic-tac-toe feature route.",
    to: "/tic-tac-toe",
    openInNewTab: true,
  },
  {
    id: "add-to-the-aux",
    label: "AddToTheAux",
    command: "./add-to-the-aux",
    aliases: ["add-to-the-aux", "aux"],
    description: "Launch the Add To The AUX feature route.",
    to: "/add-to-the-aux",
    openInNewTab: true,
  },
  {
    id: "jit-cafe",
    label: "JIT Cafe",
    command: "./jit-cafe",
    aliases: ["jit-cafe", "jit cafe"],
    description: "Launch the JIT Cafe feature route.",
    to: "/jit-cafe",
    openInNewTab: true,
  },
];

export const terminalExternalCommands: TerminalExternalCommand[] = [
  {
    id: "github",
    label: "GitHub",
    command: "open github",
    aliases: ["github"],
    description: "Open the GitHub profile.",
    href: "https://github.com/emunoz8",
    openInNewTab: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    command: "open linkedin",
    aliases: ["linkedin"],
    description: "Open the LinkedIn profile.",
    href: "https://www.linkedin.com/in/edwinmunoz9/",
    openInNewTab: true,
  },
  {
    id: "resume-pdf",
    label: "Resume PDF",
    command: "open resume.pdf",
    aliases: ["resume.pdf", "open pdf"],
    description: "Open the PDF resume asset.",
    href: portfolioProfile.resumeUrl,
    openInNewTab: true,
  },
];

export const terminalLsOutput = [
  "about/  projects/  resume/  contact/",
  "blog/  github  linkedin",
  "resume.pdf  tic-tac-toe*  add-to-the-aux*  jit-cafe*",
];

export const terminalProjectCommands: TerminalProjectCommand[] = portfolioProjects.map((project) => ({
  slug: project.slug,
  command: `open ${project.slug}`,
  aliases: [project.slug, `less ${project.slug}`],
  description: `Open the ${project.title} project window.`,
  to: `/projects/${project.slug}`,
}));

export const terminalFeaturedCommands = [
  "cd ~",
  "cd /about",
  "cd /projects",
  "open jit-cafe",
  "open github",
] as const;

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function splitPathSegments(pathname: string): string[] {
  return normalizePathname(pathname).split("/").filter(Boolean);
}

function buildPathFromSegments(segments: string[]): string {
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function isProjectPath(pathname: string): boolean {
  return /^\/projects\/[^/]+$/.test(normalizePathname(pathname));
}

function isSupportedPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);
  return terminalDirectoryPaths.has(normalizedPathname) || isProjectPath(normalizedPathname);
}

function resolveTerminalPath(target: string, currentPath: string): string | null {
  const trimmedTarget = target.trim();
  const normalizedLookupTarget = normalizeTerminalCommand(trimmedTarget);

  if (!trimmedTarget || trimmedTarget === "~") {
    return "/";
  }

  if (normalizedLookupTarget in terminalNamedPaths) {
    return terminalNamedPaths[normalizedLookupTarget];
  }

  if (trimmedTarget === ".") {
    return normalizePathname(currentPath);
  }

  let normalizedTarget = trimmedTarget;

  if (normalizedTarget === "~/portfolio") {
    normalizedTarget = "/";
  } else if (normalizedTarget.startsWith("~/portfolio/")) {
    normalizedTarget = normalizedTarget.slice("~/portfolio".length);
  } else if (normalizedTarget.startsWith("~/")) {
    normalizedTarget = normalizedTarget.slice(1);
  }

  const baseSegments = normalizedTarget.startsWith("/")
    ? []
    : splitPathSegments(currentPath);
  const nextSegments = [...baseSegments];

  for (const segment of normalizedTarget.replace(/^\/+/, "").split("/")) {
    if (!segment || segment === ".") {
      continue;
    }

    if (segment === "..") {
      nextSegments.pop();
      continue;
    }

    nextSegments.push(segment);
  }

  const resolvedPath = buildPathFromSegments(nextSegments);
  return isSupportedPath(resolvedPath) ? resolvedPath : null;
}

export function getTerminalWorkingDirectory(pathname: string): string {
  const normalizedPathname = normalizePathname(pathname);
  return normalizedPathname === "/"
    ? terminalRootDirectory
    : `${terminalRootDirectory}${normalizedPathname}`;
}

export function getTerminalPrompt(pathname: string): string {
  const normalizedPathname = normalizePathname(pathname);
  const locationLabel =
    normalizedPathname === "/" ? "~/portfolio" : `~/portfolio${normalizedPathname}`;
  return `guest@edwin:${locationLabel}$`;
}

function getTerminalDirectoryListing(pathname: string): string[] {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === "/") {
    return terminalLsOutput;
  }

  if (normalizedPathname === "/projects") {
    return terminalProjectCommands.map((command) => `${command.slug}/`);
  }

  if (normalizedPathname === "/about") {
    return [];
  }

  if (normalizedPathname === "/resume") {
    return ["resume.pdf"];
  }

  if (normalizedPathname === "/contact") {
    return ["github  linkedin  resume.pdf"];
  }

  if (normalizedPathname === "/blog") {
    return [];
  }

  if (/^\/projects\/[^/]+$/.test(normalizedPathname)) {
    return [];
  }

  return [];
}

function getTerminalTreeEntries(pathname: string): TerminalTreeEntry[] {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === "/") {
    return [
      { label: "about/" },
      {
        label: "projects/",
        children: terminalProjectCommands.map((command) => ({ label: `${command.slug}/` })),
      },
      {
        label: "resume/",
        children: [{ label: "resume.pdf" }],
      },
      {
        label: "contact/",
        children: [
          { label: "github" },
          { label: "linkedin" },
          { label: "resume.pdf" },
        ],
      },
      { label: "blog/" },
      { label: "github" },
      { label: "linkedin" },
      { label: "resume.pdf" },
      { label: "tic-tac-toe*" },
      { label: "add-to-the-aux*" },
      { label: "jit-cafe*" },
    ];
  }

  if (normalizedPathname === "/projects") {
    return terminalProjectCommands.map((command) => ({ label: `${command.slug}/` }));
  }

  if (normalizedPathname === "/resume") {
    return [{ label: "resume.pdf" }];
  }

  if (normalizedPathname === "/contact") {
    return [
      { label: "github" },
      { label: "linkedin" },
      { label: "resume.pdf" },
    ];
  }

  return [];
}

function buildTreeBranchLines(entries: TerminalTreeEntry[], prefix = ""): string[] {
  return entries.flatMap((entry, index) => {
    const isLast = index === entries.length - 1;
    const branchPrefix = `${prefix}${isLast ? "`-- " : "|-- "}`;
    const nextPrefix = `${prefix}${isLast ? "    " : "|   "}`;
    const lines = [`${branchPrefix}${entry.label}`];

    if (entry.children && entry.children.length > 0) {
      lines.push(...buildTreeBranchLines(entry.children, nextPrefix));
    }

    return lines;
  });
}

function getTerminalTreeLines(pathname: string): string[] {
  const normalizedPathname = normalizePathname(pathname);
  const header = getTerminalWorkingDirectory(normalizedPathname);
  const entries = getTerminalTreeEntries(normalizedPathname);

  if (entries.length === 0) {
    return [header];
  }

  return [header, ...buildTreeBranchLines(entries)];
}

function normalizeTerminalCommand(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function getApiBaseLabel(): string {
  return apiBaseUrl || "(same origin / configured proxy)";
}

function formatTimestamp(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function summarizeText(value: string | undefined, maxLength = 96): string | null {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";

  if (!normalized) {
    return null;
  }

  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 3)}...`;
}

function formatContentListLines(label: string, items: ContentItem[], totalElements?: number): string[] {
  const total = typeof totalElements === "number" ? totalElements : items.length;

  if (items.length === 0) {
    return [`${label} :: 0 entries`];
  }

  const visibleItems = items.slice(0, 5);
  const lines = [
    `${label} :: ${total} entr${total === 1 ? "y" : "ies"}`,
    ...visibleItems.map((item) => `${item.slug} :: ${item.title}`),
  ];

  if (total > visibleItems.length) {
    lines.push(`... ${total - visibleItems.length} more`);
  }

  return lines;
}

function formatCategoryLines(domain: CategoryDomain, categories: CategoryItem[]): string[] {
  if (categories.length === 0) {
    return [`categories ${domain.toLowerCase()} :: 0 entries`];
  }

  const visibleCategories = categories.slice(0, 8);
  const lines = [
    `categories ${domain.toLowerCase()} :: ${categories.length} entr${categories.length === 1 ? "y" : "ies"}`,
    ...visibleCategories.map((category) => `${category.slug} :: ${category.label}`),
  ];

  if (categories.length > visibleCategories.length) {
    lines.push(`... ${categories.length - visibleCategories.length} more`);
  }

  return lines;
}

function formatContentDetailLines(content: ContentItem): string[] {
  const lines = [
    `slug :: ${content.slug}`,
    `type :: ${content.type.toLowerCase()}`,
    `title :: ${content.title}`,
    `published :: ${formatTimestamp(content.createdAt)}`,
  ];

  const summary = summarizeText(content.description);
  if (summary) {
    lines.push(`summary :: ${summary}`);
  }

  if (content.projectUrl?.trim()) {
    lines.push(`url :: ${content.projectUrl.trim()}`);
  }

  if (content.engagement) {
    lines.push(
      `engagement :: ${content.engagement.likes} likes, ${content.engagement.comments} comments`
    );
  }

  return lines;
}

async function fetchSessionLines(): Promise<{ lines: string[]; tone: TerminalTone }> {
  const response = await fetch(apiUrl("/api/auth/session"), {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401 || response.status === 403) {
    return {
      lines: [
        `base :: ${getApiBaseLabel()}`,
        "session :: guest",
      ],
      tone: "info",
    };
  }

  if (!response.ok) {
    throw new Error(`Could not load session (${response.status}).`);
  }

  const payload = (await response.json()) as {
    username?: unknown;
    email?: unknown;
    roles?: unknown;
  };
  const roles = Array.isArray(payload.roles)
    ? payload.roles.filter((role): role is string => typeof role === "string")
    : [];

  const lines = [
    `base :: ${getApiBaseLabel()}`,
    `session :: ${typeof payload.username === "string" && payload.username.trim() ? payload.username : "authenticated"}`,
  ];

  if (typeof payload.email === "string" && payload.email.trim()) {
    lines.push(`email :: ${payload.email}`);
  }

  lines.push(`roles :: ${roles.length > 0 ? roles.join(", ") : "(none)"}`);

  return {
    lines,
    tone: "success",
  };
}

function findRouteCommand(input: string): TerminalRouteCommand | undefined {
  return terminalRouteCommands.find((command) =>
    [command.command, ...command.aliases].some((candidate) => normalizeTerminalCommand(candidate) === input)
  );
}

function findExternalCommand(input: string): TerminalExternalCommand | undefined {
  return terminalExternalCommands.find((command) =>
    [command.command, ...command.aliases].some((candidate) => normalizeTerminalCommand(candidate) === input)
  );
}

function findProjectCommand(input: string): TerminalProjectCommand | undefined {
  return terminalProjectCommands.find((command) =>
    [command.command, ...command.aliases].some((candidate) => normalizeTerminalCommand(candidate) === input)
  );
}

function findProjectCommandFromTarget(
  target: string,
  currentPath: string
): TerminalProjectCommand | undefined {
  const normalizedTarget = normalizeTerminalCommand(target);
  const directMatch = terminalProjectCommands.find((command) => command.slug === normalizedTarget);

  if (directMatch) {
    return directMatch;
  }

  const resolvedPath = resolveTerminalPath(target, currentPath);

  if (!resolvedPath || !isProjectPath(resolvedPath)) {
    return undefined;
  }

  return terminalProjectCommands.find((command) => command.to === resolvedPath);
}

function resolveProjectPathFromTarget(target: string, currentPath: string): string | null {
  const resolvedPath = resolveTerminalPath(target, currentPath);

  if (resolvedPath && isProjectPath(resolvedPath)) {
    return resolvedPath;
  }

  return null;
}

function formatHelpEntries(
  entries: Array<{ command: string; description: string }>
): string[] {
  return entries.flatMap((entry) => [
    `  ${entry.command}`,
    `    ${entry.description}`,
  ]);
}

function buildHelpLines(): string[] {
  const builtInEntries = [
    { command: "help", description: "Show the supported command set." },
    { command: "ls [path]", description: "List the available sections and links." },
    { command: "tree [path]", description: "Print the virtual route tree from the current path." },
    { command: "pwd", description: "Print the current working directory." },
    { command: "cd [path]", description: "Change directories using relative or absolute paths." },
    { command: "cd ..", description: "Move to the parent directory." },
    { command: "cd ../..", description: "Move up multiple directory levels." },
    { command: "whoami", description: "Print the operator profile." },
    { command: "cat summary", description: "Print the short portfolio summary." },
    { command: "cat stack", description: "Print the current technology stack." },
    { command: "clear", description: "Reset the terminal session output." },
  ];

  const builtIns = [
    "Simulated shell:",
    "  This terminal routes commands inside the portfolio UI. It is not a real bash process.",
    "",
    "Built-ins:",
    ...formatHelpEntries(builtInEntries),
  ];

  const navigationEntries = [
    { command: "cd /", description: "Jump to the terminal root." },
    { command: "tree /", description: "Print the full portfolio route map." },
    { command: "cd /projects", description: "Open the projects directory from anywhere." },
    { command: "cd ./contact", description: "Resolve from the current directory." },
    { command: "cd ../../about", description: "Chain parent-directory traversal." },
    ...terminalRouteCommands.map((command) => ({
      command: command.command,
      description: command.description,
    })),
  ];

  const navigation = [
    "Navigation:",
    ...formatHelpEntries(navigationEntries),
  ];

  const resourceEntries = [
    ...terminalExternalCommands.map((command) => ({
      command: command.command,
      description: command.description,
    })),
    { command: "login", description: "Open the login route." },
    { command: "logout", description: "Close the active session." },
    { command: "admin", description: "Open admin projects when authorized." },
    { command: "sudo hire-edwin", description: "Jump straight to contact." },
  ];

  const resources = [
    "Resources:",
    ...formatHelpEntries(resourceEntries),
  ];

  const apiEntries = terminalApiCommands.map((command) => ({
    command: command.command,
    description: command.description,
  }));

  const api = [
    "API:",
    ...formatHelpEntries(apiEntries),
  ];

  const keyboardEntries = [
    { command: "/", description: "Focus the terminal prompt." },
    { command: "Ctrl+K / Cmd+K", description: "Focus and select the prompt input." },
    { command: "?", description: "Run help from anywhere outside an input." },
    { command: "Esc", description: "Clear the current prompt input." },
    { command: "Shift+Esc", description: "Clear the terminal output." },
    { command: "Alt+Up", description: "Run cd .." },
  ];

  const keyboard = [
    "Keyboard:",
    ...formatHelpEntries(keyboardEntries),
  ];

  const projectEntries = [
    ...terminalProjectCommands.map((command) => ({
      command: command.command,
      description: command.description,
    })),
    { command: "open jit-cafe", description: "Open a project by slug." },
    {
      command: "open /projects/jit-cafe",
      description: "Open a project by absolute path.",
    },
  ];

  const projects = [
    "Projects:",
    ...formatHelpEntries(projectEntries),
  ];

  return [...builtIns, "", ...navigation, "", ...resources, "", ...api, "", ...keyboard, "", ...projects];
}

export const buildInitialTerminalHistory = (): Array<{ type: TerminalTone | "command"; text: string }> => [
  {
    type: "info",
    text: "CompilingJava Portfolio Shell v2.6.0 ready.",
  },
  {
    type: "info",
    text: `Operator: ${portfolioProfile.name} :: ${portfolioProfile.title}`,
  },
  {
    type: "info",
    text: `Workspace: ${terminalRootDirectory}`,
  },
  {
    type: "info",
    text: "Mode: simulated terminal router, not a real bash instance.",
  },
];

export async function resolveTerminalApiCommand(rawInput: string): Promise<TerminalResolution | null> {
  const normalizedInput = normalizeTerminalCommand(rawInput);

  if (!normalizedInput.startsWith("api ") && !normalizedInput.startsWith("fetch ")) {
    return null;
  }

  try {
    if (normalizedInput === "api status" || normalizedInput === "fetch status") {
      const result = await fetchSessionLines();

      return {
        kind: "message",
        canonicalCommand: "api status",
        lines: result.lines,
        tone: result.tone,
      };
    }

    if (normalizedInput === "api projects" || normalizedInput === "fetch projects") {
      const page = await contentPlatformService.listContentsPage({
        type: "PROJECT",
        page: 0,
        size: 5,
      });

      return {
        kind: "message",
        canonicalCommand: "api projects",
        lines: formatContentListLines("projects", page.content, page.totalElements),
        tone: "info",
      };
    }

    if (normalizedInput === "api blogs" || normalizedInput === "fetch blogs") {
      const page = await contentPlatformService.listContentsPage({
        type: "BLOG",
        page: 0,
        size: 5,
      });

      return {
        kind: "message",
        canonicalCommand: "api blogs",
        lines: formatContentListLines("blogs", page.content, page.totalElements),
        tone: "info",
      };
    }

    if (
      normalizedInput === "api categories projects" ||
      normalizedInput === "fetch categories projects" ||
      normalizedInput === "api categories project" ||
      normalizedInput === "fetch categories project"
    ) {
      const categories = await contentPlatformService.listCategories("PROJECT");

      return {
        kind: "message",
        canonicalCommand: "api categories projects",
        lines: formatCategoryLines("PROJECT", categories),
        tone: "info",
      };
    }

    if (
      normalizedInput === "api categories blogs" ||
      normalizedInput === "fetch categories blogs" ||
      normalizedInput === "api categories blog" ||
      normalizedInput === "fetch categories blog"
    ) {
      const categories = await contentPlatformService.listCategories("BLOG");

      return {
        kind: "message",
        canonicalCommand: "api categories blogs",
        lines: formatCategoryLines("BLOG", categories),
        tone: "info",
      };
    }

    const contentMatch = normalizedInput.match(/^(api|fetch)\s+(content|project|blog)\s+(.+)$/);

    if (contentMatch) {
      const slug = contentMatch[3].trim();

      if (!slug) {
        return {
          kind: "message",
          canonicalCommand: "api content",
          lines: ["api: content slug is required"],
          tone: "error",
        };
      }

      const content = await contentPlatformService.getContentBySlug(slug);

      return {
        kind: "message",
        canonicalCommand: `api content ${content.slug}`,
        lines: formatContentDetailLines(content),
        tone: "success",
      };
    }

    return {
      kind: "message",
      canonicalCommand: normalizedInput,
      lines: [
        "api: unsupported command",
        "try: api status, api projects, api blogs, api categories projects, api categories blogs, api content <slug>",
      ],
      tone: "error",
    };
  } catch (error) {
    return {
      kind: "message",
      canonicalCommand: normalizedInput,
      lines: [`api: ${(error as Error).message}`],
      tone: "error",
    };
  }
}

export function resolveTerminalCommand(rawInput: string, pathname = "/"): TerminalResolution {
  const normalizedInput = normalizeTerminalCommand(rawInput);
  const normalizedPathname = normalizePathname(pathname);
  const trimmedInput = rawInput.trim();

  if (!normalizedInput) {
    return {
      kind: "message",
      canonicalCommand: "",
      lines: ["shell: command required"],
      tone: "error",
    };
  }

  if (normalizedInput === "clear") {
    return {
      kind: "clear",
      canonicalCommand: "clear",
      lines: [],
      tone: "info",
    };
  }

  if (normalizedInput === "help") {
    return {
      kind: "message",
      canonicalCommand: "help",
      lines: buildHelpLines(),
      tone: "info",
    };
  }

  if (normalizedInput === "ls" || normalizedInput.startsWith("ls ")) {
    const lsTarget = trimmedInput.length > 2 ? trimmedInput.slice(2).trim() : "";
    const listingPath = lsTarget ? resolveTerminalPath(lsTarget, normalizedPathname) : normalizedPathname;

    if (!listingPath) {
      return {
        kind: "message",
        canonicalCommand: lsTarget ? `ls ${lsTarget}` : "ls",
        lines: [`ls: cannot access '${lsTarget}': No such file or directory`],
        tone: "error",
      };
    }

    return {
      kind: "message",
      canonicalCommand: lsTarget ? `ls ${lsTarget}` : "ls",
      lines: getTerminalDirectoryListing(listingPath),
      tone: "info",
    };
  }

  if (normalizedInput === "pwd") {
    return {
      kind: "message",
      canonicalCommand: "pwd",
      lines: [getTerminalWorkingDirectory(normalizedPathname)],
      tone: "info",
    };
  }

  if (normalizedInput === "tree" || normalizedInput.startsWith("tree ")) {
    const treeTarget = trimmedInput.length > 4 ? trimmedInput.slice(4).trim() : "";
    const treePath = treeTarget ? resolveTerminalPath(treeTarget, normalizedPathname) : normalizedPathname;

    if (!treePath) {
      return {
        kind: "message",
        canonicalCommand: treeTarget ? `tree ${treeTarget}` : "tree",
        lines: [`tree: cannot access '${treeTarget}': No such file or directory`],
        tone: "error",
      };
    }

    return {
      kind: "message",
      canonicalCommand: treeTarget ? `tree ${treeTarget}` : "tree",
      lines: getTerminalTreeLines(treePath),
      tone: "info",
    };
  }

  if (normalizedInput === "cd" || normalizedInput.startsWith("cd ")) {
    const cdTarget = trimmedInput.length > 2 ? trimmedInput.slice(2).trim() : "~";
    const nextPath = resolveTerminalPath(cdTarget, normalizedPathname);

    if (!nextPath) {
      return {
        kind: "message",
        canonicalCommand: `cd ${cdTarget}`,
        lines: [`shell: cd: ${cdTarget}: unknown route target`],
        tone: "error",
      };
    }

    return {
      kind: "route",
      canonicalCommand: `cd ${cdTarget}`,
      lines: [getTerminalWorkingDirectory(nextPath)],
      tone: "success",
      to: nextPath,
    };
  }

  if (normalizedInput === "whoami") {
    return {
      kind: "message",
      canonicalCommand: "whoami",
      lines: [
        portfolioProfile.name,
        portfolioProfile.title,
        portfolioProfile.location,
      ],
      tone: "success",
    };
  }

  if (normalizedInput === "cat summary" || normalizedInput === "cat about") {
    return {
      kind: "message",
      canonicalCommand: "cat summary",
      lines: [portfolioProfile.summary, ...portfolioProfile.shortAbout],
      tone: "info",
    };
  }

  if (normalizedInput === "cat stack") {
    return {
      kind: "message",
      canonicalCommand: "cat stack",
      lines: portfolioProfile.stackGroups.map(
        (group) => `${group.label}: ${group.items.join(", ")}`
      ),
      tone: "info",
    };
  }

  if (normalizedInput === "sudo hire-edwin") {
    return {
      kind: "route",
      canonicalCommand: "sudo hire-edwin",
      lines: ["Permission granted. Redirecting to /contact."],
      tone: "success",
      to: "/contact",
    };
  }

  const routeCommand = findRouteCommand(normalizedInput);

  if (routeCommand) {
    if (routeCommand.openInNewTab) {
      return {
        kind: "external",
        canonicalCommand: routeCommand.command,
        lines: [`Opening ${routeCommand.label}...`],
        tone: "success",
        href: routeCommand.to,
        openInNewTab: true,
      };
    }

    return {
      kind: "route",
      canonicalCommand: routeCommand.command,
      lines: [`Opening ${routeCommand.label}...`],
      tone: "success",
      to: routeCommand.to,
    };
  }

  const projectCommand = findProjectCommand(normalizedInput);

  if (projectCommand) {
    return {
      kind: "route",
      canonicalCommand: projectCommand.command,
      lines: [`Opening ${projectCommand.slug}...`],
      tone: "success",
      to: projectCommand.to,
    };
  }

  const externalCommand = findExternalCommand(normalizedInput);

  if (externalCommand) {
    return {
      kind: "external",
      canonicalCommand: externalCommand.command,
      lines: [`Opening ${externalCommand.label}...`],
      tone: "success",
      href: externalCommand.href,
      openInNewTab: externalCommand.openInNewTab,
    };
  }

  if (normalizedInput.startsWith("open ")) {
    const openTarget = trimmedInput.slice(5).trim();
    const projectTarget = findProjectCommandFromTarget(openTarget, normalizedPathname);

    if (projectTarget) {
      return {
        kind: "route",
        canonicalCommand: `open ${projectTarget.slug}`,
        lines: [`Opening ${projectTarget.slug}...`],
        tone: "success",
        to: projectTarget.to,
      };
    }

    const dynamicProjectPath = resolveProjectPathFromTarget(openTarget, normalizedPathname);

    if (dynamicProjectPath) {
      const pathSegments = dynamicProjectPath.split("/").filter(Boolean);
      const slug = pathSegments[pathSegments.length - 1] ?? openTarget;

      return {
        kind: "route",
        canonicalCommand: `open ${openTarget}`,
        lines: [`Opening ${slug}...`],
        tone: "success",
        to: dynamicProjectPath,
      };
    }
  }

  return {
    kind: "message",
    canonicalCommand: normalizedInput,
    lines: [`shell: ${normalizedInput}: command not found`],
    tone: "error",
  };
}
