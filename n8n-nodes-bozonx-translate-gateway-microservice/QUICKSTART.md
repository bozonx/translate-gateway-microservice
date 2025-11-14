# Quick Start Guide

## 1. Install the Node

### In n8n (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter: `n8n-nodes-bozonx-translate-gateway-microservice`
5. Click **Install**
6. Restart n8n

### Via npm

```bash
npm install n8n-nodes-bozonx-translate-gateway-microservice
```

## 2. Start the Microservice

### Using Docker (Easiest)

```bash
docker run -d \
  --name translate-gateway \
  -p 8080:8080 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp-service-account.json \
  -v /path/to/your/gcp-credentials.json:/secrets/gcp-service-account.json \
  bozonx/translate-gateway-microservice:latest
```

### Test the Service

```bash
curl http://localhost:8080/api/v1/health
# Expected: {"status":"ok"}
```

## 3. Configure Credentials in n8n

1. In n8n, create a new credential
2. Select **Bozonx Microservices API**
3. Fill in:
   - **Gateway URL**: `http://localhost:8080` (or your service URL)
   - **API Token**: _(leave empty if no auth)_
4. Save

## 4. Use the Node

### Simple Example

1. Add **Translate Gateway** node to your workflow
2. Configure:
   - **Credentials**: Select the credential you created
   - **Text**: `Hello, world!`
   - **Target Language**: `ru`
3. Execute

**Result:**
```json
{
  "translatedText": "Привет, мир!",
  "provider": "google"
}
```

### HTML Example

1. **Text**: `<p>Hello, <b>world</b>!</p>`
2. **Target Language**: `es`
3. **Provider**: `deepl`

**Result:**
```json
{
  "translatedText": "<p>Hola, <b>mundo</b>!</p>",
  "provider": "deepl"
}
```

## 5. Supported Providers

| Provider | Setup Required |
|----------|----------------|
| **Google** | `GOOGLE_APPLICATION_CREDENTIALS` env var |
| **DeepL** | `DEEPL_AUTH_KEY` env var |
| **DeepSeek** | `DEEPSEEK_API_KEY` env var |
| **OpenRouter** | `OPENROUTER_API_KEY` env var |

### Configure Providers

Edit your microservice environment variables:

```bash
# For DeepL
docker run -d -p 8080:8080 \
  -e DEEPL_AUTH_KEY=your-api-key-here \
  bozonx/translate-gateway-microservice:latest

# For DeepSeek
docker run -d -p 8080:8080 \
  -e DEEPSEEK_API_KEY=your-api-key-here \
  bozonx/translate-gateway-microservice:latest
```

## 6. Common Issues

### Node Not Found
- Restart n8n after installation
- Check **Settings** → **Community Nodes** for installation status

### Connection Error
- Verify microservice is running: `curl http://localhost:8080/api/v1/health`
- Check Gateway URL in credentials (should NOT include `/api/v1`)
- Ensure port 8080 is accessible

### Translation Error (422)
- Provider API key not configured
- Unsupported language code
- Provider quota exceeded

### Timeout Error (503)
- Provider is slow or unavailable
- Increase `REQUEST_TIMEOUT_SEC` in microservice env vars

## 7. Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [EXAMPLES.md](./EXAMPLES.md) for more use cases
- Review [DEVELOPMENT.md](./DEVELOPMENT.md) if you want to contribute

## Need Help?

- [Microservice Documentation](https://github.com/bozonx/translate-gateway-microservice)
- [API Reference](https://github.com/bozonx/translate-gateway-microservice/blob/main/docs/api.md)
- [n8n Community Forum](https://community.n8n.io/)
