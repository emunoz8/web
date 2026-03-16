import { Link } from "react-router-dom";
import { ProjectCard } from "../../portfolio/components/ProjectCard";
import { featuredPortfolioProjects } from "../../portfolio/data/projects";
import { portfolioProfile } from "../../portfolio/data/profile";
import StandardHomeStory from "./StandardHomeStory";

function StandardHome() {
  return (
    <div className="space-y-16 py-6 sm:py-8">
      <section className="grid gap-10 border-b border-brand-line/16 pb-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:items-start">
        <div className="max-w-4xl">
          <p className="portfolio-kicker">Portfolio</p>
          <h1 className="portfolio-display-hero mt-5 max-w-5xl">
            Full-stack software engineering with a product and systems mindset
          </h1>
          <p className="mt-8 max-w-3xl portfolio-copy-strong">{portfolioProfile.summary}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/projects" className="portfolio-button-primary">
              View projects
            </Link>
            <Link to="/about" className="portfolio-button-secondary">
              About me
            </Link>
          </div>
        </div>

        <aside className="grid gap-8 lg:justify-self-end lg:max-w-md">
          <div className="overflow-hidden rounded-[1.75rem] border border-brand-line/14 bg-white/35">
            <img
              src="/assets/images/me_web.png"
              alt="Edwin Munoz working on a laptop"
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          <div className="grid gap-6">
            <div className="border-t border-brand-line/20 pt-4">
              <p className="portfolio-kicker">Location</p>
              <p className="portfolio-display-subtitle mt-4">{portfolioProfile.location}</p>
              <p className="mt-3 portfolio-copy">
                Backend-first product engineering with React, TypeScript, Java, and Spring Boot.
              </p>
            </div>

            <div className="border-t border-brand-line/20 pt-4">
              <p className="portfolio-kicker">Current Focus</p>
              <p className="mt-4 portfolio-copy">
                Shipping production-ready APIs and frontend surfaces that feel deliberate, maintainable, and fast.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 border-b border-brand-line/16 pb-12 sm:grid-cols-2 xl:grid-cols-4">
        {portfolioProfile.heroFacts.map((fact) => (
          <article key={fact.label} className="border-t border-brand-line/18 pt-4">
            <p className="portfolio-fact-label">{fact.label}</p>
            <p className="portfolio-fact-value">{fact.value}</p>
          </article>
        ))}
      </section>

      <StandardHomeStory />

      <section className="pt-1">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="portfolio-kicker">Featured Work</p>
            <h2 className="portfolio-display-title mt-4">Selected projects</h2>
            <p className="mt-4 portfolio-copy">
              Flagship case studies and product builds presented with a lighter, more editorial surface.
            </p>
          </div>
          <Link to="/projects" className="portfolio-inline-link">
            See all projects
          </Link>
        </div>

        <div className="mt-6 grid gap-x-6 gap-y-10 lg:grid-cols-2 xl:grid-cols-3">
          {featuredPortfolioProjects.slice(0, 3).map((project) => (
            <ProjectCard key={project.slug} project={project} showPreview={false} showTypeTag={false} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default StandardHome;
