import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getShellPathname, isChromelessPath, isViewportLockedPath } from "../lib/authRouting";

function AppShellContent() {
  const location = useLocation();
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
              : "flex min-h-screen w-full flex-col bg-transparent"
        }
      >
        <Layout />
      </div>
    </div>
  );
}

const Theme: React.FC = () => {
  return (
    <Router>
      <AppShellContent />
    </Router>
  );
};

export default Theme;
