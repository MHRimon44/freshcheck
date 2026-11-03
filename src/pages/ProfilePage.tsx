import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { authError } from "../utils/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  return user ? <ProfileSettings key={user.uid} /> : null;
}

function ProfileSettings() {
  const { user, displayName, updateName, changePassword } = useAuth();
  const [name, setName] = useState(displayName);
  const [busy, setBusy] = useState<"name" | "password" | null>(null);
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("name"); setNameError(""); setNameSuccess("");
    try { await updateName(name); setName(name.trim()); setNameSuccess("Your display name has been updated."); }
    catch (error) { setNameError(authError(error)); }
    finally { setBusy(null); }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy("password"); setPasswordError(""); setPasswordSuccess("");
    try {
      await changePassword(String(data.get("currentPassword") ?? ""), String(data.get("newPassword") ?? ""), String(data.get("confirmation") ?? ""));
      form.reset();
      setPasswordSuccess("Your password has been changed. Use the new password the next time you sign in.");
    } catch (error) { setPasswordError(authError(error)); }
    finally { setBusy(null); }
  }

  return <section className="page-section"><div className="container small-container">
    <div className="section-heading left"><p className="eyebrow">YOUR ACCOUNT</p><h1>My Profile</h1><p>Make yourself at home. Keep your name and account security up to date.</p></div>
    <form className="food-form profile-form" onSubmit={saveName} aria-busy={busy === "name"}><fieldset disabled={busy !== null}>
      <h2>Personal details</h2><p className="profile-email">{user?.email}</p>
      <div className="form-group"><label htmlFor="profile-name">Display name</label><input id="profile-name" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></div>
      {nameError && <p role="alert" className="error-message">{nameError}</p>}{nameSuccess && <p role="status" className="auth-success">{nameSuccess}</p>}
      <button className="button primary-button" disabled={busy !== null}>{busy === "name" ? "Saving…" : "Save Name"}</button>
    </fieldset></form>
    <form className="food-form profile-form" onSubmit={savePassword} aria-busy={busy === "password"}><fieldset disabled={busy !== null}>
      <h2>Change password</h2><p>Confirm your current password to secure this change.</p>
      <input name="username" type="hidden" autoComplete="username" value={user?.email || ""} readOnly />
      <div className="form-group"><label htmlFor="current-password">Current password</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required /></div>
      <div className="form-group"><label htmlFor="new-password">New password</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} aria-describedby="new-password-help"/><small id="new-password-help">Use 8–128 characters. Choose a long, unique passphrase.</small></div>
      <div className="form-group"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/></div>
      {passwordError && <p role="alert" className="error-message">{passwordError}</p>}{passwordSuccess && <p role="status" className="auth-success">{passwordSuccess}</p>}
      <button className="button primary-button" disabled={busy !== null}>{busy === "password" ? "Updating…" : "Change Password"}</button>
    </fieldset></form>
  </div></section>;
}
