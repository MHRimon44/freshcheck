import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const configurationError = Object.values(firebaseConfig).some(
  (value) => !value || value.startsWith("YOUR_"),
)
  ? "FreshCheck is not configured yet. Please contact the organizer."
  : "";
const app = configurationError ? null : initializeApp(firebaseConfig);
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

// Explicitly opt in on a fake demo project; never point QA at production data.
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true"
) {
  if (!firebaseConfig.projectId?.startsWith("demo-"))
    throw new Error("Emulator mode requires a demo- Firebase project ID.");
  if (db) connectFirestoreEmulator(db, "127.0.0.1", 8080);
  if (auth)
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
}
