import React from "react";
import { Link, useLocation } from "react-router-dom";
import '../styles/NavItem.css';

interface NavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  exact?: boolean;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, exact = false, className }) => {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);

  const classes = `nav-item ${isActive ? "active" : ""} ${className ?? ""}`;

  return (
    <li>
    <Link to={to} className={classes} aria-current={isActive ? "page" : undefined}>
      {icon && <span className="nav-icon">{icon}</span>}
      <span>{label}</span>
    </Link>
    </li>
  );
};

export default NavItem;
