import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import type { TranslateParams, TranslateProvider, TranslateResult } from '../translate.provider';

@Injectable()
export class OpenRouterTranslateProvider implements TranslateProvider {
  private readonly client: OpenAI | null;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly systemPromptTemplate: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    this.baseUrl = (process.env.OPENROUTER_API_BASE_URL?.trim() || 'https://openrouter.ai/api/v1');
    this.defaultModel = (process.env.OPENROUTER_DEFAULT_MODEL?.trim() || 'openrouter/auto');
    this.systemPromptTemplate =
      process.env.LLM_SYSTEM_PROMPT?.trim() ||
      'You are a professional translator. Translate the user message into {targetLang}. If source language is provided ({sourceLang}), use it; otherwise detect it. Preserve meaning, tone, and formatting. For format={format}, keep the same formatting (preserve HTML tags when html). Output only the translated text, without any explanations.';

    this.client = apiKey
      ? new OpenAI({ apiKey, baseURL: this.baseUrl })
      : null;
  }

  public async translate(params: TranslateParams): Promise<TranslateResult> {
    if (!this.client) {
      throw new ServiceUnavailableException({ message: 'OpenRouter provider is not configured', missing: 'OPENROUTER_API_KEY' });
    }

    const { text, targetLang, sourceLang, format } = params;
    const model = params.model?.trim() || this.defaultModel;

    const systemPrompt = this.systemPromptTemplate
      .replaceAll('{targetLang}', String(targetLang))
      .replaceAll('{sourceLang}', String(sourceLang ?? 'auto'))
      .replaceAll('{format}', String(format ?? 'text'));

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ];

    const completion = await this.client.chat.completions.create({
      model,
      messages,
      temperature: 0,
    });

    const content = completion.choices?.[0]?.message?.content ?? '';

    return {
      translatedText: content,
      provider: 'openrouter',
      model,
    };
  }
}
