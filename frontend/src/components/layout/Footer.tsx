import { Link } from "react-router-dom";
import { portfolioProfile } from "../../features/portfolio/data/profile";
import {
  terminalExternalCommands,
  terminalFeaturedCommands,
} from "../../features/portfolio/data/terminalShell";

function Footer() {
  const year = new Date().getFullYear();
  const shortcutLinks: Record<string, string> = {
    "cd ~": "/",
    "cd about": "/about",
    "cd projects": "/projects",
    "less resume": "/resume",
    "cd contact": "/contact",
  };

  return (
    <footer className="pb-10 pt-8">
      <div className="brand-terminal-panel">
        <div className="brand-window-header">
          <span className="brand-window-dot brand-window-dot-active" />
          <span className="brand-window-dot" />
          <span className="brand-window-dot" />
          <span className="brand-window-label">session.log</span>
        </div>

        <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr_0.95fr_0.95fr]">
          <section className="space-y-4">
            <p className="brand-eyebrow">whoami</p>
            <div className="space-y-2 text-sm text-brand-muted">
              <p className="text-base font-semibold text-brand-contrast">{portfolioProfile.name}</p>
              <p>{portfolioProfile.title}</p>
              <p>{portfolioProfile.summary}</p>
            </div>
          </section>

          <section className="space-y-4">
            <p className="brand-eyebrow">shortcuts</p>
            <ul className="space-y-3 font-mono text-sm text-brand-muted">
              {terminalFeaturedCommands.map((command) => (
                <li key={command}>
                  {shortcutLinks[command] ? (
                    <Link
                      to={shortcutLinks[command]}
                      className="transition hover:text-brand-accent"
                    >
                      {command}
                    </Link>
                  ) : (
                    <a
                      href="https://github.com/emunoz8"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="transition hover:text-brand-accent"
                    >
                      {command}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <p className="brand-eyebrow">resources</p>
            <ul className="space-y-3 font-mono text-sm text-brand-muted">
              {terminalExternalCommands.map((command) => (
                <li key={command.id}>
                  <a
                    href={command.href}
                    target={command.openInNewTab ? "_blank" : undefined}
                    rel={command.openInNewTab ? "noreferrer noopener" : undefined}
                    className="transition hover:text-brand-accent"
                  >
                    {command.command}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="border-t border-brand-line/18 px-6 py-4">
          <div className="flex flex-col gap-2 font-mono text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
            <p>copyright {year} :: compilingjava.com</p>
            <p>{portfolioProfile.location}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
