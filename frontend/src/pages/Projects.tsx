import { ProjectCard } from "../features/portfolio/components/ProjectCard";
import { featuredPortfolioProjects, portfolioProjects } from "../features/portfolio/data/projects";

function Projects() {
  const additionalProjects = portfolioProjects.filter((project) => !project.featured);

  return (
    <div className="space-y-12 py-8 sm:py-10">
      <section className="portfolio-page-intro">
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Projects</p>
          <h1 className="portfolio-display-title mt-3">Selected work</h1>
          <p className="mt-4 portfolio-copy">
            A small set of case studies showing how I connect software engineering with operational and
            business problem-solving.
          </p>
        </div>
      </section>

      <section>
        <p className="portfolio-kicker">Featured</p>
        <div className="mt-6 grid gap-x-8 gap-y-10 lg:grid-cols-2">
          {featuredPortfolioProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} showPreview={false} showTypeTag={false} />
          ))}
        </div>
      </section>

      {additionalProjects.length > 0 ? (
        <section>
          <p className="portfolio-kicker">Additional work</p>
          <div className="mt-6 grid gap-x-8 gap-y-10 lg:grid-cols-2">
            {additionalProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} showPreview={false} showTypeTag={false} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default Projects;
