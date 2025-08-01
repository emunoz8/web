// components/Navbar.tsx
import React from "react";
import NavItem from "./NavItem";
import { publicRoutes } from "../../routes/publicRoutes";

function Navbar() {
  return (
    <nav className="navbar">
      {publicRoutes.map(({ to, label }) => (
        <NavItem key={to} to={to} label={label} />
      ))}
    </nav>
  );
}

export default Navbar;
