import { Outlet } from "react-router-dom";
import { Footer } from "./components/navigation/Footer";
import { Navbar } from "./components/navigation/Navbar";

export function JitCafeLayout() {
  return (
    <div className="public-layout-shell">
      <div className="public-layout-hero-haze" />
      <div className="public-layout-hero-glow" />
      <Navbar />
      <main className="public-layout-main public-layout-main-default">
        <div className="public-layout-content">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
