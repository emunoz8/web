import NavItem from "../../data/NavItem";
import { publicRoutes } from "../../routes/publicRoutes";
import ThemeToggle from "../common/ThemeToggle";


function Navbar() {
  return (
    <div className="p-4">
    <nav className="navbar">
      {publicRoutes.map(({ to, label }) => (
        <NavItem key={to} to={to} label={label} />
      ))}
    </nav>
    <ThemeToggle/>
      
    </div>
  );
}

export default Navbar;
