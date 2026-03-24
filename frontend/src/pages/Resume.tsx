import { Link } from "react-router-dom";
import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin } from "react-icons/fa";
import { SiCodecademy, SiOracle } from "react-icons/si";
import { portfolioProfile } from "../features/portfolio/data/profile";

const professionalSummary = [
  "Full-stack developer with a strong backend foundation in Java and Spring Boot.",
  "Experienced building complete applications from API design and data modeling to React frontends and cloud deployment.",
  "Brings a systems-thinking mindset shaped by years of operational work — focused on reliability, clean design, and software that holds up in production.",
];

const education = {
  degree: "Bachelor of Science in Computer Science",
  school: "Northeastern Illinois University",
  date: "May 2024",
  codecademyProfile: "https://www.codecademy.com/profiles/emunoz8",
};

const workExperience = [
  {
    role: "Full-Stack Software Engineer",
    organization: "Independent Contract Work",
    period: "Present",
    story:
      "In my current contract software work, I build full-stack applications from the backend outward, handling API design, frontend implementation, data modeling, and deployment as part of one continuous product workflow. The work usually starts with a practical problem or operational need, then turns into a maintainable system built with tools like Java, Spring Boot, React, TypeScript, and relational data structures. It has strengthened my ability to move between architecture and execution, work directly with evolving requirements, and deliver software that is both technically solid and usable in day-to-day operations.",
  },
  {
    role: "Program Coordinator / Youth Mentor",
    organization: "Options for Youth",
    period: "November 2022 - Present",
    story:
      "At Options for Youth, I work directly with high school students on academic progress, social development, post-secondary planning, and practical next steps like job searches, resumes, and college applications. Alongside the mentoring work, I coordinate with school staff to keep participation consistent and built the internal data systems that track attendance, sessions, and outcomes. That role pushed me to combine people-centered support with operational thinking, using Google Forms, Google Sheets, and Apps Script to replace manual reporting with more structured workflows that staff and stakeholders can actually rely on.",
  },
  {
    role: "Maintenance Technician",
    organization: "Target",
    period: "2021 - 2022",
    story:
      "At Target, I worked on maintenance for conveyor systems and the larger material-handling equipment that kept operations moving. A lot of that work involved Honeywell systems, which meant diagnosing sensors, controls, and mechanical issues quickly before they turned into larger interruptions. It was a fast-paced reliability role where troubleshooting had to be practical and efficient, with a clear understanding of how one failure point could affect the rest of the system.",
  },
  {
    role: "Lead Diesel Technician",
    organization: "Loomis Armored",
    period: "November 2018 - May 2021",
    story:
      "At Loomis Armored, I led a small technician team responsible for keeping a 48-vehicle fleet reliable and ready for daily operations. The work required diagnosing mechanical and electrical issues across diesel and gasoline vehicles, coordinating closely with operations managers so repairs did not disrupt routes, and staying ahead of inspection requirements and parts inventory. It was a hands-on leadership role where speed mattered, but so did consistency, documentation, and making sure the system kept moving without unnecessary downtime.",
  },
  {
    role: "Diesel Technician",
    organization: "Midwest Transit Equipment",
    period: "2016 - 2018",
    story:
      "At Midwest Transit Equipment, I built deeper expertise in diesel diagnostics through dealership training focused on International and Cummins engines while continuing to handle hands-on repair and electrical troubleshooting in the shop. The work involved applying manufacturer procedures to real service problems, diagnosing engine and electrical faults, and learning how to work from technical documentation without slowing down the repair process. That experience strengthened both my systems-based troubleshooting approach and my confidence working with more specialized engine platforms.",
  },
  {
    role: "Fleet Mechanic",
    organization: "Northshore Transit Inc",
    period: "2014 - 2016",
    story:
      "At Northshore Transit Inc, I worked as a fleet mechanic supporting the maintenance and repair of transit vehicles used in daily service. Along with regular preventive maintenance and mechanical repair work, I became the technician people relied on for electrical troubleshooting when wiring, charging, lighting, or control issues were harder to pin down. The role sharpened my diagnostic process because it required balancing routine service with methodical troubleshooting and getting vehicles back on the road safely and consistently.",
  },
  {
    role: "Diesel Mechanic (Corporal)",
    organization: "United States Marine Corps",
    period: "October 2010 - July 2014",
    story:
      "In the Marine Corps, I served as a diesel mechanic and later as a Corporal supervising five Marines in vehicle maintenance operations. The job combined technical repair work across engines, transmissions, wiring harnesses, and electrical systems with the responsibility of training, accountability, and day-to-day leadership. That environment shaped how I work now: stay calm under pressure, keep standards high, and treat preventive maintenance, preparation, and reliability as part of the job rather than something handled later.",
  },
];

function getResourceIcon(label: string) {
  if (label === "Email") {
    return <FaEnvelope className="h-4 w-4" aria-hidden="true" />;
  }

  if (label === "GitHub") {
    return <FaGithub className="h-4 w-4" aria-hidden="true" />;
  }

  if (label === "LinkedIn") {
    return <FaLinkedin className="h-4 w-4" aria-hidden="true" />;
  }

  if (label === "Resume PDF") {
    return <FaFileAlt className="h-4 w-4" aria-hidden="true" />;
  }

  return null;
}

