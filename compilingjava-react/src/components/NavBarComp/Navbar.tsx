// components/Navbar.tsx
import React from 'react';
import NavItem from './NavItem';

const publicRoutes = [
  {to: "/", label:"Home"},
  {to: "/about", label:"About"},
  {to: "/projects", label:"Projects"},
  {to: "/contact", label: "Contact"},
  {to: "/login", label: "Login"},
]

function Navbar() {
  return (
    <nav className="navbar-desktop">
      {publicRoutes.map(({ to, label }) => (
        <NavItem key={to} to={to} label={label} />
      ))}
    </nav>
  );
}

export default Navbar;