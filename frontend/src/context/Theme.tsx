import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { SiteUiModeProvider, useSiteUiMode } from "./SiteUiModeContext";
import { getShellPathname, isChromelessPath, isViewportLockedPath } from "../lib/authRouting";
import { AuthProvider } from "./AuthContext";

function AppShellContent() {
  const location = useLocation();
  const { mode } = useSiteUiMode();
  const pathname = getShellPathname(location);
  const chromeless = isChromelessPath(pathname);
  const viewportLocked = isViewportLockedPath(pathname);

  return (
    <div
      className={
        viewportLocked
          ? "min-h-screen overflow-hidden bg-zinc-950 text-zinc-100"
          : chromeless
            ? "min-h-screen bg-zinc-950 text-zinc-100"
            : "min-h-screen bg-brand-canvas text-brand-contrast"
      }
    >
      <div
        className={
          viewportLocked
            ? "min-h-screen w-full overflow-hidden"
            : chromeless
              ? "min-h-screen w-full"
              : mode === "terminal"
                ? "flex min-h-screen w-full flex-col bg-brand-canvas"
                : "flex min-h-screen w-full flex-col bg-transparent"
        }
      >
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <SiteUiModeProvider>
      <AppShellContent />
    </SiteUiModeProvider>
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
