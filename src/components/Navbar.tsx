import { Link, NavLink } from "react-router-dom";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <Link to="/" aria-label="FreshCheck home"><Brand /></Link>
        <div className="nav-actions">
          <nav aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/foods">Foods</NavLink>
            <NavLink to="/add-food" className="nav-add">+ Add Food</NavLink>
          </nav>
          <div className="utility-actions">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
