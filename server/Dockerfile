# ==========================================================
# ShadowDock Server
# Enterprise Production Dockerfile
# ==========================================================

############################
# Base
############################
FROM node:22-alpine AS base

WORKDIR /app

COPY server/package*.json ./

RUN npm ci

############################
# Development
############################
FROM base AS development

ENV NODE_ENV=development

COPY server/ .

EXPOSE 5000

CMD ["npm","run","dev"]

############################
# Production Dependencies
############################
FROM node:22-alpine AS production-deps

WORKDIR /app

COPY server/package*.json ./

RUN npm ci --omit=dev \
 && npm cache clean --force

############################
# Production
############################
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache wget

RUN addgroup -S nodejs -g 1001 \
 && adduser -S shadowdock -u 1001 -G nodejs

COPY --from=production-deps /app/node_modules ./node_modules

COPY server/ .

RUN chown -R shadowdock:nodejs /app

USER shadowdock

EXPOSE 5000

HEALTHCHECK --interval=30s \
            --timeout=5s \
            --start-period=20s \
            --retries=3 \
CMD wget --spider -q http://127.0.0.1:5000/api/v1/health || exit 1

CMD ["npm","start"]
