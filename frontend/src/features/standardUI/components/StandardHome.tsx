import { Link } from "react-router-dom";
import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin } from "react-icons/fa";
import { portfolioProfile } from "../../portfolio/data/profile";
import { featuredPortfolioWorkExperience, portfolioEducation } from "../../portfolio/data/experience";
import { featuredPortfolioProjects } from "../../portfolio/data/projects";
import { ProjectCard } from "../../portfolio/components/ProjectCard";

function getResourceIcon(label: string) {
  if (label === "Email") {
    return <FaEnvelope className="h-8 w-8" aria-hidden="true" />;
  }
  if (label === "GitHub") {
    return <FaGithub className="h-8 w-8" aria-hidden="true" />;
  }
  if (label === "LinkedIn") {
    return <FaLinkedin className="h-8 w-8" aria-hidden="true" />;
  }
  if (label === "Resume PDF") {
    return <FaFileAlt className="h-8 w-8" aria-hidden="true" />;
  }
  return null;
}

function StandardHome() {
  return (
    <div className="home-shell">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="portfolio-kicker">{portfolioProfile.name}</p>
          <p className="home-role-line">{portfolioProfile.title}</p>
          <h1 className="portfolio-display-hero mt-6">
            Software engineer and MBA candidate connecting{" "}
            <span className="home-hero-highlight">engineering, data, and business strategy.</span>
          </h1>
          <p className="mt-6 portfolio-copy-strong">{portfolioProfile.summary}</p>

          <div className="home-hero-cta">
            <a href={portfolioProfile.resumeUrl} target="_blank" rel="noreferrer noopener" className="portfolio-button-primary">
              Download resume
            </a>
            <a href="#contact" className="portfolio-button-secondary">
              Contact
            </a>
          </div>

          <div className="home-signal-divider mt-10" aria-hidden="true" />
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
            {portfolioProfile.heroFacts.map((fact) => (
              <div key={fact.label} className="home-stat">
                <p className="portfolio-kicker">{fact.label}</p>
                <p className="home-stat-value">{fact.value}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-t border-brand-line/16 pt-10">
        <p className="portfolio-kicker">Competencies</p>
        <h2 className="portfolio-display-title mt-3">Technical and business skills</h2>
        <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioProfile.stackGroups.map((group) => (
            <div
              key={group.label}
              className="home-competency-tile">
              <p className="portfolio-kicker">
                <span className="home-competency-dot" aria-hidden="true" />
                {group.label}
              </p>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="portfolio-copy">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-brand-line/16 pt-10">
        <p className="portfolio-kicker">Experience</p>
        <h2 className="portfolio-display-title mt-3">Selected professional experience</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {featuredPortfolioWorkExperience.map((entry) => (
            <article key={`${entry.role}-${entry.organization}`} className="home-experience-card">
              <p className="portfolio-kicker">{entry.period}</p>
              <h3 className="portfolio-display-subtitle mt-3">{entry.role}</h3>
              <p className="mt-2 portfolio-copy">{entry.organization}</p>
              <p className="mt-3 portfolio-copy">{entry.story}</p>
            </article>
          ))}
        </div>
        <Link to="/about" className="portfolio-inline-link mt-6 inline-flex items-center">
          Full career progression
        </Link>
      </section>

      <section className="border-t border-brand-line/16 pt-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="portfolio-kicker">Work</p>
            <h2 className="portfolio-display-title mt-3">Featured projects</h2>
          </div>
          <Link to="/projects" className="portfolio-inline-link">
            View all projects
          </Link>
        </div>

        <div className="home-projects-grid">
          {featuredPortfolioProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} showPreview={false} showTypeTag={false} />
          ))}
        </div>
      </section>

      <section className="border-t border-brand-line/16 pt-10">
        <p className="portfolio-kicker">Education and leadership</p>
        <h2 className="portfolio-display-title mt-3">Education</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {portfolioEducation.map((entry) => (
            <div key={entry.degree} className="portfolio-education-card">
              <p className="portfolio-kicker">{entry.status}</p>
              <p className="mt-2 portfolio-copy-strong">{entry.degree}</p>
              <p className="mt-1 portfolio-copy">{entry.school}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="home-contact-section">
        <p className="portfolio-kicker">Contact</p>
        <h2 className="portfolio-display-title mt-3">Get in touch</h2>
        <p className="mt-4 max-w-2xl portfolio-copy">
          Open to software engineering, data/business analytics, and technology leadership roles.
        </p>
        <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {portfolioProfile.resources.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.label === "Email" ? undefined : "_blank"}
              rel={item.label === "Email" ? undefined : "noreferrer noopener"}
              className="home-contact-link group flex flex-col items-center text-center"
            >
              <span className="home-contact-icon transition-colors duration-200 group-hover:text-brand-frame">
                {getResourceIcon(item.label)}
              </span>
              <span className="mt-4 portfolio-copy">{item.label}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StandardHome;
