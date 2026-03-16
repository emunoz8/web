// components/NavItem.tsx
import React from "react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}

const MOBILE_BASE_CLASS =
  "block w-full rounded-md border min-h-11 px-3 py-2.5 text-left text-sm font-semibold transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-emerald-400";
const MOBILE_INACTIVE_CLASS =
  `${MOBILE_BASE_CLASS} border-slate-200 bg-white text-indigo-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 dark:border-gray-700 dark:bg-gray-900 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-gray-800 dark:hover:text-emerald-200`;
const MOBILE_ACTIVE_CLASS =
  `${MOBILE_BASE_CLASS} border-indigo-500 bg-indigo-500 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-500 dark:text-gray-900`;

const NavItem: React.FC<NavItemProps> = ({ to, label, onClick, variant = "desktop" }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        variant === "mobile" ? (isActive ? MOBILE_ACTIVE_CLASS : MOBILE_INACTIVE_CLASS) : isActive ? "nav-link-active" : "nav-link"
      }
      onClick={onClick}
    >
      {label}
    </NavLink>
  );
};

export default NavItem;
