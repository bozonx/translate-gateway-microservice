import { Inject, Injectable, NotFoundException, PayloadTooLargeException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TranslationConfig } from '@config/translation.config';
import type { TranslateProviderRegistry } from './providers/translate.provider';
import { TRANSLATE_PROVIDER_REGISTRY } from './providers/translate.provider';
import type { TranslateRequestDto } from './dto/translate-request.dto';
import type { TranslateResponseDto } from './dto/translate-response.dto';

@Injectable()
export class TranslateService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(TRANSLATE_PROVIDER_REGISTRY)
    private readonly registry: TranslateProviderRegistry,
  ) {}

  public async translate(dto: TranslateRequestDto): Promise<TranslateResponseDto> {
    const translationConfig = this.configService.get<TranslationConfig>('translation')!;

    const providerName = (dto.provider ?? translationConfig.defaultProvider).toLowerCase();

    const allowed = translationConfig.allowedProviders;
    if (Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(providerName)) {
      throw new NotFoundException({ message: 'Unknown provider', provider: providerName });
    }
    const provider = this.registry.get(providerName);

    if (!provider) {
      throw new NotFoundException({ message: 'Unknown provider', provider: providerName });
    }

    const envMax = translationConfig.maxTextLength;
    const requestMax = dto.maxLength;
    const effectiveMax = Math.min(envMax, requestMax ?? envMax);

    if (dto.text.length > effectiveMax) {
      throw new PayloadTooLargeException({
        message: 'Text exceeds maximum allowed length',
        maxAllowed: effectiveMax,
      });
    }

    const format = this.detectFormat(dto.text);

    const timeoutMs = Math.max(1, translationConfig.requestTimeoutSec) * 1000;
    const result = (await new Promise<TranslateResponseDto>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new ServiceUnavailableException({ message: 'Provider request timed out', provider: providerName, timeoutSec: translationConfig.requestTimeoutSec })),
        timeoutMs,
      );
      provider
        .translate({
          text: dto.text,
          targetLang: dto.targetLang,
          sourceLang: dto.sourceLang,
          format,
          model: dto.model,
        })
        .then(r => {
          clearTimeout(timer);
          resolve(r);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    })) as TranslateResponseDto;

    return result;
  }

  private detectFormat(text: string): 'text' | 'html' {
    // Simple heuristic: if HTML-like tags are present, use html
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(text);
    return looksLikeHtml ? 'html' : 'text';
  }
}
