# Development Guide

## Prerequisites

- Node.js 18+
- pnpm
- n8n instance (for testing)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Build the node:
```bash
pnpm build
```

## Development Workflow

### Watch Mode

For active development with auto-rebuild:

```bash
pnpm build:watch
```

### Testing Locally

Link the node to your local n8n instance:

```bash
# In this directory
pnpm link

# In your n8n installation directory
pnpm link n8n-nodes-bozonx-translate-gateway-microservice
```

Then restart n8n. The node will appear in the nodes panel.

### Linting

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

## Project Structure

```
n8n-nodes-bozonx-translate-gateway-microservice/
├── credentials/
│   └── BozonxMicroservicesApi.credentials.ts  # API credentials definition
├── nodes/
│   └── TranslateGateway/
│       ├── BozonxTranslateGateway.node.ts     # Main node implementation
│       └── translate-gateway.svg              # Node icon
├── package.json                                # Package configuration
└── README.md                                   # User documentation
```

## Node Implementation Details

### Key Components

1. **Node Description** (`INodeTypeDescription`):
   - Defines node metadata (name, icon, version)
   - Specifies input/output configuration
   - Declares required credentials
   - Defines node parameters (fields)

2. **Execute Function**:
   - Processes each input item
   - Builds API request body
   - Makes authenticated HTTP request
   - Handles errors with continue-on-fail support

### Parameter Types

- **String fields**: `text`, `targetLang`, `sourceLang`, `model`
- **Options field**: `provider` (dropdown with predefined values)
- **Number field**: `maxLength` (with min value validation)

### Display Options

The `model` field uses `displayOptions` to show only when `provider` is `deepseek` or `openrouter`:

```typescript
displayOptions: {
  show: {
    provider: ['deepseek', 'openrouter'],
  },
}
```

## Testing

### Manual Testing

1. Start the Translate Gateway microservice:
```bash
docker run -d -p 8080:8080 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp-service-account.json \
  -v /path/to/credentials.json:/secrets/gcp-service-account.json \
  bozonx/translate-gateway-microservice:latest
```

2. In n8n:
   - Add the "Translate Gateway" node to your workflow
   - Configure credentials (Gateway URL: `http://localhost:8080`)
   - Set required parameters (text, targetLang)
   - Execute the workflow

### Test Cases

1. **Basic translation**:
   - Text: "Hello, world!"
   - Target Language: "ru"
   - Expected: Russian translation

2. **HTML translation**:
   - Text: "<p>Hello, <b>world</b>!</p>"
   - Target Language: "es"
   - Expected: Spanish translation with preserved HTML tags

3. **Provider selection**:
   - Provider: "deepl"
   - Expected: Translation using DeepL API

4. **Error handling**:
   - Invalid provider name
   - Expected: Error message in output (with continue-on-fail enabled)

## Publishing

### To npm

```bash
# Build and publish
pnpm publish:npm
```

### Version Bump

Update version in `package.json` before publishing:

```json
{
  "version": "1.0.1"
}
```

## Troubleshooting

### Node Not Appearing in n8n

1. Check that the node is properly built: `dist/nodes/TranslateGateway/BozonxTranslateGateway.node.js` should exist
2. Verify `package.json` has correct `n8n.nodes` path
3. Restart n8n after linking

### TypeScript Errors

The `n8n-workflow` import error is expected during development - it's a peer dependency provided by n8n at runtime.

### API Connection Issues

1. Verify microservice is running: `curl http://localhost:8080/api/v1/health`
2. Check credentials in n8n (Gateway URL should not include `/api/v1`)
3. Review n8n logs for detailed error messages

## Resources

- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [Translate Gateway API](https://github.com/bozonx/translate-gateway-microservice/blob/main/docs/api.md)
