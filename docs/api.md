# Translation API (Translate Gateway)

Base path: `/{API_BASE_PATH}/v1` (default: `/api/v1`).

## Endpoints

- `GET /health` — simple health check. Returns `{ "status": "ok" }`.
- `POST /translate` — translate text.

## POST /translate

Request body (JSON):

- `text: string` — required. Source text.
- `targetLang: string` — required. Target language (ISO 639-1), e.g., `en`, `ru`.
- `sourceLang?: string` — optional. Source language; if omitted, the provider may detect it.
- `provider?: string` — optional. Provider name (defaults to `DEFAULT_PROVIDER`). Supported: `google`, `deepl`, `deepseek`, `openrouter`.
- `model?: string` — optional. Model name for LLM providers (DeepSeek or OpenRouter). If omitted, a provider-specific default will be used (`DEEPSEEK_DEFAULT_MODEL` or `OPENROUTER_DEFAULT_MODEL`).
- `maxLength?: number` — optional. Per-request max input length. Effective limit: `min(TRANSLATE_MAX_TEXT_LENGTH, maxLength)`.

Behavior & format:

- Output format mirrors input. The service detects whether the input contains HTML and passes `text|html` to the provider.
- Language validity is delegated to the provider; the service does not validate language codes.

Headers:

- `Content-Type: application/json`

Response (JSON):

- `translatedText: string`
- `provider: string`
- `model?: string`

Success example (201):

```json
{
  "translatedText": "Hello, world!",
  "provider": "google"
}
```

Examples:

```bash
# Basic text translation (auto-detects format)
curl -s -X POST 'http://localhost:8080/api/v1/translate' \
  -H 'Content-Type: application/json' \
  -d '{
        "text": "Hello, world!",
        "targetLang": "ru"
      }'

# Translate HTML and explicitly select provider
curl -s -X POST 'http://localhost:8080/api/v1/translate' \
  -H 'Content-Type: application/json' \
  -d '{
        "text": "<p>Hello, <b>world</b>!</p>",
        "targetLang": "ru",
        "provider": "google"
      }'

# With per-request length cap
curl -s -X POST 'http://localhost:8080/api/v1/translate' \
  -H 'Content-Type: application/json' \
  -d '{
        "text": "...",
        "targetLang": "en",
        "maxLength": 2000
      }'
```

## Status Codes

- `201 Created` — translation successful (default for POST `/translate`).
- `400 Bad Request` — invalid payload (e.g., `text`/`targetLang` not strings).
- `404 Not Found` — unknown provider.
- `413 Payload Too Large` — input exceeds the effective limit.
- `422 Unprocessable Entity` — provider error (quota/data limits, etc.).
- `503 Service Unavailable` — provider unavailable/timeout.

## GET /health

Simple service liveness/readiness check.

```bash
curl -s 'http://localhost:8080/api/v1/health'
```

Response:

```json
{ "status": "ok" }
```

## Errors

All errors are formatted by a global filter and returned as:

```json
{
  "statusCode": 400,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/v1/translate",
  "method": "POST",
  "message": "...",
  "error": { }
}
```

Common cases:

- `400 Bad Request` — invalid payload (e.g., `text`/`targetLang` not strings).
- `404 Not Found` — unknown provider.
- `413 Payload Too Large` — input exceeds the effective limit.
- `422 Unprocessable Entity` — provider error (quota/data limits, etc.).
- `503 Service Unavailable` — provider unavailable/timeout.

## Limitations

- Format detection is a heuristic based on presence of HTML tags.
- Security (CORS/Auth/Rate Limit) is intentionally not included — enforce at API Gateway.

## API Versioning

- API version is fixed to `v1`.
- For breaking changes, introduce a new versioned path and keep backward compatibility when possible.
