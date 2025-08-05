// components/NavItem.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link')}
    >
      {label}
    </NavLink>
  );
};

export default NavItem;
