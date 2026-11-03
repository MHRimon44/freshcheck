import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
 apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
 authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
 projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
 storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
 messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
 appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const configurationError = Object.values(firebaseConfig).some(value => !value || value.startsWith('YOUR_')) ? 'FreshCheck is not configured yet. Please contact the organizer.' : '';
const app = configurationError ? null : initializeApp(firebaseConfig);
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
