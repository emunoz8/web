// src/routes/AppRoutes.tsx
import { Suspense, createElement } from "react";
import { Location, Route, Routes, useLocation } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import RequireAdmin from "./RequireAdmin";
import type { RoutePageComponent } from "./types";

const routeLoadingFallback = (
  <div className="p-4 text-sm opacity-80" aria-busy="true">
    Loading page...
  </div>
);

function renderRouteElement(Component: RoutePageComponent, requiresAdmin = false) {
  const page = (
    <Suspense fallback={routeLoadingFallback}>
      {createElement(Component)}
    </Suspense>
  );

  return requiresAdmin ? <RequireAdmin>{page}</RequireAdmin> : page;
}

const AppRoutes = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  const loginRoute = publicRoutes.find((route) => route.to === "/login");

  return (
    <>
      <Routes location={backgroundLocation || location}>
        {publicRoutes.map(({ to, Component, requiresAdmin }) => (
          <Route
            key={to}
            path={to}
            element={renderRouteElement(Component, requiresAdmin)}
          />
        ))}
      </Routes>

      {backgroundLocation && loginRoute && (
        <Routes>
          <Route
            path={loginRoute.to}
            element={renderRouteElement(loginRoute.Component, loginRoute.requiresAdmin)}
          />
        </Routes>
      )}
    </>
  );
};

export default AppRoutes;
