import { Module } from '@nestjs/common';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';
import { GoogleTranslateProvider } from './providers/google/google-translate.provider';
import { DeepLTranslateProvider } from './providers/deepl/deepl-translate.provider';
import { TRANSLATE_PROVIDER_REGISTRY, type TranslateProviderRegistry } from './providers/translate.provider';
import translationConfig from '@config/translation.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forFeature(translationConfig)],
  controllers: [TranslateController],
  providers: [
    GoogleTranslateProvider,
    DeepLTranslateProvider,
    {
      provide: TRANSLATE_PROVIDER_REGISTRY,
      useFactory: (
        google: GoogleTranslateProvider,
        deepl: DeepLTranslateProvider,
      ): TranslateProviderRegistry => {
        const registry: TranslateProviderRegistry = new Map();
        registry.set('google', google);
        registry.set('deepl', deepl);
        return registry;
      },
      inject: [GoogleTranslateProvider, DeepLTranslateProvider],
    },
    TranslateService,
  ],
})
export class TranslateModule {}
