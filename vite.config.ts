import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

// ---------------------------------------------------------------------------
// Firebase config resolution at BUILD time
// Priority 1: VITE_FIREBASE_* environment variables (set during docker build / CI)
// Priority 2: Local firebase-applet-config.json (developer machine)
// This means the JSON file is NEVER needed inside a production Docker image.
// ---------------------------------------------------------------------------
function resolveFirebaseConfig(): Record<string, string> {
  if (process.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY!,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || '',
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
      firestoreDatabaseId: process.env.VITE_FIRESTORE_DATABASE_ID || '(default)',
    };
  }
  // Local development fallback
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  console.warn(
    '[vite.config] WARNING: No Firebase config found. ' +
      'Set VITE_FIREBASE_API_KEY env vars or provide firebase-applet-config.json.'
  );
  return {};
}

const fbConfig = resolveFirebaseConfig();

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // Inject Firebase config as compile-time constants into the client bundle.
    // import.meta.env.VITE_FB_* will be replaced with the resolved string values.
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(fbConfig.apiKey || ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(fbConfig.authDomain || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(fbConfig.projectId || ''),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(fbConfig.storageBucket || ''),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
        fbConfig.messagingSenderId || ''
      ),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(fbConfig.appId || ''),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(fbConfig.measurementId || ''),
      'import.meta.env.VITE_FIRESTORE_DATABASE_ID': JSON.stringify(
        fbConfig.firestoreDatabaseId || '(default)'
      ),
    },
  };
});
