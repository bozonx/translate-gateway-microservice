# Translation API (Translate Gateway)

Base path: `/{API_BASE_PATH}/v1` (default: `/api/v1`).

## Endpoints

- `GET /health` — simple health check. Returns `{ "status": "ok" }`.
- `POST /translate` — translate text.

## POST /translate

Request body (JSON):

- `text: string` — required. Source text.
- `targetLang: string` — required. Target language (ISO 639-1), e.g., `en`, `ru`.
- `sourceLang?: string` — optional. Source language; if omitted, provider may detect it.
- `provider?: string` — необязательно. Имя провайдера (по умолчанию — `TRANSLATE_DEFAULT_PROVIDER`). Поддерживаются: `google`, `deepl`, `deepseek`.
- `model?: string` — необязательно. Имя модели для LLM‑провайдера (например, `deepseek-chat`). Если не указано — используется `DEEPSEEK_DEFAULT_MODEL`.
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

Success example (200):

```json
{
  "translatedText": "Привет, мир!",
  "provider": "google"
}
```

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

## Status Codes

- `200 OK` — translation successful.
- `400 Bad Request` — invalid payload (e.g., `text`/`targetLang` not strings).
- `404 Not Found` — unknown provider.
- `413 Payload Too Large` — input exceeds the effective limit.
- `422 Unprocessable Entity` — provider error (quota/data limits, etc.).
- `503 Service Unavailable` — provider unavailable/timeout.

## GET /health

Simple service liveness/readiness check.

```bash
curl -s 'http://localhost:80/api/v1/health'
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

## Environment

- `TRANSLATE_DEFAULT_PROVIDER` — default provider (default: `google`).
- `TRANSLATE_MAX_TEXT_LENGTH` — max input length.
- `TRANSLATE_ALLOWED_PROVIDERS` — comma-separated allow-list; if empty, all providers are allowed.
- `REQUEST_TIMEOUT_SEC` — timeout for provider requests (default: `60`).
- Google ADC: set `GOOGLE_APPLICATION_CREDENTIALS` if needed (path to service account JSON).
- DeepL: укажите `DEEPL_AUTH_KEY` — ключ API DeepL.
- DeepSeek (OpenAI‑совместимый):
  - `DEEPSEEK_API_KEY` — ключ API
  - `DEEPSEEK_API_BASE_URL` — базовый URL (по умолчанию: `https://api.deepseek.com`)
  - `DEEPSEEK_DEFAULT_MODEL` — модель по умолчанию (например, `deepseek-chat`)
  - `TRANSLATE_LLM_SYSTEM_PROMPT` — шаблон системного сообщения для перевода (`{targetLang}`, `{sourceLang}`, `{format}`)

See `README.md` for configuration and Docker details.

## Limitations

- Format detection is a heuristic based on presence of HTML tags.
- Security (CORS/Auth/Rate Limit) is intentionally not included — enforce at API Gateway.

## API Versioning

- API version is fixed to `v1`.
- For breaking changes, introduce a new versioned path and keep backward compatibility when possible.
