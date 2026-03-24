import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MarkdownRenderer from "../components/helpers/MarkdownRenderer";
import { type ContentItem } from "../lib/api";
import { contentPlatformService } from "../lib/services/ContentPlatformService";
import { ProjectPreviewFrame } from "../features/portfolio/components/ProjectPreviewFrame";
import { type PortfolioProject, portfolioProjectsBySlug } from "../features/portfolio/data/projects";
import { publishTerminalTelemetry } from "../features/terminalUI/lib/terminalTelemetry";

function buildManagedProjectEndpoint(slug: string) {
  return `/api/contents/slug/${encodeURIComponent(slug)}`;
}

function resolveProjectPresentation(projectUrl: string) {
  const trimmed = projectUrl.trim();
  if (!trimmed) {
    return {
      internalRoute: null as string | null,
      linkHref: null as string | null,
      iframeSrc: null as string | null,
      opensInNewTab: false,
    };
  }

  if (trimmed.startsWith("/")) {
    return {
      internalRoute: trimmed,
      linkHref: trimmed,
      iframeSrc: trimmed,
      opensInNewTab: false,
    };
  }

  if (typeof window === "undefined") {
    return {
      internalRoute: null,
      linkHref: trimmed,
      iframeSrc: trimmed,
      opensInNewTab: /^https?:\/\//i.test(trimmed),
    };
  }

  try {
    const resolved = new URL(trimmed, window.location.origin);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return {
        internalRoute: null,
        linkHref: trimmed,
        iframeSrc: null,
        opensInNewTab: false,
      };
    }

    const href = resolved.toString();
    const sameOrigin = resolved.origin === window.location.origin;

    return {
      internalRoute: sameOrigin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : null,
      linkHref: href,
      iframeSrc: href,
      opensInNewTab: !sameOrigin,
    };
  } catch {
    return {
      internalRoute: null,
      linkHref: trimmed,
      iframeSrc: null,
      opensInNewTab: false,
    };
  }
}

function extractMarkdownListItems(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^([-*+]|\d+\.)\s+/.test(line))
    .map((line) => line.replace(/^([-*+]|\d+\.)\s+/, ""))
    .filter(Boolean);
}

function getMarkdownLead(markdown: string) {
  const firstContentLine = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line !== "" && !/^([-*+]|\d+\.)\s+/.test(line));

  if (!firstContentLine) {
    return "This project entry was published from the admin content workflow.";
  }

  return firstContentLine.replace(/^#{1,6}\s+/, "").replace(/^>\s*/, "");
}

function NotFoundState({ message }: { message: string }) {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl border-t border-brand-line/18 pt-4">
        <p className="portfolio-kicker">Project not found</p>
        <h1 className="portfolio-display-title mt-4">{message}</h1>
        <Link to="/" className="portfolio-button-secondary mt-6">
          Back to home
        </Link>
      </div>
    </div>
  );
}

