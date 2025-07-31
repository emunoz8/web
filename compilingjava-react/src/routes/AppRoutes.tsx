// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/login", element: <Login /> },
  { path: "/projects", element: <Projects /> },
  { path: "/contact", element: <Contact /> },
];

const AppRoutes = () => (
  <Routes>
    {publicRoutes.map(({ path, element }) => (
      <Route key={path} path={path} element={element} />
    ))}

  </Routes>
);

export default AppRoutes;
