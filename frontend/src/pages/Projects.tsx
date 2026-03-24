import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowUpRight } from "react-icons/hi2";
import { type ContentItem } from "../lib/api";
import { contentPlatformService } from "../lib/services/ContentPlatformService";
import { portfolioProjects } from "../features/portfolio/data/projects";
import { publishTerminalTelemetry } from "../features/terminalUI/lib/terminalTelemetry";

const STATIC_PROJECT_SLUGS = new Set(portfolioProjects.map((project) => project.slug));

function getProjectExcerpt(project: ContentItem) {
  const description = project.description?.trim() ?? "";
  if (!description) {
    return "No additional project summary has been published for this entry yet.";
  }

  return description.length > 220 ? `${description.slice(0, 217)}...` : description;
}

function isInternalProjectUrl(projectUrl: string | null | undefined) {
  const trimmed = projectUrl?.trim() ?? "";
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  try {
    const resolved = new URL(trimmed, window.location.origin);
    return resolved.origin === window.location.origin;
  } catch {
    return false;
  }
}

function normalizeInternalProjectUrl(projectUrl: string) {
  if (projectUrl.startsWith("/")) {
    return projectUrl;
  }

  if (typeof window === "undefined") {
    return projectUrl;
  }

  try {
    const resolved = new URL(projectUrl, window.location.origin);
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return projectUrl;
  }
}

function ManagedProjectCard({ project }: { project: ContentItem }) {
  const projectUrl = project.projectUrl?.trim() ?? "";
  const year = new Date(project.createdAt).getFullYear();

  return (
    <article className="flex h-full flex-col border-t border-brand-line/18 pt-4">
      <p className="portfolio-kicker">{Number.isFinite(year) ? String(year) : "Published"}</p>
      <h3 className="portfolio-display-subtitle mt-3">{project.title}</h3>
      <p className="portfolio-mono-detail mt-3">{project.slug}</p>

      <p className="mt-4 flex-1 portfolio-copy">{getProjectExcerpt(project)}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={`/projects/${project.slug}`}
          className="portfolio-inline-link"
        >
          View project
          <HiArrowUpRight className="h-4 w-4" />
        </Link>

        {projectUrl ? (
          isInternalProjectUrl(projectUrl) ? (
            <Link
              to={normalizeInternalProjectUrl(projectUrl)}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition hover:text-brand-contrast"
            >
              Open live demo
              <HiArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <a
              href={projectUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition hover:text-brand-contrast"
            >
              Open live demo
              <HiArrowUpRight className="h-4 w-4" />
            </a>
          )
        ) : null}
      </div>
    </article>
  );
}

function Projects() {
  const [managedProjects, setManagedProjects] = useState<ContentItem[]>([]);
  const [managedProjectsLoading, setManagedProjectsLoading] = useState(true);
  const [managedProjectsError, setManagedProjectsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadManagedProjects() {
      try {
        setManagedProjectsLoading(true);
        setManagedProjectsError(null);
        publishTerminalTelemetry({
          tone: "info",
          lines: ["backend :: GET /api/contents?type=PROJECT&page=0&size=100"],
        });

        const page = await contentPlatformService.listContentsPage({
          type: "PROJECT",
          page: 0,
          size: 100,
          signal: controller.signal,
        });

        if (!cancelled) {
          setManagedProjects(page.content);
          publishTerminalTelemetry({
            tone: "success",
            lines: [
              `backend :: loaded ${page.totalElements} published project entr${page.totalElements === 1 ? "y" : "ies"}`,
            ],
          });
        }
      } catch (err) {
        if (!cancelled && (err as Error).name !== "AbortError") {
          setManagedProjectsError((err as Error).message);
          publishTerminalTelemetry({
            tone: "error",
            lines: [`backend :: project catalog load failed :: ${(err as Error).message}`],
          });
          setManagedProjects([]);
        }
      } finally {
        if (!cancelled) {
          setManagedProjectsLoading(false);
        }
      }
    }

    void loadManagedProjects();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const publishedProjects = useMemo(
    () => managedProjects.filter((project) => !STATIC_PROJECT_SLUGS.has(project.slug)),
    [managedProjects],
  );

  return (
    <div className="space-y-12 py-8 sm:py-10">
      <section className="border-b border-brand-line pb-10">
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Projects</p>
          <h1 className="portfolio-display-title mt-3">Published work</h1>
        </div>
      </section>

      <section>

        {managedProjectsLoading ? (
          <div className="mt-6 border-t border-brand-line/16 pt-6">
            <p className="portfolio-copy">Loading...</p>
          </div>
        ) : null}

        {!managedProjectsLoading && managedProjectsError ? (
          <div className="mt-6 border-t border-brand-line/16 pt-6">
            <p className="text-sm text-red-300">Could not load published projects: {managedProjectsError}</p>
          </div>
        ) : null}

        {!managedProjectsLoading && !managedProjectsError && publishedProjects.length === 0 ? (
          <div className="mt-6 border-t border-brand-line/16 pt-6">
            <p className="portfolio-copy">No published projects yet.</p>
          </div>
        ) : null}

        {!managedProjectsLoading && !managedProjectsError && publishedProjects.length > 0 ? (
          <div className="mt-6 grid gap-x-8 gap-y-10 lg:grid-cols-2">
            {publishedProjects.map((project) => (
              <ManagedProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default Projects;
