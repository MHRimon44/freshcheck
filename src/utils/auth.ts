export function authError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use":
      "An account already uses this email. Sign in to your existing account.",
    "auth/requires-recent-login": "Please sign in again before changing your password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password":
      "Choose a stronger password that meets the account requirements.",
    "auth/password-does-not-meet-requirements":
      "Your password does not meet this project's password policy.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a while before trying again.",
    "auth/network-request-failed":
      "Couldn't connect. Check your internet connection and try again.",
    "auth/operation-not-allowed":
      "Account sign-in is not enabled yet. Please contact FreshCheck support.",
    "auth/user-disabled":
      "This account is disabled. Please contact FreshCheck support.",
    "auth/web-storage-unsupported":
      "Your browser is blocking account storage. Allow browser storage and try again.",
  };
  return (
    messages[code] ??
    (code
      ? "We couldn't complete this account request. Please try again."
      : error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.")
  );
}
export function validateRegistration(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): void {
  if (!name.trim() || name.trim().length > 100)
    throw new Error("Enter a name of 1–100 characters.");
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.trim().length > 254
  )
    throw new Error("Enter a valid email address.");
  validatePassword(password, confirmPassword);
}
// Only resume known protected destinations; never trust an arbitrary redirect URL.
export function authDestination(state: unknown): string {
  if (typeof state !== "object" || state === null || !("from" in state))
    return "/my-foods";
  return state.from === "/add-food" || state.from === "/profile" ? state.from : "/my-foods";
}

export function validatePassword(password: string, confirmPassword: string): void {
  if (password.length < 8 || password.length > 128)
    throw new Error("Use a password between 8 and 128 characters.");
  if (password !== confirmPassword)
    throw new Error("Your passwords do not match.");
}
