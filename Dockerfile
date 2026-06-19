## Multistage Dockerfile for Cloud Run
# Builder: install deps and build frontend + bundle server
FROM node:20-bullseye AS builder
WORKDIR /app
ENV npm_config_ignore_optional=true

# ---------------------------------------------------------------
# Firebase / Vite build-time env vars
# Pass these when building: docker build --build-arg VITE_FIREBASE_API_KEY=xxx ...
# Or set them in Cloud Build substitutions / CI environment.
# These are baked into the frontend bundle by Vite.
# ---------------------------------------------------------------
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_FIRESTORE_DATABASE_ID

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_FIRESTORE_DATABASE_ID=$VITE_FIRESTORE_DATABASE_ID

# Copy package manifests first for caching
COPY package.json package-lock.json* ./

# Install all deps (including dev) needed for build
RUN npm ci --ignore-optional --prefer-offline --no-audit --progress=false

# Copy source
COPY . .

# Build frontend and bundle server (creates dist/server.cjs)
RUN npm run build

# Runtime image: smaller, production-only
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# Use production environment
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Copy package manifests and install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --prefer-offline --no-audit --progress=false

# Expose the port Cloud Run expects via the $PORT env var (set at runtime)
EXPOSE 8080

# Use a non-root user where possible (node image already creates user 'node')
USER node

# Start the bundled server
CMD ["node", "dist/server.cjs"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:$PORT/health || exit 1
