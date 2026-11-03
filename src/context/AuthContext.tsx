import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, configurationError } from "../config/firebase";
import { ensureUserProfile } from "../services/userService";
import { validatePassword, validateRegistration } from "../utils/auth";

import { AuthContext } from "./authState";
function configuredAuth() {
  if (!auth) throw new Error(configurationError);
  return auth;
}
// Initialized once, also across StrictMode effect replays.
let persistence: Promise<void> | undefined;
function prepareSession() {
  return (persistence ??= setPersistence(
    configuredAuth(),
    browserLocalPersistence,
  ).catch((error) => {
    persistence = undefined;
    throw error;
  }));
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [displayName, setDisplayName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [initializationError, setInitializationError] =
    useState(configurationError);
  const [profileError, setProfileError] = useState("");
  useEffect(() => {
    if (!auth) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void prepareSession()
      .then(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(
          configuredAuth(),
          (current) => {
            setUser(current);
            setDisplayName(current?.displayName || "");
            setProfileError("");
            setLoading(false);
          },
          () => {
            setInitializationError(
              "Your account session could not be restored. Please reload and try again.",
            );
            setLoading(false);
          },
        );
      })
      .catch(() => {
        if (active) {
          setInitializationError(
            "Your browser could not restore a persistent session. Allow browser storage and reload.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  const repairProfile = useCallback(async () => {
    const current = configuredAuth().currentUser;
    if (!current) return;
    try {
      await ensureUserProfile(current, true);
      setProfileError("");
    } catch {
      setProfileError(
        "Your account is signed in, but its profile could not be saved. You can retry without creating another account.",
      );
    }
  }, []);
  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
    ) => {
      validateRegistration(name, email, password, confirmPassword);
      await prepareSession();
      const { user: created } = await createUserWithEmailAndPassword(
        configuredAuth(),
        email.trim(),
        password,
      );
      try {
        await updateProfile(created, { displayName: name.trim() });
        setUser(configuredAuth().currentUser);
        setDisplayName(created.displayName || "");
        await ensureUserProfile(created);
        setProfileError("");
      } catch {
        // Auth creation cannot be atomic with Firestore. Keep the usable account and offer recovery.
        setProfileError(
          "Your account was created, but its profile could not be saved. Retry profile setup below; do not register again.",
        );
      }
    },
    [],
  );
  const signIn = useCallback(
    async (email: string, password: string) => {
      await prepareSession();
      await signInWithEmailAndPassword(
        configuredAuth(),
        email.trim(),
        password,
      );
      await repairProfile();
    },
    [repairProfile],
  );
  const signOut = useCallback(async () => {
    await firebaseSignOut(configuredAuth());
    setProfileError("");
  }, []);
  const updateName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error("Enter a name of 1–100 characters.");
    const current = configuredAuth().currentUser;
    if (!current) throw new Error("Please sign in again to update your profile.");
    await updateProfile(current, { displayName: trimmed });
    setDisplayName(trimmed);
    try { await ensureUserProfile(current, true); setProfileError(""); }
    catch {
      setProfileError("Your name changed, but the profile copy could not be saved. Retry profile setup to finish syncing it.");
      throw new Error("Your account name changed. Saving the profile copy failed; use Retry profile setup to finish.");
    }
  }, []);
  const changePassword = useCallback(async (currentPassword: string, password: string, confirmation: string) => {
    validatePassword(password, confirmation);
    if (!currentPassword) throw new Error("Enter your current password.");
    const current = configuredAuth().currentUser;
    if (!current?.email) throw new Error("Please sign in again to change your password.");
    await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, currentPassword));
    await updatePassword(current, password);
  }, []);
  const value = useMemo(
    () => ({
      user,
      displayName,
      updateName,
      changePassword,
      loading,
      initializationError,
      profileError,
      signUp,
      signIn,
      signOut,
      repairProfile,
    }),
    [
      user,
      displayName,
      updateName,
      changePassword,
      loading,
      initializationError,
      profileError,
      signUp,
      signIn,
      signOut,
      repairProfile,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
