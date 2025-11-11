ARG NODE_MAJOR=22
FROM node:${NODE_MAJOR}-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV LISTEN_HOST=0.0.0.0
ENV LISTEN_PORT=80
ENV TZ=UTC
ENV LOG_LEVEL=warn

# Install pnpm
RUN corepack enable

# Copy runtime files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --prefer-offline || pnpm install --prod --prefer-offline

# Copy pre-built application
COPY dist ./dist

EXPOSE 80

# Built-in container healthcheck
# Uses env variables with defaults: LISTEN_PORT (80) and API_BASE_PATH (api)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${LISTEN_PORT:-80}/${API_BASE_PATH:-api}/v1/health || exit 1

CMD ["node", "dist/src/main.js"]
