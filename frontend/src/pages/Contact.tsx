import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin } from "react-icons/fa";
import { portfolioProfile } from "../features/portfolio/data/profile";

function Contact() {
  return (
    <div className="space-y-16 py-8 sm:py-10">
      <section className="grid gap-10 border-b border-brand-line/16 pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="max-w-4xl">
          <p className="portfolio-kicker">Contact</p>
          <h1 className="portfolio-display-title mt-4">Reach out through the channels below</h1>
          <p className="mt-6 max-w-3xl portfolio-copy-strong">
            I am most interested in conversations about software engineering roles, full-stack application work, and
            projects that solve real operational problems.
          </p>
        </div>

        <aside className="grid gap-6 lg:justify-self-end lg:max-w-sm">
          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Location</p>
            <p className="mt-4 portfolio-copy">{portfolioProfile.location}</p>
          </div>

          <div className="border-t border-brand-line/20 pt-4">
            <p className="portfolio-kicker">Availability</p>
            <p className="mt-4 portfolio-copy">
              Open to connecting through professional channels, portfolio follow-up, and technical discussion.
            </p>
          </div>
        </aside>
      </section>

      <section>
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Links</p>
          <h2 className="portfolio-display-title mt-4">Primary contact points</h2>
          <p className="mt-4 portfolio-copy">
            The fastest way to reach me is by email or LinkedIn, with GitHub and the resume available below as well.
          </p>
        </div>

        <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
          {portfolioProfile.resources.map((item) => {
            const isEmail = item.label === "Email";
            const isGitHub = item.label === "GitHub";
            const isLinkedIn = item.label === "LinkedIn";
            const isResume = item.label === "Resume PDF";

            return (
              <a
                key={item.label}
                href={item.href}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noreferrer noopener"}
                className="group flex flex-col items-center border-t border-brand-line/18 pt-5 text-center"
              >
                <span className="text-brand-contrast transition-colors duration-200 group-hover:text-brand-frame">
                  {isEmail ? <FaEnvelope className="h-10 w-10" aria-hidden="true" /> : null}
                  {isGitHub ? <FaGithub className="h-10 w-10" aria-hidden="true" /> : null}
                  {isLinkedIn ? <FaLinkedin className="h-10 w-10" aria-hidden="true" /> : null}
                  {isResume ? <FaFileAlt className="h-10 w-10" aria-hidden="true" /> : null}
                </span>
                <span className="mt-4 portfolio-copy">{item.label}</span>
              </a>
            );
          })}
        </div>
      </section>

    </div>
  );
}

export default Contact;
