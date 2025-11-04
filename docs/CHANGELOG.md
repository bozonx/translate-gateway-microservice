# CHANGELOG

## Unreleased

- README refocused for production usage (dev instructions removed)
- Added `docs/dev.md` with development and dev-mode instructions
- Clarified production URLs and Docker Compose example in README
- Environment section updated to mention `TZ` and that `.env.production.example` is the source of truth
- Added Translate module: REST endpoint `POST /{API_BASE_PATH}/v1/translate`
- Implemented Google Translate provider and provider abstraction
- Added `translation.config.ts` with `TRANSLATE_DEFAULT_PROVIDER`, `TRANSLATE_MAX_TEXT_LENGTH`
- Tests: unit (DTO, service) and e2e (translate, health)
- README rewritten in English, production-focused
- Added API documentation (docs/api.md); expanded with status codes and examples
 - New env: `TRANSLATE_ALLOWED_PROVIDERS` (comma-separated allow-list; empty = all allowed)
 - New env: `REQUEST_TIMEOUT_SEC` (default 60s) for provider calls; service returns 503 on timeout

## 0.15.0 — Boilerplate refactor

- Removed legacy STT, GraphQL, and Auth features
- Kept only the Health module (simple health-check)
- Simplified environment configs (`.env.*`)
- Updated `AppModule` and logging (service: `nestjs-boilerplate`)
- Cleaned and rebuilt tests (unit + e2e for health only)
- Simplified `docker-compose.yml` to a minimal local example
- Updated README.md (ru)
- Removed outdated docs in `docs/` (STT/Auth/GraphQL)
