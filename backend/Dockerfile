FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
    && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
