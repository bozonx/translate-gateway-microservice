# CHANGELOG

## Unreleased

- Configuration changes:
  - `TRANSLATE_MAX_TEXT_LENGTH` default changed from `5000` to `100000`
  - `HTTP_REQUEST_BODY_LIMIT_MB` default changed from `10` to `3`
  - Renamed `TRANSLATE_DEFAULT_PROVIDER` to `DEFAULT_PROVIDER`
  - Renamed `TRANSLATE_ALLOWED_PROVIDERS` to `ALLOWED_PROVIDERS`
  - Renamed `TRANSLATE_LLM_SYSTEM_PROMPT` to `LLM_SYSTEM_PROMPT`

- Default listen port unified to `8080` across dev/prod and Docker
  - Changed app default fallback from `80` to `8080`
  - Updated `.env.*.example` to `LISTEN_PORT=8080`
  - Dockerfile `EXPOSE 8080` and healthcheck defaults now use 8080
  - docker-compose maps `8080:8080`
  - README and API docs examples updated to `http://localhost:8080/...`

- README refocused for production usage (dev instructions removed)
- Added `docs/dev.md` with development and dev-mode instructions
- Clarified production URLs and Docker Compose example in README
- Environment section updated to mention `TZ` and that `.env.production.example` is the source of truth
- Added Translate module: REST endpoint `POST /{API_BASE_PATH}/v1/translate`
- Implemented Google Translate provider and provider abstraction
- Added `translation.config.ts` with `DEFAULT_PROVIDER`, `TRANSLATE_MAX_TEXT_LENGTH`
- Tests: unit (DTO, service) and e2e (translate, health)
- README rewritten in English, production-focused
- Added API documentation (docs/api.md); expanded with status codes and examples
 - New env: `ALLOWED_PROVIDERS` (comma-separated allow-list; empty = all allowed)
 - New env: `REQUEST_TIMEOUT_SEC` (default 60s) for provider calls; service returns 503 on timeout
- Added DeepL provider support (set `provider: "deepl"` in request)
- New env: `DEEPL_AUTH_KEY` for DeepL API (Free or Pro)
- New env: `HTTP_REQUEST_BODY_LIMIT_MB` (default `10`) to configure Fastify body parser max body size
- Added DeepSeek LLM provider (`provider: "deepseek"`) via OpenAI‑compatible SDK
  - Request supports optional `model` field; response returns `model` when available
  - New env: `DEEPSEEK_API_KEY`, `DEEPSEEK_API_BASE_URL` (default `https://api.deepseek.com`), `DEEPSEEK_DEFAULT_MODEL` (default `deepseek-chat`)
  - New env: `LLM_SYSTEM_PROMPT` — system prompt template for translation

## 0.15.0 — Boilerplate refactor

- Removed legacy STT, GraphQL, and Auth features
- Kept only the Health module (simple health-check)
- Simplified environment configs (`.env.*`)
- Updated `AppModule` and logging (service: `nestjs-boilerplate`)
- Cleaned and rebuilt tests (unit + e2e for health only)
- Simplified `docker-compose.yml` to a minimal local example
- Updated README.md (ru)
- Removed outdated docs in `docs/` (STT/Auth/GraphQL)
