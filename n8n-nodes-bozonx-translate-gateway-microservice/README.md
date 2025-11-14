# n8n Node: Bozonx Translate Gateway Microservice

This is an n8n community node that provides text translation capabilities via the [Translate Gateway microservice](https://github.com/bozonx/translate-gateway-microservice).

## Features

- **Multiple Translation Providers**: Google Cloud Translation, DeepL, DeepSeek LLM, OpenRouter LLM
- **Auto-detection**: Source language can be auto-detected by the provider
- **HTML Support**: Automatically preserves HTML tags during translation
- **Flexible Configuration**: Choose provider, model, and max length per request
- **Error Handling**: Built-in error handling with continue-on-fail support

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-bozonx-translate-gateway-microservice`
4. Agree to the risks and install

### Manual Installation

```bash
npm install n8n-nodes-bozonx-translate-gateway-microservice
```

For Docker-based n8n installations, add to your Dockerfile:

```dockerfile
RUN npm install -g n8n-nodes-bozonx-translate-gateway-microservice
```

## Prerequisites

You need a running instance of the [Translate Gateway microservice](https://github.com/bozonx/translate-gateway-microservice).

### Quick Start with Docker

```bash
docker run -d \
  -p 8080:8080 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp-service-account.json \
  -v /path/to/gcp-credentials.json:/secrets/gcp-service-account.json \
  bozonx/translate-gateway-microservice:latest
```

See the [microservice documentation](https://github.com/bozonx/translate-gateway-microservice) for detailed setup instructions.

## Configuration

### Credentials

Create a new credential of type **Bozonx Microservices API**:

- **Gateway URL**: Base URL of your microservice (e.g., `http://localhost:8080`)
- **API Token** (optional): Bearer token if your API Gateway requires authentication

### Node Parameters

#### Required Fields

- **Text**: Source text to translate (supports plain text and HTML)
- **Target Language**: Target language code (ISO 639-1), e.g., `en`, `ru`, `es`, `fr`, `de`

#### Optional Fields

- **Source Language**: Source language code (ISO 639-1). If omitted, the provider may auto-detect it
- **Provider**: Translation provider to use
  - `Default`: Use the default provider configured in the microservice
  - `Google`: Google Cloud Translation API
  - `DeepL`: DeepL Translation API
  - `DeepSeek`: DeepSeek LLM (OpenAI-compatible)
  - `OpenRouter`: OpenRouter LLM (OpenAI-compatible)
- **Model**: Model name for LLM providers (DeepSeek or OpenRouter). If omitted, provider-specific default will be used
- **Max Length**: Per-request max input length (characters). 0 means use service default

## Usage Examples

### Basic Translation

Translate text from auto-detected language to English:

```
Text: "Привет, мир!"
Target Language: en
```

Output:
```json
{
  "translatedText": "Hello, world!",
  "provider": "google"
}
```

### HTML Translation

Translate HTML content while preserving tags:

```
Text: "<p>Bonjour, <b>monde</b>!</p>"
Target Language: en
Provider: deepl
```

Output:
```json
{
  "translatedText": "<p>Hello, <b>world</b>!</p>",
  "provider": "deepl"
}
```

### LLM Translation with Custom Model

Use DeepSeek with a specific model:

```
Text: "Hello, world!"
Target Language: ru
Source Language: en
Provider: deepseek
Model: deepseek-chat
```

Output:
```json
{
  "translatedText": "Привет, мир!",
  "provider": "deepseek",
  "model": "deepseek-chat"
}
```

## Error Handling

The node supports n8n's **Continue On Fail** option. When enabled, errors are returned as:

```json
{
  "error": "Error message"
}
```

Common error codes:
- `400`: Invalid payload (e.g., missing required fields)
- `404`: Unknown provider
- `413`: Input text exceeds max length
- `422`: Provider error (quota limits, unsupported language, etc.)
- `503`: Provider unavailable or timeout

## Supported Providers

| Provider | Type | Requirements |
|----------|------|--------------|
| Google | Translation API | `GOOGLE_APPLICATION_CREDENTIALS` |
| DeepL | Translation API | `DEEPL_AUTH_KEY` |
| DeepSeek | LLM | `DEEPSEEK_API_KEY` |
| OpenRouter | LLM | `OPENROUTER_API_KEY` |

See the [microservice configuration](https://github.com/bozonx/translate-gateway-microservice#configuration) for provider setup details.

## API Reference

The node calls `POST /api/v1/translate` endpoint. See the [API documentation](https://github.com/bozonx/translate-gateway-microservice/blob/main/docs/api.md) for complete details.

## Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm build:watch
```

### Lint

```bash
pnpm lint
pnpm lint:fix
```

### Publish

```bash
pnpm publish:npm
```

## Resources

- [Translate Gateway Microservice](https://github.com/bozonx/translate-gateway-microservice)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [API Documentation](https://github.com/bozonx/translate-gateway-microservice/blob/main/docs/api.md)

## License

MIT

## Author

Ivan Kozyrin (ipkozyrin@gmail.com)
