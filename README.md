# Translate Gateway Microservice (NestJS + Fastify)

Production-ready microservice exposing a unified REST API for text translation. Built with NestJS + Fastify, JSON logging, and clean configuration.

## Features

- Health endpoint `/{API_BASE_PATH}/v1/health`
- Unified translate endpoint `/{API_BASE_PATH}/v1/translate`
- Pino logging (JSON in production)
- Global error filter with consistent error shape
- Provider abstraction (Google Translate, DeepL)
- Docker-ready
- Unit and E2E tests

## Production Quick Start

Requirements:

- Node.js 22+
- pnpm 10+

```bash
# 1) Install dependencies
pnpm install

# 2) Prepare environment (production)
cp env.production.example .env.production
# Optionally set Google ADC credentials path if needed
# export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# 3) Build and run (production)
pnpm build
pnpm start:prod
```

Default URL (prod): `http://localhost:80/api/v1`
Docker Compose: `http://localhost:8080/api/v1`

## Documentation

- API: [docs/api.md](./docs/api.md)
- Development: [docs/dev.md](./docs/dev.md)
- Changelog: [docs/CHANGELOG.md](./docs/CHANGELOG.md)

## Configuration

Source of truth: `.env.production.example`.

- App
  - `NODE_ENV` = `production|development|test`
  - `LISTEN_HOST` (e.g. `0.0.0.0`)
  - `LISTEN_PORT` (e.g. `80`)
  - `API_BASE_PATH` (default `api`)
  - `LOG_LEVEL` = `trace|debug|info|warn|error|fatal|silent` (prod default `warn`)
  - `TZ` (default `UTC`)
  - `HTTP_REQUEST_BODY_LIMIT_MB` (default `10`) — max HTTP request body size (MB) for Fastify body parser
- Translation
  - `TRANSLATE_DEFAULT_PROVIDER` (default `google`)
  - `TRANSLATE_MAX_TEXT_LENGTH` (default `5000`) — hard cap for input text length
  - `TRANSLATE_ALLOWED_PROVIDERS` — comma-separated allow-list; if empty, all providers are allowed
  - `REQUEST_TIMEOUT_SEC` (default `60`) — timeout for provider requests
- Google Translate (ADC)
  - `GOOGLE_APPLICATION_CREDENTIALS` — path to service account JSON (if required)
- DeepL
  - `DEEPL_AUTH_KEY` — DeepL API key (Free or Pro)

Notes:
- This service intentionally omits CORS, Auth, and Rate Limiting. Enforce them at your API Gateway.

## API Overview

- POST `/{API_BASE_PATH}/v1/translate`
  - Request body:
    - `text: string` (required)
    - `targetLang: string` (required) — ISO 639-1
    - `sourceLang?: string` (optional)
    - `provider?: string` (optional) — overrides default provider; options: `google`, `deepl`
    - `maxLength?: number` (optional) — per-request cap; effective limit is `min(ENV, maxLength)`
  - Response body:
    - `translatedText: string`
    - `provider: string`
  - Behavior:
    - Output format mirrors input. A simple heuristic detects HTML and passes `text|html` to the provider.
    - Language validity is delegated to provider; this service does not validate language codes.

Example:

```bash
curl -s -X POST 'http://localhost:80/api/v1/translate' \
  -H 'Content-Type: application/json' \
  -d '{
        "text": "<p>Hello, world!</p>",
        "targetLang": "ru"
      }'
```

## Docker

- The Dockerfile expects a prebuilt `dist/` (run `pnpm build` first).
- See `docker/docker-compose.yml` as a reference. Example env to add:

```yaml
services:
  translate-gateway-microservice:
    image: ghcr.io/bozonx/translate-gateway-microservice:latest
    ports:
      - '8080:80'
    environment:
      - NODE_ENV=production
      - LISTEN_HOST=0.0.0.0
      - LISTEN_PORT=80
      - API_BASE_PATH=api
      - LOG_LEVEL=warn
      - TRANSLATE_DEFAULT_PROVIDER=google
      - TRANSLATE_MAX_TEXT_LENGTH=5000
      # If using Google ADC credentials inside container
      # - GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp-service-account.json
    # Example secret mount for ADC
    # volumes:
    #   - ./secrets/gcp-service-account.json:/secrets/gcp-service-account.json:ro
```

## Observability

- Logs: Pino JSON in production; safe redaction for `authorization` and `x-api-key` headers.
- Health: `GET /{API_BASE_PATH}/v1/health`
- Graceful shutdown enabled.

## Scaling & Operations

- Stateless service; scale horizontally behind a load balancer.
- Use the health endpoint for readiness checks (Kubernetes, Swarm, etc.).
- Enforce Auth, CORS, and Rate Limiting at your API Gateway.

## Limitations

- Providers: Google Translate and DeepL (extensible via provider interface).
- Format detection is heuristic (basic HTML tag detection).
- No built-in security features; must be handled at the API Gateway layer.

# Development guide

Development documentation has moved to the STT Gateway repository to avoid duplication.

Please see: `stt-gateway-microservice/docs/dev.md`.

## License

MIT
