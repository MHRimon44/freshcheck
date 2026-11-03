import { Link, NavLink } from 'react-router-dom';
import Brand from './Brand';
export default function Navbar() { return <header className="navbar"><div className="container nav-content"><Link to="/" aria-label="FreshCheck home"><Brand/></Link><nav aria-label="Main navigation"><NavLink to="/">Home</NavLink><NavLink to="/foods">Foods</NavLink><NavLink to="/add-food" className="nav-add">+ Add Food</NavLink></nav></div></header>; }
