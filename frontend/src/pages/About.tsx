import { portfolioProfile } from "../features/portfolio/data/profile";
import {
  portfolioCertifications,
  portfolioEducation,
  portfolioWorkExperience,
} from "../features/portfolio/data/experience";

function About() {
  return (
    <div className="space-y-16 py-8 sm:py-10">
      <section className="portfolio-page-intro grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="max-w-3xl">
          <p className="portfolio-kicker">About</p>
          <h1 className="portfolio-display-title mt-4">A bit about me</h1>
          <p className="mt-6 portfolio-copy-strong">{portfolioProfile.shortAbout[0]}</p>
          <p className="mt-4 portfolio-copy">{portfolioProfile.shortAbout[1]}</p>
          {portfolioProfile.aboutParagraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 portfolio-copy">
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="grid gap-4 lg:justify-self-end lg:max-w-sm">
          <div className="border-t border-brand-line pt-4">
            <p className="portfolio-kicker">Location</p>
            <p className="mt-2 portfolio-copy">{portfolioProfile.location}</p>
          </div>
          <div className="border-t border-brand-line pt-4">
            <p className="portfolio-kicker">Focus</p>
            <p className="mt-2 portfolio-copy">{portfolioProfile.techStackLine}</p>
          </div>
        </aside>
      </section>

      <section>
        <p className="portfolio-kicker">Education</p>
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

      <section>
        <p className="portfolio-kicker">Certifications</p>
        <h2 className="portfolio-display-title mt-3">Certifications</h2>
        <div className="mt-6 grid gap-x-8 gap-y-3 border-t border-brand-line/16 pt-5 sm:grid-cols-2">
          {portfolioCertifications.map((cert) => (
            <a
              key={cert.label}
              href={cert.href}
              target="_blank"
              rel="noreferrer noopener"
              className="portfolio-inline-link inline-flex items-center"
            >
              {cert.label}
            </a>
          ))}
        </div>
      </section>

      <section>
        <p className="portfolio-kicker">Career progression</p>
        <h2 className="portfolio-display-title mt-3">Professional history</h2>
        <div className="mt-6 space-y-10">
          {portfolioWorkExperience.map((entry) => (
            <article
              key={`${entry.role}-${entry.organization}`}
              className="grid gap-8 border-t border-brand-line/18 pt-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            >
              <div>
                <p className="portfolio-kicker">{entry.period}</p>
                <h3 className="portfolio-display-subtitle mt-3">{entry.role}</h3>
                <p className="mt-3 portfolio-copy">{entry.organization}</p>
              </div>
              <p className="portfolio-copy">{entry.story}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <p className="portfolio-kicker">Looking ahead</p>
        <h2 className="portfolio-display-title mt-3">Professional interests and objective</h2>
        <div className="mt-6 max-w-3xl space-y-4 border-t border-brand-line/16 pt-5">
          <p className="portfolio-copy">
            My professional interests sit at the intersection of software engineering, business analytics,
            information systems, data science, and artificial intelligence. I am drawn to roles and problems
            that need someone who can move between writing and architecting software and reasoning about the
            business and operational impact of that software.
          </p>
          <p className="portfolio-copy">
            My career objective is to apply that combination — a Computer Science foundation, an MBA in Business
            Analytics, hands-on software development, and leadership experience from the Marine Corps and program
            coordination — toward technology leadership and business analytics roles where I can help an
            organization connect its technical systems to its strategic decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;
