import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Firebase config — values are baked in at build time by vite.config.ts.
// In production (Docker / Cloud Run) they come from VITE_FIREBASE_* env vars.
// In local development they are read from firebase-applet-config.json by Vite.
// No JSON file import needed here — vite.config.ts handles it all.
// ---------------------------------------------------------------------------
// Only initialize Firebase when real config keys are present.
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST_WORKER_ID !== undefined;
const hasFirebaseConfig =
  !isTestEnv &&
  typeof import.meta !== 'undefined' &&
  Boolean(import.meta.env?.VITE_FIREBASE_API_KEY);

let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: typeof window !== 'undefined' ? window.location.host : 'localhost',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const firestoreDatabaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || '(default)';

  // Initialize Firebase App
  const app = initializeApp(firebaseConfig);

  // Initialize Firestore — use named DB if configured (e.g. "ecotracker")
  db =
    firestoreDatabaseId && firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firestoreDatabaseId)
      : getFirestore(app);

  // Initialize Firebase Auth
  auth = getAuth(app);

  // Google Auth Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export { db, auth, googleProvider };
