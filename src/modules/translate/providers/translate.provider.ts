export interface TranslateParams {
  text: string;
  targetLang: string;
  sourceLang?: string;
  format?: 'text' | 'html';
}

export interface TranslateResult {
  translatedText: string;
  detectedSourceLang?: string;
  provider: string;
  model?: string;
}

export interface TranslateProvider {
  translate(params: TranslateParams): Promise<TranslateResult>;
}

export const TRANSLATE_PROVIDER_REGISTRY = 'TRANSLATE_PROVIDER_REGISTRY' as const;
export type TranslateProviderRegistry = Map<string, TranslateProvider>;
