import React from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "../../routes/AppRoutes";
import { useSiteUiMode } from "../../context/SiteUiModeContext";
import StandardUI from "../../features/standardUI/components/StandardUI";
import TerminalUI from "../../features/terminalUI/components/TerminalUI";
import { getShellPathname, isChromelessPath } from "../../lib/authRouting";
import RouteScrollReset from "./RouteScrollReset";

const Layout: React.FC = () => {
  const location = useLocation();
  const { mode } = useSiteUiMode();
  const pathname = getShellPathname(location);
  const hideShell = isChromelessPath(pathname);

  return (
    <div
      className={
        hideShell
          ? "flex min-h-screen flex-col"
          : mode === "terminal"
            ? "terminal-mode-canvas relative min-h-screen overflow-hidden"
            : "flex min-h-screen flex-col"
      }
    >
      <RouteScrollReset />

      {hideShell ? (
        <main className="flex-1">
          <AppRoutes />
        </main>
      ) : mode === "terminal" ? (
        <TerminalUI>
          <AppRoutes />
        </TerminalUI>
      ) : (
        <StandardUI>
          <AppRoutes />
        </StandardUI>
      )}
    </div>
  );
};

export default Layout;