function PortfolioProjectDetail({ project }: { project: PortfolioProject }) {
  return (
    <div className="space-y-16 py-8 sm:py-10">
      <section className="grid gap-10 border-b border-brand-line/16 pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="max-w-4xl">
          <p className="portfolio-kicker">Project</p>
          <h1 className="portfolio-display-title mt-4">{project.title}</h1>
          <p className="portfolio-display-subtitle mt-4">{project.tagline}</p>
          <p className="mt-6 max-w-4xl portfolio-copy-strong">
            {project.shortDescription}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-muted">
            {project.techStack.map((item) => (
              <span key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {project.liveDemo ? (
              <a
                href={project.liveDemo.href}
                target={project.liveDemo.external ? "_blank" : undefined}
                rel={project.liveDemo.external ? "noreferrer noopener" : undefined}
                className="portfolio-button-primary"
              >
                {project.liveDemo.label}
              </a>
            ) : null}
            <Link to="/" className="portfolio-button-secondary">
              Back to home
            </Link>
          </div>
        </div>

        <aside className="grid gap-6 lg:justify-self-end lg:max-w-sm">
          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Year</p>
            <p className="mt-4 portfolio-copy">{project.year}</p>
          </div>

          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">GitHub</p>
            <div className="mt-4 space-y-3">
              {project.githubLinks.length > 0 ? (
                project.githubLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer noopener" : undefined}
                    className="portfolio-inline-link block"
                  >
                    {item.label}
                  </a>
                ))
              ) : (
                <p className="portfolio-copy">
                  {project.githubNote ?? "No repository link is listed."}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Demo</p>
            <div className="mt-4">
              {project.liveDemo ? (
                <a
                  href={project.liveDemo.href}
                  target={project.liveDemo.external ? "_blank" : undefined}
                  rel={project.liveDemo.external ? "noreferrer noopener" : undefined}
                  className="portfolio-inline-link"
                >
                  {project.liveDemo.label}
                </a>
              ) : (
                <p className="portfolio-copy">No live demo is linked for this project.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section>
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Screenshots</p>
          <h2 className="portfolio-display-title mt-4">Product views</h2>
        </div>
        <div className="mt-6 grid gap-x-8 gap-y-10 xl:grid-cols-2">
          {project.previews.map((preview) => (
            <ProjectPreviewFrame key={`${project.slug}-${preview.title}`} preview={preview} />
          ))}
        </div>
      </section>

      <div className="portfolio-section-divider" />

      <section className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
        <article className="max-w-3xl">
          <p className="portfolio-kicker">Overview</p>
          <h2 className="portfolio-display-title mt-4">What the project does</h2>
          <div className="mt-6 space-y-5 border-t border-brand-line/16 pt-5">
            {project.description.map((paragraph) => (
              <p key={paragraph} className="portfolio-copy">{paragraph}</p>
            ))}
          </div>
        </article>

        <article>
          <p className="portfolio-kicker">Features</p>
          <h2 className="portfolio-display-title mt-4">Key implementation details</h2>
          <ul className="mt-6 space-y-4 border-t border-brand-line/16 pt-5">
            {project.features.map((feature) => (
              <li key={feature} className="portfolio-copy">
                {feature}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

function ManagedProjectDetail({ project }: { project: ContentItem }) {
  const projectUrl = project.projectUrl?.trim() ?? "";
  const preview = resolveProjectPresentation(projectUrl);
  const featureList = useMemo(() => extractMarkdownListItems(project.description ?? ""), [project.description]);
  const lead = getMarkdownLead(project.description ?? "");
  const createdAtLabel = new Date(project.createdAt).toLocaleDateString();
  const createdYear = new Date(project.createdAt).getFullYear();
  const apiPath = buildManagedProjectEndpoint(project.slug);

  return (
    <div className="space-y-16 py-8 sm:py-10">
      <section className="grid gap-10 border-b border-brand-line/16 pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="max-w-4xl">
          <p className="portfolio-kicker">Live API Project</p>
          <h1 className="portfolio-display-title mt-4">{project.title}</h1>
          <p className="portfolio-display-subtitle mt-4">
            Loaded by slug from the backend content service and rendered through the public project shell.
          </p>
          <p className="mt-6 max-w-4xl portfolio-copy-strong">{lead}</p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-muted">
            <span>source :: database</span>
            <span>{`slug :: ${project.slug}`}</span>
            <span>{Number.isFinite(createdYear) ? `published :: ${createdYear}` : "published"}</span>
            {projectUrl ? <span>demo :: linked</span> : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {preview.internalRoute ? (
              <Link to={preview.internalRoute} className="portfolio-button-primary">
                Open live demo
              </Link>
            ) : preview.linkHref ? (
              <a
                href={preview.linkHref}
                target={preview.opensInNewTab ? "_blank" : undefined}
                rel={preview.opensInNewTab ? "noreferrer noopener" : undefined}
                className="portfolio-button-primary"
              >
                Open live demo
              </a>
            ) : null}
            <Link to="/" className="portfolio-button-secondary">
              Back to home
            </Link>
          </div>
        </div>

        <aside className="grid gap-6 lg:justify-self-end lg:max-w-sm">
          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Published</p>
            <p className="mt-4 portfolio-copy">{createdAtLabel}</p>
          </div>

          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Source</p>
            <p className="mt-4 portfolio-copy">Backend API + database content store</p>
          </div>

          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Endpoint</p>
            <p className="mt-4 break-all portfolio-mono-detail">{apiPath}</p>
          </div>

          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Demo</p>
            <div className="mt-4">
              {preview.linkHref ? (
                <a
                  href={preview.linkHref}
                  target={preview.opensInNewTab ? "_blank" : undefined}
                  rel={preview.opensInNewTab ? "noreferrer noopener" : undefined}
                  className="portfolio-inline-link"
                >
                  {projectUrl}
                </a>
              ) : (
                <p className="portfolio-copy">No live demo URL is linked for this project.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section>
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Preview</p>
          <h2 className="portfolio-display-title mt-4">Available project surface</h2>
        </div>
        <div className="mt-6">
          {preview.iframeSrc ? (
            <article className="border-t border-brand-line/18 pt-4">
              <div className="overflow-hidden rounded-[1.75rem] border border-brand-line/16 bg-brand-surface/40">
                <iframe
                  title={project.title}
                  src={preview.iframeSrc}
                  className="h-[24rem] w-full border-0 bg-white"
                  loading="lazy"
                />
              </div>
              <p className="mt-4 break-all portfolio-mono-detail">{preview.iframeSrc}</p>
            </article>
          ) : (
            <article className="border-t border-brand-line/18 pt-4">
              <p className="portfolio-copy">
                This project entry does not include a screenshot or embeddable preview. If you add a live route or
                external demo URL, the detail page will surface it here automatically.
              </p>
            </article>
          )}
        </div>
      </section>

      <div className="portfolio-section-divider" />

      <section className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
        <article className="max-w-3xl">
          <p className="portfolio-kicker">Overview</p>
          <h2 className="portfolio-display-title mt-4">What the project does</h2>
          <div className="mt-6 border-t border-brand-line/16 pt-5">
            {project.description?.trim() ? (
              <MarkdownRenderer content={project.description} />
            ) : (
              <p className="portfolio-copy">
                No markdown description has been published for this project yet.
              </p>
            )}
          </div>
        </article>

        <article>
          <p className="portfolio-kicker">Highlights</p>
          <h2 className="portfolio-display-title mt-4">Published details</h2>
          <div className="mt-6 border-t border-brand-line/16 pt-5">
            {featureList.length > 0 ? (
              <ul className="space-y-4">
                {featureList.map((feature) => (
                  <li key={feature} className="portfolio-copy">
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="portfolio-copy">
                This project entry does not currently include a structured feature list. The admin form stores title,
                slug, description, project URL, and category data.
              </p>
            )}
          </div>
        </article>
      </section>

      <div className="portfolio-section-divider" />

      <section>
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Backend Model</p>
          <h2 className="portfolio-display-title mt-4">How this project is loaded</h2>
          <p className="mt-6 max-w-4xl portfolio-copy">
            This project is served from the backend by slug through the public content API. The current admin schema
            publishes core project content, but it does not yet store dedicated screenshots or structured tech stack
            fields, which is why some richer presentation details still live in the handcrafted case-study
            entries.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-brand-line/16 pt-5 text-sm text-brand-muted">
          <span>{`GET ${apiPath}`}</span>
          <span>{`slug :: ${project.slug}`}</span>
          <span>rendered :: public project shell</span>
        </div>
      </section>
    </div>
  );
}

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const staticProject = id ? portfolioProjectsBySlug[id] : null;
  const [managedProject, setManagedProject] = useState<ContentItem | null>(null);
  const [managedProjectLoading, setManagedProjectLoading] = useState(false);
  const [managedProjectError, setManagedProjectError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || staticProject) {
      setManagedProject(null);
      setManagedProjectError(null);
      setManagedProjectLoading(false);
      return;
    }

    const slug = id;
    let cancelled = false;
    const controller = new AbortController();

    async function loadManagedProject() {
      try {
        setManagedProjectLoading(true);
        setManagedProjectError(null);
        publishTerminalTelemetry({
          tone: "info",
          lines: [
            `backend :: resolving project slug :: ${slug}`,
            `backend :: GET ${buildManagedProjectEndpoint(slug)}`,
          ],
        });

        const content = await contentPlatformService.getContentBySlug(slug, controller.signal);
        if (!cancelled) {
          if (content.type !== "PROJECT") {
            setManagedProject(null);
            setManagedProjectError("This content entry is not a project.");
            publishTerminalTelemetry({
              tone: "error",
              lines: [`backend :: slug ${slug} resolved to non-project content`],
            });
            return;
          }

          setManagedProject(content);
          publishTerminalTelemetry({
            tone: "success",
            lines: [`backend :: loaded project :: ${content.title}`],
          });
        }
      } catch (err) {
        if (!cancelled && (err as Error).name !== "AbortError") {
          setManagedProject(null);
          setManagedProjectError((err as Error).message);
          publishTerminalTelemetry({
            tone: "error",
            lines: [`backend :: project lookup failed :: ${(err as Error).message}`],
          });
        }
      } finally {
        if (!cancelled) {
          setManagedProjectLoading(false);
        }
      }
    }

    void loadManagedProject();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, staticProject]);

  if (!id) {
    return <NotFoundState message="This project does not exist." />;
  }

  if (staticProject) {
    return <PortfolioProjectDetail project={staticProject} />;
  }

  if (managedProjectLoading) {
    return (
      <div className="py-12 sm:py-16">
        <div className="max-w-3xl border-t border-brand-line/18 pt-4">
          <p className="portfolio-kicker">Project</p>
          <h1 className="portfolio-display-title mt-4">Loading project...</h1>
        </div>
      </div>
    );
  }

  if (managedProjectError || !managedProject) {
    return <NotFoundState message={managedProjectError ?? "This project does not exist."} />;
  }

  return <ManagedProjectDetail project={managedProject} />;
}

export default ProjectDetail;
