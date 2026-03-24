import { lazy } from "react";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ProjectDetail from "../pages/ProjectDetail";
import { PublicRoute } from "./types";

const About = lazy(() => import("../pages/About"));
const Resume = lazy(() => import("../pages/Resume"));
const Contact = lazy(() => import("../pages/Contact"));
const Blog = lazy(() => import("../pages/Blog"));
const AdminProjects = lazy(() => import("../pages/admin/AdminProjects"));
const AdminBlog = lazy(() => import("../pages/admin/AdminBlog"));
const ApiLab = lazy(() => import("../pages/ApiLab"));
const AddToTheAux = lazy(() => import("../pages/AddToTheAux"));
const TicTacToe = lazy(() => import("../pages/TicTacToe"));
const JitCafe = lazy(() => import("../pages/JitCafe"));

export const publicRoutes: PublicRoute[] = [
  { to: "/", label: "Home", Component: Home },
  { to: "/about", label: "About", Component: About },
  { to: "/projects/:id", label: "Project Detail", Component: ProjectDetail, showInNav: false },
  { to: "/resume", label: "Resume", Component: Resume },
  { to: "/contact", label: "Contact", Component: Contact },
  { to: "/blog", label: "Blog", Component: Blog, showInNav: false },
  { to: "/admin/projects", label: "Admin Projects", Component: AdminProjects, requiresAdmin: true },
  { to: "/admin/blog", label: "Admin Blog", Component: AdminBlog, requiresAdmin: true },
  { to: "/login", label: "Login", Component: Login, showInNav: false },
  { to: "/api-lab", label: "API Lab", Component: ApiLab, showInNav: false, requiresAdmin: true },
  { to: "/add-to-the-aux", label: "AddToTheAUX", Component: AddToTheAux, showInNav: false },
  { to: "/tic-tac-toe", label: "TicTacToe", Component: TicTacToe, showInNav: false },
  { to: "/jit-cafe/*", label: "JIT Cafe", Component: JitCafe, showInNav: false },
];
