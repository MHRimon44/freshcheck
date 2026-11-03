import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import Brand from "../components/Brand";
import { useAuth } from "../hooks/useAuth";
import { authDestination, authError } from "../utils/auth";

type Mode = "sign-in" | "sign-up";
const copy = {
  "sign-in": { title: "Welcome back.", intro: "Your food, your labels, your fresher routine.", action: "Sign In" },
  "sign-up": { title: "A fresh start.", intro: "Create your account and give good food a little more attention.", action: "Create Account" },
};
export default function AuthPage({ mode }: { mode: Mode }) {
  const { user, loading, initializationError, signIn, signUp } = useAuth();
  const location = useLocation(), navigate = useNavigate();
  const [busy,setBusy] = useState(false), [error,setError] = useState("");
  const text = copy[mode];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? ""), password = String(data.get("password") ?? "");
    setBusy(true);setError("");
    try {
      if (mode === "sign-up") await signUp(String(data.get("name") ?? ""),email,password,String(data.get("confirmPassword") ?? ""));
      else await signIn(email,password);
      void navigate(authDestination(location.state),{ replace: true });
    } catch (cause) { setError(authError(cause)); }
    finally { setBusy(false); }
  }
  return <section className="page-section"><div className="container auth-layout"><div className="auth-intro"><Brand/><p className="eyebrow">LESS WASTE, MORE FRESHNESS.</p><h1>{text.title}</h1><p>{text.intro}</p><p className="auth-public-note"><KeyRound size={18} aria-hidden="true"/>Your account manages your foods. Anyone can still scan a container’s QR without signing in.</p></div><div className="food-form auth-form">
    {loading ? <p role="status">Restoring your session…</p> : initializationError ? <p role="alert" className="error-message">{initializationError}</p> : user && !busy ? <><h2>You’re signed in.</h2><p>Continue to your personal food collection.</p><Link className="button primary-button" to={authDestination(location.state)}>Continue<ArrowRight size={17}/></Link></> : <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
      <h2>{text.action}</h2>
      {mode === "sign-up" && <div className="form-group"><label htmlFor="auth-name">Name</label><input id="auth-name" name="name" autoComplete="name" required maxLength={100} placeholder="Your name"/></div>}
      <div className="form-group"><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com"/></div>
      <div className="form-group"><label htmlFor="auth-password">Password</label><input id="auth-password" name="password" type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required minLength={mode === "sign-up" ? 8 : undefined} maxLength={mode === "sign-up" ? 128 : undefined} aria-describedby={mode === "sign-up" ? "password-help" : undefined}/>{mode === "sign-up" && <small id="password-help">Use 8–128 characters. A long, unique passphrase works well.</small>}</div>
      {mode === "sign-up" && <div className="form-group"><label htmlFor="auth-confirm">Confirm Password</label><input id="auth-confirm" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/></div>}
      {error && <p className="error-message" role="alert">{error}</p>}
      <button className="button primary-button full-button" disabled={busy}>{busy ? "Please wait…" : text.action}</button>
    </fieldset></form>}
    <div className="auth-links">{mode === "sign-in" ? <p>Don’t have an account? <Link to="/sign-up" state={location.state}>Create account</Link></p> : <p>Already have an account? <Link to="/sign-in" state={location.state}>Sign in</Link></p>}</div>
  </div></div></section>;
}
