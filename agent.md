# EcoTracker Agent Instructions

This workspace contains a specialized full-stack implementation running React with Vite in the frontend and Node/Express on port 3000 in the backend.

## 🛠️ Build and Servicing Instructions

1. **Development Runtime**:
   - The development server must run on **host `0.0.0.0`** and **port `3000`**.
   - Dev entrypoint: `tsx server.ts` starts Express, registering the Vite app in middleware mode.

2. **Production Bundle**:
   - Compiles the frontend assets to `dist/` via `vite build`.
   - Bundles the backend code into a single executable CJS file `dist/server.cjs` using `esbuild` with external dependencies mapped safely.
   - Starts utilizing Node natively: `node dist/server.cjs` in Cloud Run tasks.

3. **Database Rules**:
   - Changes to the Firestore schema require modifying `/firebase-blueprint.json` (IR) followed by updating `/firestore.rules` and invoking the build tools.

## ⚙️ Environment Variables

- `GEMINI_API_KEY`: Server-side only API key for Google Gen AI.
- `APP_URL`: Hosted URL of the workspace, dynamically updated.
