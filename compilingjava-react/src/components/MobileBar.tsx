import React from "react";
import { FaBars, FaTimes } from "react-icons/fa";

interface MobileTopBarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <nav className="navbar-mobile-top">
      <div className="text-2xl font-bold">MyBrand</div>
      <button onClick={toggleSidebar} className="focus:outline-none">
        {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
    </nav>
  );
};

export default MobileTopBar;
