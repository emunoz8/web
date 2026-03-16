import type { IconType } from "react-icons";
import { FaEnvelope, FaFilePdf, FaGithub, FaJava, FaLinkedin } from "react-icons/fa";
import { HiOutlineServerStack } from "react-icons/hi2";
import { SiGooglecloud, SiPostgresql, SiReact, SiSpringboot, SiTypescript } from "react-icons/si";
import { portfolioProfile } from "../../portfolio/data/profile";

const footerTechnologies: Array<{ label: string; Icon: IconType }> = [
  { label: "Java", Icon: FaJava },
  { label: "Spring Boot", Icon: SiSpringboot },
  { label: "REST APIs", Icon: HiOutlineServerStack },
  { label: "TypeScript", Icon: SiTypescript },
  { label: "React", Icon: SiReact },
  { label: "PostgreSQL", Icon: SiPostgresql },
  { label: "Google Cloud", Icon: SiGooglecloud },
];

const resourceIcons: Record<string, IconType> = {
  Email: FaEnvelope,
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
  "Resume PDF": FaFilePdf,
};

function StandardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-line/22 bg-brand-surface/86">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_0.9fr_0.9fr] lg:px-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">CompilingJava</p>
          <p className="text-lg font-semibold text-brand-contrast">{portfolioProfile.name}</p>
          <p className="text-sm text-brand-muted">{portfolioProfile.title}</p>
          <p className="max-w-xl text-sm leading-7 text-brand-muted">
            Backend-first product engineering for real workflows, clean APIs, and public-facing software that holds up in use.
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Core Stack</p>
          <div className="flex flex-wrap gap-3 pt-1">
            {footerTechnologies.map(({ label, Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-brand-line/20 bg-brand-surface/72 px-3 py-2 text-sm text-brand-muted"
              >
                <Icon className="h-4 w-4 text-brand-contrast" aria-hidden="true" />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Connect</p>
          <ul className="space-y-2 text-sm text-brand-muted">
            {portfolioProfile.resources.map((resource) => {
              const Icon = resourceIcons[resource.label];

              return (
                <li key={resource.label}>
                <a
                  href={resource.href}
                  target={resource.external ? "_blank" : undefined}
                  rel={resource.external ? "noreferrer noopener" : undefined}
                  className="inline-flex items-center gap-3 transition hover:text-brand-accent"
                >
                  {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                  {resource.label}
                </a>
              </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="border-t border-brand-line/18 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{`Built and maintained by ${portfolioProfile.name}.`}</p>
          <p>{`${portfolioProfile.location} | ${year}`}</p>
        </div>
      </div>
    </footer>
  );
}

export default StandardFooter;
