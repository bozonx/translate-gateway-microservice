# Usage Examples

## Example 1: Simple Text Translation

Translate a simple text from Russian to English using the default provider.

**Node Configuration:**
- **Text**: `Привет, мир!`
- **Target Language**: `en`

**Output:**
```json
{
  "translatedText": "Hello, world!",
  "provider": "google"
}
```

---

## Example 2: HTML Content Translation

Translate HTML content while preserving all tags and structure.

**Node Configuration:**
- **Text**: `<div><h1>Заголовок</h1><p>Это <strong>важный</strong> текст.</p></div>`
- **Target Language**: `en`
- **Provider**: `deepl`

**Output:**
```json
{
  "translatedText": "<div><h1>Title</h1><p>This is <strong>important</strong> text.</p></div>",
  "provider": "deepl"
}
```

---

## Example 3: Explicit Source Language

Specify both source and target languages for more accurate translation.

**Node Configuration:**
- **Text**: `Bonjour, comment allez-vous?`
- **Source Language**: `fr`
- **Target Language**: `en`
- **Provider**: `google`

**Output:**
```json
{
  "translatedText": "Hello, how are you?",
  "provider": "google"
}
```

---

## Example 4: LLM Translation with DeepSeek

Use DeepSeek LLM for translation with a specific model.

**Node Configuration:**
- **Text**: `The quick brown fox jumps over the lazy dog.`
- **Target Language**: `ru`
- **Source Language**: `en`
- **Provider**: `deepseek`
- **Model**: `deepseek-chat`

**Output:**
```json
{
  "translatedText": "Быстрая коричневая лиса перепрыгивает через ленивую собаку.",
  "provider": "deepseek",
  "model": "deepseek-chat"
}
```

---

## Example 5: Length Limit

Limit the maximum input length for a specific request.

**Node Configuration:**
- **Text**: `Long text here...`
- **Target Language**: `es`
- **Max Length**: `1000`

**Output:**
```json
{
  "translatedText": "Texto largo aquí...",
  "provider": "google"
}
```

**Note:** If the text exceeds the limit, you'll receive a `413 Payload Too Large` error.

---

## Example 6: Batch Translation Workflow

Use n8n's loop functionality to translate multiple texts.

**Workflow:**
1. **Start Node** → Array of texts to translate
2. **Split In Batches** → Process items one by one
3. **Translate Gateway** → Translate each text
4. **Merge** → Combine results

**Input Data:**
```json
[
  { "text": "Hello", "lang": "ru" },
  { "text": "Goodbye", "lang": "fr" },
  { "text": "Thank you", "lang": "es" }
]
```

**Translate Gateway Configuration:**
- **Text**: `{{ $json.text }}`
- **Target Language**: `{{ $json.lang }}`

**Output:**
```json
[
  { "translatedText": "Привет", "provider": "google" },
  { "translatedText": "Au revoir", "provider": "google" },
  { "translatedText": "Gracias", "provider": "google" }
]
```

---

## Example 7: Error Handling with Continue On Fail

Handle translation errors gracefully without stopping the workflow.

**Node Configuration:**
- **Text**: `Test text`
- **Target Language**: `invalid_lang`
- **Provider**: `google`
- **Continue On Fail**: ✅ Enabled

**Output (on error):**
```json
{
  "error": "Provider error: Unsupported language code"
}
```

---

## Example 8: Multi-Provider Fallback

Create a workflow that tries multiple providers if one fails.

**Workflow:**
1. **Translate Gateway** (Provider: `google`)
   - Continue On Fail: ✅
2. **IF Node** → Check if error exists
3. **Translate Gateway** (Provider: `deepl`) → Fallback
4. **Merge** → Return successful result

This ensures translation succeeds even if one provider is unavailable.

---

## Example 9: OpenRouter with Auto Model

Use OpenRouter with automatic model selection.

**Node Configuration:**
- **Text**: `Machine learning is fascinating.`
- **Target Language**: `ja`
- **Provider**: `openrouter`
- **Model**: _(leave empty for auto)_

**Output:**
```json
{
  "translatedText": "機械学習は魅力的です。",
  "provider": "openrouter",
  "model": "openrouter/auto"
}
```

---

## Example 10: Dynamic Provider Selection

Use n8n expressions to dynamically select the provider based on input data.

**Input Data:**
```json
{
  "text": "Hello",
  "targetLang": "ru",
  "preferredProvider": "deepl"
}
```

**Node Configuration:**
- **Text**: `{{ $json.text }}`
- **Target Language**: `{{ $json.targetLang }}`
- **Provider**: `{{ $json.preferredProvider }}`

**Output:**
```json
{
  "translatedText": "Привет",
  "provider": "deepl"
}
```

---

## Common Use Cases

### Website Localization
Translate website content (HTML) to multiple languages while preserving structure.

### Customer Support
Auto-translate customer messages in real-time for multilingual support teams.

### Content Publishing
Translate blog posts, articles, or documentation to reach international audiences.

### Data Processing
Translate product descriptions, reviews, or user-generated content in bulk.

### API Integration
Integrate translation capabilities into existing workflows and automation pipelines.
