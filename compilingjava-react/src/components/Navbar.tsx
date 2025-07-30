import React, { useState } from "react";
import NavItem from "./NavItem";
import { FaHome, FaUser, FaProjectDiagram, FaEnvelope, FaSignInAlt, FaBars, FaTimes } from "react-icons/fa";
import MobileTopBar from "./MobileBar";

const Navbar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <>
<MobileTopBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <nav className="flex flex-col p-6 space-y-6">
          <div className="text-2xl font-bold mb-8">MyBrand</div>
          <NavItem to="/home" label="Home" icon={<FaHome />} />
          <NavItem to="/about-me" label="About Me" icon={<FaUser />} />
          <NavItem to="/projects" label="Projects" icon={<FaProjectDiagram />} />
          <NavItem to="/contact" label="Contact" icon={<FaEnvelope />} />
          <NavItem to="/login" label="Login" icon={<FaSignInAlt />} />
        </nav>
      </aside>

      {/* Desktop navbar */}
      <nav className="navbar-desktop">
        <NavItem to="/home" label="Home" icon={<FaHome />} />
        <NavItem to="/about-me" label="About Me" icon={<FaUser />} />
        <NavItem to="/projects" label="Projects" icon={<FaProjectDiagram />} />
        <NavItem to="/contact" label="Contact" icon={<FaEnvelope />} />
        <NavItem to="/login" label="Login" icon={<FaSignInAlt />} />
      </nav>
    </>
  );
};

export default Navbar;
