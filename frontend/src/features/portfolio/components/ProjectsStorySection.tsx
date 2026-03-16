import { startTransition, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowUpRight } from "react-icons/hi2";
import { ProjectCard } from "./ProjectCard";
import {
  portfolioProjects,
  type PortfolioProject,
  type ProjectPreview,
} from "../data/projects";

function renderProjectPreviewMedia(
  preview: ProjectPreview | undefined,
  project: PortfolioProject,
  heightClassName = "h-72",
) {
  if (!preview) {
    return (
      <div className={`flex items-end bg-brand-hero px-6 py-6 ${heightClassName}`}>
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
        className={`w-full object-cover ${heightClassName}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`flex items-end bg-brand-hero px-6 py-6 ${heightClassName}`}>
      <div>
        <p className="portfolio-kicker">Live Demo</p>
        <p className="portfolio-display-subtitle mt-3">{preview.title}</p>
        <p className="mt-2 max-w-xl portfolio-copy">{preview.caption}</p>
      </div>
    </div>
  );
}

function ProjectPreviewGallery({ project }: { project: PortfolioProject }) {
  const previews = project.previews.length > 0 ? project.previews : [undefined];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {previews.map((preview, index) => {
        const isFeatureTile = previews.length > 1 && index === 0;

        return (
          <figure
            key={preview?.title ?? `${project.slug}-${index}`}
            className={`overflow-hidden rounded-[1.5rem] border border-brand-line/14 bg-brand-surface/48 ${
              isFeatureTile ? "xl:col-span-2" : ""
            }`}
          >
            <div className="overflow-hidden">
              {renderProjectPreviewMedia(
                preview,
                project,
                isFeatureTile ? "h-80" : "h-56",
              )}
            </div>
            <figcaption className="border-t border-brand-line/14 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="portfolio-display-subtitle">
                  {preview?.title ?? project.title}
                </p>
                <span className="portfolio-chip">{String(index + 1).padStart(2, "0")}</span>
              </div>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href);
}

function ProjectShowcaseActions({ project }: { project: PortfolioProject }) {
  const liveDemo = project.liveDemo;

  return (
    <div className="mt-6 flex flex-wrap gap-3 border-t border-brand-line/14 pt-6">
      <Link to={`/projects/${project.slug}`} className="portfolio-button-primary">
        View project
        <HiArrowUpRight className="h-4 w-4" />
      </Link>

      {liveDemo ? (
        isExternalHref(liveDemo.href) ? (
          <a
            href={liveDemo.href}
            target="_blank"
            rel="noreferrer noopener"
            className="portfolio-button-secondary"
          >
            {liveDemo.label}
            <HiArrowUpRight className="h-4 w-4" />
          </a>
        ) : (
          <Link to={liveDemo.href} className="portfolio-button-secondary">
            {liveDemo.label}
            <HiArrowUpRight className="h-4 w-4" />
          </Link>
        )
      ) : null}
    </div>
  );
}

function ProjectsStorySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const triggers = triggerRefs.current.filter(
      (trigger): trigger is HTMLDivElement => trigger !== null,
    );
    if (triggers.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        if (visibleEntries.length === 0) {
          return;
        }

        const nextIndex = Number(
          visibleEntries[0].target.getAttribute("data-story-index") ?? 0,
        );
        startTransition(() => {
          setActiveIndex((currentIndex) =>
            currentIndex === nextIndex ? currentIndex : nextIndex,
          );
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      },
    );

    triggers.forEach((trigger) => observer.observe(trigger));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="border-b border-brand-line/16 pb-14">
      <div className="max-w-3xl">
        <p className="portfolio-kicker">Projects</p>
        <h2 className="portfolio-display-title mt-4">Featured work</h2>
      </div>

      <div className="mt-8 grid gap-8 lg:hidden">
        {portfolioProjects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            showPreview
            showDescription={false}
            showTechStack={false}
            showTypeTag={false}
          />
        ))}
      </div>

      <div className="mt-10 hidden gap-12 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
        <div className="sticky top-24 self-start">
          <div className="portfolio-panel p-8">
            <div className="flex gap-2" aria-hidden="true">
              {portfolioProjects.map((project, index) => (
                <span
                  key={project.slug}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    index === activeIndex ? "bg-brand-accent/80" : "bg-brand-line/20"
                  }`}
                />
              ))}
            </div>

            <div className="relative mt-8 min-h-[44rem] overflow-hidden">
              {portfolioProjects.map((project, index) => {
                const preview = project.previews[0];
                const stateClassName =
                  index === activeIndex
                    ? "pointer-events-auto z-10 translate-y-0 opacity-100"
                    : index < activeIndex
                      ? "pointer-events-none z-0 -translate-y-12 opacity-0"
                      : "pointer-events-none z-0 translate-y-12 opacity-0";

                return (
                  <article
                    key={project.slug}
                    aria-hidden={index !== activeIndex}
                    className={`absolute inset-0 flex flex-col transition-all duration-500 ease-out motion-reduce:transition-none ${stateClassName}`}
                  >
                    <div className="overflow-hidden rounded-[1.75rem] border border-brand-line/16 bg-brand-surface/42">
                      {renderProjectPreviewMedia(preview, project)}
                    </div>

                    <div className="mt-6">
                      <p className="portfolio-kicker">{project.year}</p>
                      <h3 className="portfolio-display-title mt-3">{project.title}</h3>
                      <p className="mt-4 portfolio-copy-strong">{project.tagline}</p>
                    </div>

                    <ProjectShowcaseActions project={project} />
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          {portfolioProjects.map((project, index) => (
            <div
              key={project.slug}
              ref={(node) => {
                triggerRefs.current[index] = node;
              }}
              data-story-index={index}
              className="flex min-h-[72vh] items-start py-8"
            >
              <article
                className={`w-full overflow-hidden rounded-[1.75rem] border transition-all duration-300 ${
                  index === activeIndex
                    ? "border-brand-frame/28 bg-brand-surface/78"
                    : "border-brand-line/14 bg-brand-surface/42"
                }`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-brand-line/14 px-6 py-5">
                  <div>
                    <p className="portfolio-kicker">{project.year}</p>
                    <h3 className="portfolio-display-subtitle mt-3">{project.title}</h3>
                  </div>
                  <span className="portfolio-chip">{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="p-5">
                  <ProjectPreviewGallery project={project} />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsStorySection;
