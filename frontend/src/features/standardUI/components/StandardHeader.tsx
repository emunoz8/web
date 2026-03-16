import { NavLink } from "react-router-dom";
import { HiArrowUpRight, HiOutlineDocumentText } from "react-icons/hi2";
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
            className="portfolio-header-resume group hidden sm:inline-flex"
          >
            <span className="portfolio-header-resume-kicker">Resume / 2026</span>
            <span className="portfolio-header-resume-title">
              <HiOutlineDocumentText className="h-4 w-4 shrink-0" />
              Open PDF
              <HiArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
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