function Resume() {
  return (
    <div className="space-y-16 py-8 sm:py-10">
      <section className="grid gap-10 border-b border-brand-line/16 pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="max-w-4xl">
          <p className="portfolio-kicker">Resume</p>
          <h1 className="portfolio-display-title mt-4">Edwin Munoz</h1>
          <p className="portfolio-display-subtitle mt-4">Full-Stack Developer | Java, Spring Boot &amp; React</p>
          <p className="mt-6 max-w-3xl portfolio-copy-strong">
            {professionalSummary[0]}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-muted">
            <span>Chicago, IL</span>
            <span>CompilingJava.com</span>
            <span>linkedin.com/in/edwinmunoz9</span>
            <span>github.com/emunoz8</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={portfolioProfile.resumeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="portfolio-button-primary"
            >
              Open resume PDF
            </a>
            <Link to="/contact" className="portfolio-button-secondary">
              Contact
            </Link>
          </div>
        </div>

        <aside className="grid gap-6 lg:justify-self-end lg:max-w-sm">
          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Education</p>
            <p className="mt-4 portfolio-copy">
              {education.degree}
            </p>
            <p className="mt-2 portfolio-copy">{education.school}</p>
            <p className="mt-2 portfolio-copy">{education.date}</p>
            <a
              href={education.codecademyProfile}
              target="_blank"
              rel="noreferrer noopener"
              className="portfolio-inline-link mt-4 inline-flex items-center gap-2"
            >
              <SiCodecademy className="h-4 w-4" aria-hidden="true" />
              Codecademy
            </a>
          </div>

          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Links</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {portfolioProfile.resources
                .filter((resource) => resource.label !== "Resume PDF")
                .map((resource) => (
                  <a
                    key={resource.label}
                    href={resource.href}
                    target={resource.external ? "_blank" : undefined}
                    rel={resource.external ? "noreferrer noopener" : undefined}
                    className="portfolio-inline-link inline-flex items-center gap-2"
                  >
                    {getResourceIcon(resource.label)}
                    {resource.label}
                  </a>
                ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="max-w-3xl">
        <p className="portfolio-kicker">Professional Summary</p>
        <h2 className="portfolio-display-title mt-4">Professional summary</h2>
        <div className="mt-6 space-y-5 border-t border-brand-line/16 pt-5">
          {professionalSummary.map((item) => (
            <p key={item} className="portfolio-copy">
              {item}
            </p>
          ))}
        </div>
      </section>

      <div className="portfolio-section-divider" />

      <section>
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Certifications</p>
          <h2 className="portfolio-display-title mt-4">Certifications</h2>
        </div>
        <div className="mt-6 grid gap-x-8 gap-y-6 border-t border-brand-line/16 pt-5 sm:grid-cols-2 xl:grid-cols-3">
          <a
            href="https://catalog-education.oracle.com/ords/certview/sharebadge?id=772453377D98898B70D0C2D37B0134024E3E975C73FCBBE7DDB36DEE52EE01E1"
            target="_blank"
            rel="noreferrer noopener"
            className="portfolio-inline-link inline-flex items-center gap-2"
          >
            <SiOracle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Oracle Certified — Java
          </a>
          <a
            href="https://www.codecademy.com/profiles/emunoz8"
            target="_blank"
            rel="noreferrer noopener"
            className="portfolio-inline-link inline-flex items-center gap-2"
          >
            <SiCodecademy className="h-4 w-4 shrink-0" aria-hidden="true" />
            Create REST APIs with Spring and Java
          </a>
          <a
            href="https://www.codecademy.com/profiles/emunoz8"
            target="_blank"
            rel="noreferrer noopener"
            className="portfolio-inline-link inline-flex items-center gap-2"
          >
            <SiCodecademy className="h-4 w-4 shrink-0" aria-hidden="true" />
            Build APIs with Spring
          </a>
          <a
            href="https://www.codecademy.com/profiles/emunoz8"
            target="_blank"
            rel="noreferrer noopener"
            className="portfolio-inline-link inline-flex items-center gap-2"
          >
            <SiCodecademy className="h-4 w-4 shrink-0" aria-hidden="true" />
            Java for Programmers
          </a>
          <a
            href="https://www.codecademy.com/profiles/emunoz8"
            target="_blank"
            rel="noreferrer noopener"
            className="portfolio-inline-link inline-flex items-center gap-2"
          >
            <SiCodecademy className="h-4 w-4 shrink-0" aria-hidden="true" />
            Learn Java: Object-Oriented Programming
          </a>
          <a
            href="https://www.codecademy.com/profiles/emunoz8"
            target="_blank"
            rel="noreferrer noopener"
            className="portfolio-inline-link inline-flex items-center gap-2"
          >
            <SiCodecademy className="h-4 w-4 shrink-0" aria-hidden="true" />
            Coding Interview: DSA in C++
          </a>
        </div>
      </section>

      <div className="portfolio-section-divider" />

      <section>
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Work Experience</p>
          <h2 className="portfolio-display-title mt-4">Professional history</h2>
        </div>
        <div className="mt-6 space-y-10">
          {workExperience.map((entry) => (
            <article key={`${entry.role}-${entry.organization}`} className="grid gap-8 border-t border-brand-line/18 pt-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                {entry.period ? <p className="portfolio-kicker">{entry.period}</p> : null}
                <h3 className="portfolio-display-subtitle mt-3">{entry.role}</h3>
                <p className="mt-3 portfolio-copy">{entry.organization}</p>
              </div>
              <p className="portfolio-copy">{entry.story}</p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Resume;
