import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, configurationError } from '../config/firebase';
export default function OrganizerAccess() {
 const [user,setUser] = useState<User | null>(null), [ready,setReady] = useState(false), [error,setError] = useState(''), [busy,setBusy] = useState(false);
 useEffect(()=> { if (!auth) return; return onAuthStateChanged(auth,u=>{setUser(u);setReady(true);}); },[]);
 async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!auth) return; const data = new FormData(event.currentTarget); setBusy(true);setError('');try { await signInWithEmailAndPassword(auth,String(data.get('email')),String(data.get('password'))); } catch {setError('Sign-in failed. Check your organizer credentials and connection.');} finally {setBusy(false);} }
 if (!auth) return <p role="alert" className="error-message">{configurationError}</p>;
 if (!ready) return <p role="status">Checking organizer access…</p>;
 if (user) return <div className="access-panel"><span>Signed in as {user.email}</span><button className="text-button" onClick={()=>{ if (!auth) return; void signOut(auth).catch(()=>setError('Could not sign out. Please retry.')); }}>Sign out</button>{error && <p role="alert">{error}</p>}</div>;
 return <details className="access-panel" open><summary>Organizer sign-in</summary><p>Visitors can scan and view food without signing in. Adding food requires an approved organizer account.</p><form onSubmit={submit} className="access-form"><label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label><button className="button secondary-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>{error && <p role="alert" className="error-message">{error}</p>}</form></details>;
}
