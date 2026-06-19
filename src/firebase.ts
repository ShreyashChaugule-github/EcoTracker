import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ---------------------------------------------------------------------------
// Firebase config — values are baked in at build time by vite.config.ts.
// In production (Docker / Cloud Run) they come from VITE_FIREBASE_* env vars.
// In local development they are read from firebase-applet-config.json by Vite.
// No JSON file import needed here — vite.config.ts handles it all.
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
  authDomain:        window.location.host, // Dynamically use the current host to prevent CSP/framing issues
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     as string,
};

const firestoreDatabaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID as string || "(default)";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore — use named DB if configured (e.g. "ecotracker")
export const db = firestoreDatabaseId && firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
