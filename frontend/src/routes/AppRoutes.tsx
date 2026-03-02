// src/routes/AppRoutes.tsx
import { Location, Routes, Route, useLocation } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import RequireAdmin from "./RequireAdmin";
import Login from "../pages/Login";

const AppRoutes = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        {publicRoutes.map(({ to, Component, requiresAdmin }) => (
          <Route
            key={to}
            path={to}
            element={
              requiresAdmin ? (
                <RequireAdmin>
                  <Component />
                </RequireAdmin>
              ) : (
                <Component />
              )
            }
          />
        ))}
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </>
  );
};

export default AppRoutes;
