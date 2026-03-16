import { NavLink } from "react-router-dom";
import UiModeToggle from "../../../components/common/UiModeToggle";
import { portfolioNavItems, portfolioProfile } from "../../portfolio/data/profile";

function StandardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-line/22 bg-brand-canvas/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <NavLink to="/" className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-contrast">
            CompilingJava
          </NavLink>
          <p className="mt-1 text-sm text-brand-muted">{portfolioProfile.title}</p>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {portfolioNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-brand-contrast px-4 py-2 text-sm font-semibold text-brand-accent-strong"
                  : "rounded-full px-4 py-2 text-sm font-medium text-brand-muted transition hover:bg-brand-panel/72 hover:text-brand-contrast"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={portfolioProfile.resumeUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden rounded-full border border-brand-line/24 bg-brand-surface/82 px-4 py-2 text-sm font-medium text-brand-muted transition hover:border-brand-frame/32 hover:bg-brand-panel/56 hover:text-brand-contrast sm:inline-flex"
          >
            Resume PDF
          </a>
          <UiModeToggle appearance="standard" />
        </div>
      </div>

      <div className="border-t border-brand-line/18 px-4 py-3 md:hidden sm:px-6">
        <nav className="flex flex-wrap gap-2">
          {portfolioNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-brand-contrast px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent-strong"
                  : "rounded-full bg-brand-surface/86 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default StandardHeader;
