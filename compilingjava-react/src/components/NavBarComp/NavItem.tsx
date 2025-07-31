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
      className={({ isActive }) =>
        `px-4 py-2 rounded-md transition-colors ${
          isActive ? 'nav-item.active' : 'nav-item'
        }`
      }
    >
      {label}
    </NavLink>
  );
};

export default NavItem;
