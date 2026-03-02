import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Blog from "../pages/Blog";
import AdminProjects from "../pages/admin/AdminProjects";
import AdminBlog from "../pages/admin/AdminBlog";
import Travel from "../pages/Travel";
import ApiLab from "../pages/ApiLab";
import AddToTheAux from "../pages/AddToTheAux";
import Login from "../pages/Login";
import { PublicRoute } from "./types";

export const publicRoutes: PublicRoute[] = [
  { to: "/", label: "Home", Component: Home },
  { to: "/about", label: "About", Component: About },
  { to: "/projects", label: "Projects", Component: Projects },
  { to: "/blog", label: "Blog", Component: Blog },
  { to: "/admin/projects", label: "Admin Projects", Component: AdminProjects, requiresAdmin: true },
  { to: "/admin/blog", label: "Admin Blog", Component: AdminBlog, requiresAdmin: true },
  { to: "/login", label: "Login", Component: Login, showInNav: false },
  { to: "/travel", label: "Travel", Component: Travel, showInNav: false },
  { to: "/api-lab", label: "API Lab", Component: ApiLab, showInNav: false, requiresAdmin: true },
  { to: "/add-to-the-aux", label: "AddToTheAUX", Component: AddToTheAux, showInNav: false },
];
