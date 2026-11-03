import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db, configurationError } from "../config/firebase";

// Idempotent recovery: preserve existing profiles and their original timestamps.
export async function ensureUserProfile(user: User, syncName = false): Promise<void> {
  if (!db) throw new Error(configurationError);
  const reference = doc(db, "users", user.uid);
  await runTransaction(db, async (transaction) => {
    const profile = await transaction.get(reference);
    if (profile.exists() && syncName) transaction.update(reference, { displayName: user.displayName || "FreshCheck user" });
    if (!profile.exists())
      transaction.set(reference, {
        uid: user.uid,
        displayName: (
          user.displayName ||
          user.email?.split("@")[0] ||
          "FreshCheck user"
        ).slice(0, 100),
        email: user.email || "",
        createdAt: serverTimestamp(),
      });
  });
}
