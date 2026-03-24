import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowUpRight } from "react-icons/hi2";
import { portfolioProfile } from "../../portfolio/data/profile";
import { portfolioProjects } from "../../portfolio/data/projects";
import { ProjectCard } from "../../portfolio/components/ProjectCard";
import { publishTerminalTelemetry } from "../../terminalUI/lib/terminalTelemetry";
import { type ContentItem } from "../../../lib/api";
import { contentPlatformService } from "../../../lib/services/ContentPlatformService";

const STATIC_PROJECT_SLUGS = new Set(portfolioProjects.map((p) => p.slug));

function getProjectExcerpt(project: ContentItem) {
  const description = project.description?.trim() ?? "";
  if (!description) return "No summary published for this project yet.";
  return description.length > 220 ? `${description.slice(0, 217)}...` : description;
}

function isInternalProjectUrl(url: string) {
  if (url.startsWith("/")) return true;
  if (typeof window === "undefined") return false;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

function normalizeInternalProjectUrl(url: string) {
  if (url.startsWith("/")) return url;
  if (typeof window === "undefined") return url;
  try {
    const resolved = new URL(url, window.location.origin);
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return url;
  }
}

function ApiProjectCard({ project }: { project: ContentItem }) {
  const projectUrl = project.projectUrl?.trim() ?? "";
  const year = new Date(project.createdAt).getFullYear();

  return (
    <article className="home-api-card">
      <p className="portfolio-kicker">{Number.isFinite(year) ? String(year) : "Published"}</p>
      <h3 className="portfolio-display-subtitle mt-3">{project.title}</h3>
      <p className="mt-4 flex-1 portfolio-copy">{getProjectExcerpt(project)}</p>
      <div className="home-api-card-actions">
        <Link to={`/projects/${project.slug}`} className="portfolio-inline-link">
          View project
          <HiArrowUpRight className="h-4 w-4" />
        </Link>
        {projectUrl ? (
          isInternalProjectUrl(projectUrl) ? (
            <Link to={normalizeInternalProjectUrl(projectUrl)} className="home-api-card-demo-link">
              Live demo
              <HiArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <a
              href={projectUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="home-api-card-demo-link"
            >
              Live demo
              <HiArrowUpRight className="h-4 w-4" />
            </a>
          )
        ) : null}
      </div>
    </article>
  );
}

function StandardHome() {
  const [managedProjects, setManagedProjects] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
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
            lines: [`backend :: loaded ${page.totalElements} project entries`],
          });
        }
      } catch (err) {
        if (!cancelled && (err as Error).name !== "AbortError") {
          setError((err as Error).message);
          setManagedProjects([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const projects = useMemo(
    () => managedProjects.filter((p) => !STATIC_PROJECT_SLUGS.has(p.slug)),
    [managedProjects],
  );

  return (
    <div className="home-shell">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="portfolio-kicker">{portfolioProfile.name}</p>
          <h1 className="portfolio-display-hero mt-6">
            Full-stack developer building real applications from backend to frontend.
          </h1>
          <p className="mt-6 portfolio-copy-strong">
            My work starts with Java and Spring Boot APIs, structured data models, and clean architecture, then moves to React frontends built to be simple, fast, and usable.
          </p>

          <div className="home-hero-cta">
            <Link to="/about" className="portfolio-button-primary">
              About me
            </Link>
            <Link to="/contact" className="portfolio-button-secondary">
              Contact
            </Link>
          </div>
        </div>

        <aside className="home-hero-aside">
          <div className="home-hero-photo">
            <img
              src="/assets/images/me_web.png"
              alt="Edwin Munoz working on a laptop"
              className="home-hero-photo-img"
            />
          </div>

          <div className="home-hero-stats">
            <div className="home-stat">
              <p className="portfolio-kicker">Location</p>
              <p className="mt-2 portfolio-copy">{portfolioProfile.location}</p>
            </div>
            <div className="home-stat">
              <p className="portfolio-kicker">Stack</p>
              <p className="mt-2 portfolio-copy">{portfolioProfile.techStackLine}</p>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <p className="portfolio-kicker">Work</p>
        <h2 className="portfolio-display-title mt-3">Projects</h2>

        <div className="home-projects-grid">
          {portfolioProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} showPreview={false} showTypeTag={false} />
          ))}

          {!loading && !error && projects.map((project) => (
            <ApiProjectCard key={project.id} project={project} />
          ))}
        </div>

        {loading ? (
          <p className="mt-6 portfolio-copy">Loading...</p>
        ) : null}

        {!loading && error ? (
          <p className="home-projects-error">Could not load projects: {error}</p>
        ) : null}
      </section>
    </div>
  );
}

export default StandardHome;
