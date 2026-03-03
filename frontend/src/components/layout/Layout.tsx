import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import AppRoutes from "../../routes/AppRoutes";

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

const Layout: React.FC = () => {
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);
  const hideShell = pathname === "/add-to-the-aux";

  return (
    <div>
      {!hideShell && <Navbar />}
      <AppRoutes />
    </div>
  );
};

export default Layout;
