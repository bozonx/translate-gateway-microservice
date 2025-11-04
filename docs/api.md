# Translation API (Translate Gateway)

Base path: `/{API_BASE_PATH}/{API_VERSION}` (default: `/api/v1`).

## Endpoints

- `GET /health` — simple health check. Returns `{ "status": "ok" }`.
- `POST /translate` — translate text.

## POST /translate

Request body (JSON):

- `text: string` — required. Source text.
- `targetLang: string` — required. Target language (ISO 639-1), e.g., `en`, `ru`.
- `sourceLang?: string` — optional. Source language; if omitted, provider may detect it.
- `provider?: string` — optional. Provider name (defaults to `TRANSLATE_DEFAULT_PROVIDER`). Currently supported: `google`.
- `maxLength?: number` — optional. Per-request max input length. Effective limit: `min(TRANSLATE_MAX_TEXT_LENGTH, maxLength)`.

Behavior & format:

- Output format mirrors input. The service detects whether the input contains HTML and passes `text|html` to the provider.
- Language validity is delegated to the provider; the service does not validate language codes.

Response (JSON):

- `translatedText: string`
- `provider: string`

Examples:

```bash
# Basic text translation (auto-detects format)
curl -s -X POST 'http://localhost:80/api/v1/translate' \
  -H 'Content-Type: application/json' \
  -d '{
        "text": "Hello, world!",
        "targetLang": "ru"
      }'

# Translate HTML and explicitly select provider
curl -s -X POST 'http://localhost:80/api/v1/translate' \
  -H 'Content-Type: application/json' \
  -d '{
        "text": "<p>Hello, <b>world</b>!</p>",
        "targetLang": "ru",
        "provider": "google"
      }'

# With per-request length cap
curl -s -X POST 'http://localhost:80/api/v1/translate' \
  -H 'Content-Type: application/json' \
  -d '{
        "text": "...",
        "targetLang": "en",
        "maxLength": 2000
      }'
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

## Environment

- `TRANSLATE_DEFAULT_PROVIDER` — default provider (default: `google`).
- `TRANSLATE_MAX_TEXT_LENGTH` — max input length.
- Google ADC: set `GOOGLE_APPLICATION_CREDENTIALS` if needed (path to service account JSON).

See `README.md` for configuration and Docker details.

## Limitations

- Only Google Translate is supported currently (extensible via provider interface).
- Format detection is a heuristic based on presence of HTML tags.
- Security (CORS/Auth/Rate Limit) is intentionally not included — enforce at API Gateway.

## API Versioning

- Version path is set via `API_VERSION` (default `v1`).
- For breaking changes, add a new versioned path and keep backward compatibility when possible.
