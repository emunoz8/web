import React from "react";
import NavItem from "./NavItem";
import {FaHome, FaUser, FaProjectDiagram, FaEnvelope, FaSignInAlt} from "react-icons/fa";

const Navbar: React.FC = () =>{
    return(
        <nav className="navbar">
            <ul>
            <NavItem to="/" label="Home" icon={<FaHome />} exact />
            <NavItem to="/about-me" label="About Me" icon={<><FaUser/></>} />
            <NavItem to="/projects" label="Projects" icon={<FaProjectDiagram />} />
            <NavItem to="/contact" label="Contact" icon={<FaEnvelope />} />
            <NavItem to="/login" label="Login" icon={<FaSignInAlt />} />
            </ul>
        </nav>
    );

};

export default Navbar;