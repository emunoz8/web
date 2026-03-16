import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  JIT_CAFE_BASE_PATH,
  JIT_CAFE_CONTACT_PATH,
  JIT_CAFE_MENU_PATH,
  getJitCafeAssetPath,
} from "../../lib/paths";
import { cn } from "../../utils/cn";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationItems = [
    { label: "Home", to: JIT_CAFE_BASE_PATH },
    { label: "Food Menu", to: JIT_CAFE_MENU_PATH },
    { label: "Contact us", to: JIT_CAFE_CONTACT_PATH },
  ];

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    document.body.classList.add("jit-cafe-body-scroll-locked");

    return () => {
      document.body.classList.remove("jit-cafe-body-scroll-locked");
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="public-navbar">
      <div className="public-navbar-shell">
        <div className="public-navbar-row">
          <NavLink
            to={JIT_CAFE_BASE_PATH}
            className="public-navbar-brand"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="public-navbar-brand-mark">
              <img
                src={getJitCafeAssetPath("logo-mark.png")}
                alt="Just In Time Cafe logo"
                className="public-navbar-brand-image"
                width="936"
                height="945"
              />
            </div>
            <div className="public-navbar-brand-copy">
              <p className="public-navbar-brand-title">
                Just In Time Cafe
              </p>
              <div className="public-navbar-brand-meta">
                <p className="public-navbar-brand-label">
                  Pickup
                </p>
                <span className="public-navbar-brand-line" />
              </div>
            </div>
          </NavLink>

          <button
            type="button"
            className={cn(
              "public-navbar-toggle",
              isMobileMenuOpen ? "public-navbar-toggle-open" : undefined,
            )}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span className="screen-reader-only">Menu</span>
            <span className="public-navbar-stack" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <span key={index} className="public-navbar-stack-line" />
              ))}
            </span>
          </button>

          <nav className="public-navbar-desktop" aria-label="Primary navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === JIT_CAFE_BASE_PATH}
                className={({ isActive }) =>
                  cn(
                    "public-navbar-link-desktop",
                    isActive
                      ? "public-navbar-link-desktop-active"
                      : "public-navbar-link-desktop-inactive",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div
        className={cn(
          "public-navbar-mobile-drawer-shell",
          isMobileMenuOpen
            ? "public-navbar-mobile-drawer-shell-open"
            : "public-navbar-mobile-drawer-shell-closed",
        )}
      >
        <button
          type="button"
          className="public-navbar-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside className="public-navbar-mobile-drawer" aria-label="Mobile navigation">
          <div className="public-navbar-mobile-drawer-header">
            <p className="public-navbar-mobile-drawer-label">Menu</p>
            <button
              type="button"
              className="public-navbar-mobile-close"
              aria-label="Close navigation menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="public-navbar-mobile-close-line" />
              <span className="public-navbar-mobile-close-line" />
            </button>
          </div>

          <nav className="public-navbar-mobile-list" aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === JIT_CAFE_BASE_PATH}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "public-navbar-link-mobile",
                    isActive
                      ? "public-navbar-link-mobile-active"
                      : "public-navbar-link-mobile-inactive",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  );
}
