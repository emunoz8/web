import React from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "../../routes/AppRoutes";
import StandardUI from "../../features/standardUI/components/StandardUI";
import { getShellPathname, isChromelessPath } from "../../lib/authRouting";
import RouteScrollReset from "./RouteScrollReset";

const Layout: React.FC = () => {
  const location = useLocation();
  const pathname = getShellPathname(location);
  const hideShell = isChromelessPath(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <RouteScrollReset />

      {hideShell ? (
        <main className="flex-1">
          <AppRoutes />
        </main>
      ) : (
        <StandardUI>
          <AppRoutes />
        </StandardUI>
      )}
    </div>
  );
};

export default Layout;
