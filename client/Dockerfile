# ==========================================================
# ShadowDock Client
# Enterprise Production Dockerfile
# ==========================================================

############################
# Base
############################
FROM node:22-alpine AS base

WORKDIR /app

COPY client/package*.json ./

RUN npm ci

############################
# Development
############################
FROM base AS development

ENV NODE_ENV=development

COPY client/ .

EXPOSE 5173

CMD ["npm","run","dev","--","--host","0.0.0.0"]

############################
# Build
############################
FROM base AS build

ENV NODE_ENV=production

COPY client/ .

RUN npm run build

############################
# Production
############################
FROM nginx:1.29-alpine AS production

RUN apk add --no-cache wget

RUN rm -f /etc/nginx/conf.d/default.conf

COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s \
            --timeout=5s \
            --start-period=20s \
            --retries=3 \
CMD wget --spider -q http://127.0.0.1/ || exit 1

CMD ["nginx","-g","daemon off;"]
