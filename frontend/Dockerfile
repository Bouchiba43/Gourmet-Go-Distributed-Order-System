# ── Dependencies ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
# Install pnpm 10 explicitly — pnpm 11 requires Node ≥ 22 which this image lacks.
# npm install is more reliable than corepack inside Docker for pinned versions.
RUN npm install -g pnpm@10 --quiet
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Build ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN npm install -g pnpm@10 --quiet
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* variables are baked into the JS bundle at build time.
# Pass the orchestrator URL as a build arg so docker-compose can override it.
ARG NEXT_PUBLIC_API_URL=http://localhost:8083
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
