import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
//import Contact from "../pages/Contact";
// import Login from "../pages/Login";
import { PublicRoute } from "./types";

export const publicRoutes: PublicRoute[] = [
  { to: "/", label: "Home", Component: Home },
  { to: "/about", label: "About", Component: About },
  { to: "/projects", label: "Projects", Component: Projects },
  //{ to: "/contact", label: "Contact", Component: Contact },
  //{ to: "/login", label: "Login", Component: Login },//work in progress
];
