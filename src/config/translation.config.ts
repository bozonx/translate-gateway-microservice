import { registerAs } from '@nestjs/config';
import { IsIn, IsInt, IsString, Max, Min, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class TranslationConfig {
  @IsString()
  @IsIn(['google', 'deepl', 'deepseek', 'openrouter'])
  public defaultProvider!: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  public maxTextLength!: number;

  @IsInt()
  @Min(1)
  @Max(600)
  public requestTimeoutSec!: number;

  public allowedProviders?: string[];
}

export default registerAs('translation', (): TranslationConfig => {
  const allowedProvidersRaw = (process.env.ALLOWED_PROVIDERS ?? '').trim();
  const allowedProviders = allowedProvidersRaw
    ? allowedProvidersRaw
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(Boolean)
    : undefined;

  const config = plainToClass(TranslationConfig, {
    defaultProvider: (process.env.DEFAULT_PROVIDER ?? 'google').trim(),
    maxTextLength: parseInt(process.env.TRANSLATE_MAX_TEXT_LENGTH ?? '100000', 10),
    requestTimeoutSec: parseInt(process.env.REQUEST_TIMEOUT_SEC ?? '60', 10),
    allowedProviders,
  });

  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0) {
    const errorMessages = errors.map(err => Object.values(err.constraints ?? {}).join(', '));
    throw new Error(`Translation config validation error: ${errorMessages.join('; ')}`);
  }

  return config;
});
