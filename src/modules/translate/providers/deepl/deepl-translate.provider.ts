import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import * as deepl from 'deepl-node';
import type { TranslateParams, TranslateProvider, TranslateResult } from '../translate.provider';

@Injectable()
export class DeepLTranslateProvider implements TranslateProvider {
  private readonly client: deepl.DeepLClient | null;

  constructor() {
    const authKey = process.env.DEEPL_AUTH_KEY?.trim();
    this.client = authKey ? new deepl.DeepLClient(authKey) : null;
  }

  public async translate(params: TranslateParams): Promise<TranslateResult> {
    if (!this.client) {
      throw new ServiceUnavailableException({ message: 'DeepL provider is not configured', missing: 'DEEPL_AUTH_KEY' });
    }

    const { text, targetLang, sourceLang, format } = params;

    const options: deepl.TextTranslationOptions = {};
    if (format === 'html') {
      options.tagHandling = 'html';
    }

    const result = await this.client.translateText(text, sourceLang ?? null, targetLang as any, options);

    return {
      translatedText: result.text,
      detectedSourceLang: result.detectedSourceLang,
      provider: 'deepl',
      model: (result as any).modelTypeUsed,
    };
  }
}
