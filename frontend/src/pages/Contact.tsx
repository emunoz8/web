import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin } from "react-icons/fa";
import { portfolioProfile } from "../features/portfolio/data/profile";

function Contact() {
  return (
    <div className="space-y-12 py-8 sm:py-10">
      <section className="border-b border-brand-line pb-10">
        <div className="max-w-3xl">
          <p className="portfolio-kicker">Contact</p>
          <h1 className="portfolio-display-title mt-3">Reach out</h1>
          <p className="mt-4 portfolio-copy">
            Open to software engineering roles, full-stack application work, and projects that solve real operational problems.
          </p>
        </div>
      </section>

      <section>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
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
