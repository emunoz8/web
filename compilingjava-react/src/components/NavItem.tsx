import React, { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  icon?: ReactElement;
  exact?: boolean;
  className?: string;
}

const NavItem = ({
  to,
  label,
  icon,
  exact = false,
  className,
}: NavItemProps): React.JSX.Element => {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);

  const classes = `nav-item ${isActive ? "active" : ""} ${className ?? ""}`;

  return (
    <>
      <Link to={to} className={classes} aria-current={isActive ? "page" : undefined}>
        {icon && <span className="nav-icon">{icon}</span>}
        <span>{label}</span>
      </Link>
    </>
  );
};

export default NavItem;
