import { lazy } from "react";
import Home from "../pages/Home";
import ProjectDetail from "../pages/ProjectDetail";
import { PublicRoute } from "./types";

const About = lazy(() => import("../pages/About"));
const Projects = lazy(() => import("../pages/Projects"));
const AddToTheAux = lazy(() => import("../pages/AddToTheAux"));
const TicTacToe = lazy(() => import("../pages/TicTacToe"));
const JitCafe = lazy(() => import("../pages/JitCafe"));

export const publicRoutes: PublicRoute[] = [
  { to: "/", label: "Home", Component: Home },
  { to: "/projects", label: "Projects", Component: Projects },
  { to: "/projects/:id", label: "Project Detail", Component: ProjectDetail, showInNav: false },
  { to: "/about", label: "About", Component: About },
  { to: "/add-to-the-aux", label: "AddToTheAUX", Component: AddToTheAux, showInNav: false },
  { to: "/tic-tac-toe", label: "TicTacToe", Component: TicTacToe, showInNav: false },
  { to: "/jit-cafe/*", label: "JIT Cafe", Component: JitCafe, showInNav: false },
];
