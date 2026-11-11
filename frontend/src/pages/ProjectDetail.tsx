import { Link, useParams } from "react-router-dom";
import { ProjectPreviewFrame } from "../features/portfolio/components/ProjectPreviewFrame";
import { type PortfolioProject, portfolioProjectsBySlug } from "../features/portfolio/data/projects";

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

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const staticProject = id ? portfolioProjectsBySlug[id] : null;

  if (!id || !staticProject) {
    return <NotFoundState message="This project does not exist." />;
  }

  return <PortfolioProjectDetail project={staticProject} />;
}

export default ProjectDetail;
