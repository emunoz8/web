// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";


const AppRoutes = () => (
  <Routes>
    {publicRoutes.map(({ to, Component }) => (
      <Route key={to} path={to} element={<Component/>} />
    ))}

  </Routes>
);

export default AppRoutes;
