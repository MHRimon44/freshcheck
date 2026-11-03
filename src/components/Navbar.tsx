import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { authError } from "../utils/auth";

export default function Navbar() {
  const { user, displayName, loading, signOut } = useAuth();
  const [busy,setBusy] = useState(false), [error,setError] = useState("");
  const navigate = useNavigate();
  async function leave() {
    setBusy(true);setError("");
    try { await signOut(); void navigate("/",{replace:true}); }
    catch (cause) { setError(authError(cause)); }
    finally { setBusy(false); }
  }
  return <header className="navbar"><div className="container nav-content">
    <Link to="/" aria-label="FreshCheck home"><Brand/></Link>
    <div className="nav-actions"><nav aria-label="Main navigation"><NavLink to="/">Home</NavLink>
      {loading ? <span className="nav-session" role="status">Loading account…</span> : user ? <>
        <NavLink to="/my-foods">My Foods</NavLink><NavLink to="/add-food" className="nav-add">+ Add Food</NavLink>
      </> : <><NavLink to="/sign-in">Sign In</NavLink><NavLink to="/sign-up" className="nav-add">Create Account</NavLink></>}
    </nav><div className="utility-actions">{!loading && user && <details className="account-menu"><summary>{displayName || user.email || "My account"}</summary><div className="account-popover"><p>{displayName || "My account"}</p><Link className="button secondary-button full-button" to="/profile" onClick={event => event.currentTarget.closest("details")?.removeAttribute("open")}><UserRound className="account-action-icon" size={17} aria-hidden="true"/>My Profile</Link><button className="button danger-button full-button" disabled={busy} onClick={leave}><LogOut className="account-action-icon" size={17} aria-hidden="true"/>{busy ? "Signing out…" : "Sign Out"}</button>{error && <p role="alert" className="error-message">{error}</p>}</div></details>}<ThemeToggle/></div></div>
  </div></header>;
}
