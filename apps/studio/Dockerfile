# apps/studio/Dockerfile

# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (use lockfile if present)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production deps
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy build output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]