// src/routes/AppRoutes.tsx
import { Suspense, createElement } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import type { RoutePageComponent } from "./types";

const routeLoadingFallback = (
  <div className="p-4 text-sm opacity-80" aria-busy="true">
    Loading page...
  </div>
);

function renderRouteElement(Component: RoutePageComponent) {
  return (
    <Suspense fallback={routeLoadingFallback}>
      {createElement(Component)}
    </Suspense>
  );
}

function NotFoundPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl border-t border-brand-line/18 pt-4">
        <p className="portfolio-kicker">404</p>
        <h1 className="portfolio-display-title mt-4">Page not found</h1>
        <p className="mt-4 portfolio-copy">
          The page you requested does not exist or has been moved.
        </p>
        <Link to="/" className="portfolio-button-secondary mt-6 inline-flex">
          Back to home
        </Link>
      </div>
    </div>
  );
}

const AppRoutes = () => {
  return (
    <Routes>
      {publicRoutes.map(({ to, Component }) => (
        <Route
          key={to}
          path={to}
          element={renderRouteElement(Component)}
        />
      ))}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
      <Route path="/api-lab" element={<Navigate to="/" replace />} />
      <Route path="/blog/*" element={<Navigate to="/" replace />} />
      <Route path="/resume" element={<Navigate to="/" replace />} />
      <Route path="/contact" element={<Navigate to="/#contact" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
