# EcoTracker — Personal Carbon Tracker

[![CI](https://img.shields.io/github/actions/workflow/status/ShreyashChaugule-github/EcoTracker/ci.yml?branch=main&label=CI&style=for-the-badge)](https://github.com/ShreyashChaugule-github/EcoTracker/actions)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

EcoTracker is a full-stack web application for tracking, visualizing, and reducing personal carbon emissions. It combines a React + Vite SPA with a Node.js + Express backend (bundled via esbuild) and integrates with Google Gemini for AI-driven coaching and Firestore for persistence.

This README provides a senior-developer focused overview: architecture diagrams, code flow charts, tech stack, run/build/test/deploy instructions, security recommendations, accessibility and testing checklists.

## Table of Contents
- [Architecture](#architecture)
- [Code Flow & Tech Stack](#code-flow--tech-stack)
- [Local Development](#local-development)
- [Build & Production Run](#build--production-run)
- [Cloud Run Deployment (GCP)](#cloud-run-deployment-gcp)
- [Secrets & Configuration](#secrets--configuration)
- [Testing](#testing)
- [Security & Hardening](#security--hardening)
- [Accessibility](#accessibility)
- [Code Review Checklist](#code-review-checklist)
- [License](#license)

---

## Architecture

```mermaid
graph LR
  subgraph Client
    A[React (Vite) SPA]
  end

  subgraph Server
    B[Node.js + Express]
    B -->|Firestore SDK| D[Cloud Firestore]
    B -->|@google/genai| C[Google Gemini]
    B -->|adm-zip| Z[Dynamic ZIP generator]
  end

  subgraph Cloud
    R[Container Registry] --> S[Cloud Run]
    Secrets[Secret Manager] --> B
    S -->|serves| A
  end

  A -->|REST /api/*| B
  style A fill:#f3f4f6,stroke:#d1d5db
  style B fill:#eef2ff,stroke:#c7d2fe
  style C fill:#fff7ed,stroke:#ffedd5
  style D fill:#ecfccb,stroke:#bbf7d0
```

High level: the client (React) calls REST endpoints on Express. The server reads/writes Firestore, calls Gemini for AI features, and serves the built static files in production. The app is packaged into a container image (multistage Dockerfile included) and deployed to Cloud Run.

## Code Flow & Tech Stack

```mermaid
flowchart TD
  Dev[Developer] -->|dev server| Vite[Vite middleware]
  Vite --> SPA[React components]
  Dev -->|ts dev runner| TSX[tsx (dev runner)]
  TSX --> Server[Express server]
  Server -->|esbuild| Dist[dist/server.cjs]
  Server --> Firestore[Cloud Firestore]
  Server --> Gemini[Google Gemini (@google/genai)]
```

Primary technologies:
- Frontend: React 19, Vite, Tailwind CSS, Recharts, lucide-react icons
- Backend: Node.js 18+, Express, esbuild for bundling
- AI: Google Gemini via `@google/genai`
- Database: Google Cloud Firestore (with local `local_database.json` fallback)
- Dev tools: tsx (dev runner), TypeScript
- CI/CD: Cloud Build / GitHub Actions (suggested)
- Container: Docker multistage image (see `Dockerfile`)

## Local Development

Prerequisites: Node.js >=18, npm, Google Cloud SDK (optional for deploy)

1. Install dependencies

```bash
git clone https://github.com/ShreyashChaugule-github/EcoTracker.git
cd EcoTracker
npm ci
```

2. Run dev server (Vite middleware + Express)

```bash
npm run dev
# Dev server listens on PORT (defaults to 8080)
```

3. Build for production

```bash
npm run build
```

4. Run built server locally (after build)

```bash
node dist/server.cjs
# or use the provided smoke-test: npm test
```

## Build & Production Run (Docker)

Build a production image locally:

```bash
# from project root
docker build -t gcr.io/<PROJECT_ID>/ecotracker:latest .
```

Run locally:

```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e GEMINI_API_KEY="<your_key>" \
  -e FIREBASE_CONFIG='{"projectId":"..."}' \
  gcr.io/<PROJECT_ID>/ecotracker:latest
```

## Cloud Run Deployment (GCP)

This project was prepared to deploy to Cloud Run. Example using project id `ecotracker-499709`:

```bash
# Build & push using Cloud Build
gcloud builds submit --tag gcr.io/ecotracker-499709/ecotracker --project=ecotracker-499709

# Deploy to Cloud Run
gcloud run deploy ecotracker \
  --image gcr.io/ecotracker-499709/ecotracker \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --project ecotracker-499709
```

Inject secrets from Secret Manager (recommended):

```bash
# create secret
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=- --project=ecotracker-499709

# deploy and bind secret as env var
gcloud run deploy ecotracker \
  --image gcr.io/ecotracker-499709/ecotracker \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --platform managed --region us-central1 --project ecotracker-499709
```

Do not commit secrets or `firebase-applet-config.json` into the repository.

## Secrets & Configuration

- The app loads `firebase-applet-config.json` at runtime if present. For production, provide Firestore credentials via environment or Secret Manager.
- Required env variables (recommended):
  - `GEMINI_API_KEY` — Google Gemini API key
  - `PORT` — runtime port (Cloud Run sets this automatically)

## Testing

- `npm test` runs a smoke test that builds the app and checks `/api/health` (see `test/run-healthcheck.js`).
- Recommended: add `jest` + `supertest` for integration tests (endpoints: `/api/profile/:userId`, `/api/carbon/logs`, `/api/health`, AI endpoints).

Suggested test strategy:
- Unit: CO2 conversion functions and reward logic
- Integration: server endpoints using local `local_database.json` fallback
- E2E: build image and run containerized health-check

## Security & Hardening

- Serve secrets from Secret Manager, never embed keys in images.
- In production enable strict `helmet` CSP directives and disable relaxed policies.
- Use least-privilege service account for Cloud Run; restrict Firestore rules in `firestore.rules`.
- Rate-limit AI endpoints (already using `express-rate-limit`).
- Sanitize and validate all incoming payloads (`express-validator` used).

## Accessibility

- Use semantic HTML and ensure critical interactive elements include `aria-*` attributes or `aria-label` where needed.
- Ensure color contrast meets WCAG AA.
- Provide alternative data (tables) or accessible descriptions for charts (Recharts) for screen readers.

## Code Review Checklist (Senior Dev)

- Ensure no secrets in `dist/server.cjs` after build.
- Check Firestore access patterns for excessive reads/writes and optimize with indexes.
- Validate timeouts and error handling for external calls to Gemini (avoid blocking requests).
- Verify `local_database.json` fallback behavior under offline conditions.
- Confirm static assets are served with caching headers in production (server sets `maxAge`).

## Files Of Interest

- `server.ts` — Express server + API endpoints
- `src/` — React frontend (Vite)
- `Dockerfile` — multistage build for Cloud Run
- `.dockerignore` — files excluded from the build context
- `test/run-healthcheck.js` — smoke test script
- `firebase-applet-config.example` — example Firebase config

## Contributing

Please follow the repo's linting and TypeScript rules. Run `npm run lint` before opening PRs. Add unit/integration tests for new features and endpoint changes.

## License

This project is licensed under the MIT License — see `LICENSE`.

---

If you want, I can also add:
- a `cloudbuild.yaml` for reproducible builds,
- a `deploy.sh` script that automates building, pushing, and deploying (with secret binding),
- a basic `jest` + `supertest` test suite template.
