import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { AuthProvider } from "./AuthContext";

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function AppShell() {
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);
  const chromeless = pathname === "/add-to-the-aux";

  return (
    <div
      className={
        chromeless
          ? "min-h-screen overflow-hidden bg-gray-50 text-gray-800 font-mono dark:bg-gray-900 dark:text-green-300"
          : "code-theme"
      }
    >
      <div className={chromeless ? "min-h-screen w-full overflow-hidden" : "body-main"}>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </div>
    </div>
  );
}

const Theme: React.FC = () => {
  return (
    <Router>
      <AppShell />
    </Router>
  );
};

export default Theme;
