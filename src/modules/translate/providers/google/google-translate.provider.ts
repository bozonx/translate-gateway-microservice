import { Injectable } from '@nestjs/common';
import { v2 as TranslateV2 } from '@google-cloud/translate';
import type { TranslateParams, TranslateProvider, TranslateResult } from '../translate.provider';

@Injectable()
export class GoogleTranslateProvider implements TranslateProvider {
  private readonly client: TranslateV2.Translate;

  constructor() {
    // The client will use Application Default Credentials (ADC)
    this.client = new TranslateV2.Translate();
  }

  public async translate(params: TranslateParams): Promise<TranslateResult> {
    const { text, targetLang, sourceLang, format } = params;

    const [translation] = await this.client.translate(text, {
      to: targetLang,
      from: sourceLang,
      format: format ?? 'text',
    });

    const translatedText = Array.isArray(translation) ? translation[0] : translation;

    return {
      translatedText,
      provider: 'google',
    };
  }
}
