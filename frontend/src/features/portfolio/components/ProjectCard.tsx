import { Link } from "react-router-dom";
import { HiArrowUpRight } from "react-icons/hi2";
import type { PortfolioProject, ProjectPreview } from "../data/projects";

type ProjectCardProps = {
  project: PortfolioProject;
  showPreview?: boolean;
  showDescription?: boolean;
  showTechStack?: boolean;
  showTypeTag?: boolean;
};

function renderPreview(preview: ProjectPreview | undefined, project: PortfolioProject) {
  if (!preview) {
    return (
      <div className="flex h-56 items-end bg-brand-hero px-5 py-5">
        <div>
          <p className="portfolio-kicker">Project</p>
          <p className="portfolio-display-subtitle mt-3">{project.title}</p>
        </div>
      </div>
    );
  }

  if (preview.kind === "image") {
    return (
      <img
        src={preview.src}
        alt={preview.alt}
        className="h-56 w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-56 items-end bg-brand-hero px-5 py-5">
      <div>
        <p className="portfolio-kicker">Live Demo</p>
        <p className="portfolio-display-subtitle mt-3">{preview.title}</p>
        <p className="mt-2 portfolio-copy">{preview.caption}</p>
      </div>
    </div>
  );
}

export function ProjectCard({
  project,
  showPreview = true,
  showDescription = true,
  showTechStack = true,
  showTypeTag = true,
}: ProjectCardProps) {
  const preview = project.previews[0];
  const visibleTechStack = project.techStack.slice(0, 3);
  const hiddenTechCount = Math.max(0, project.techStack.length - visibleTechStack.length);

  return (
    <article className="group flex h-full flex-col border-t border-brand-line/18 pt-4 transition-colors duration-200">
      {showPreview ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-brand-line/16 bg-brand-surface/40 transition-colors duration-200 group-hover:border-brand-frame/28">
          {renderPreview(preview, project)}
        </div>
      ) : null}

      <div className={`flex h-full flex-col ${showPreview ? "pt-5" : "pt-2"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="portfolio-kicker">{project.year}</p>
            <h3 className="portfolio-display-subtitle mt-3">{project.title}</h3>
          </div>
          {showTypeTag ? <span className="portfolio-chip">Case Study</span> : null}
        </div>
        <p className="mt-3 portfolio-copy">{project.tagline}</p>

        {showDescription ? <p className="mt-4 flex-1 portfolio-copy">{project.shortDescription}</p> : null}

        {showTechStack ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {visibleTechStack.map((item) => (
              <span key={item} className="portfolio-chip">
                {item}
              </span>
            ))}
            {hiddenTechCount > 0 ? <span className="portfolio-chip">{`+${hiddenTechCount} more`}</span> : null}
          </div>
        ) : null}

        <Link
          to={`/projects/${project.slug}`}
          className={`portfolio-inline-link ${showDescription || showTechStack ? "mt-5" : "mt-4"}`}
        >
          View project
          <HiArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
