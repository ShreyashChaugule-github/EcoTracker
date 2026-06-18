## Multistage Dockerfile for Cloud Run
# Builder: install deps and build frontend + bundle server
FROM node:18-bullseye AS builder
WORKDIR /app

# Copy package manifests first for caching
COPY package.json package-lock.json* ./

# Install all deps (including dev) needed for build
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source
COPY . .

# Build frontend and bundle server (creates dist/server.cjs)
RUN npm run build

# Runtime image: smaller, production-only
FROM node:18-bullseye-slim AS runner
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
