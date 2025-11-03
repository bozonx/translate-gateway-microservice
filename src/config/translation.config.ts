import { registerAs } from '@nestjs/config';
import { IsIn, IsInt, IsString, Max, Min, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class TranslationConfig {
  @IsString()
  @IsIn(['google'])
  public defaultProvider!: string;

  @IsInt()
  @Min(1)
  @Max(20000)
  public maxTextLength!: number;
}

export default registerAs('translation', (): TranslationConfig => {
  const config = plainToClass(TranslationConfig, {
    defaultProvider: (process.env.TRANSLATE_DEFAULT_PROVIDER ?? 'google').trim(),
    maxTextLength: parseInt(process.env.TRANSLATE_MAX_TEXT_LENGTH ?? '5000', 10),
  });

  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0) {
    const errorMessages = errors.map(err => Object.values(err.constraints ?? {}).join(', '));
    throw new Error(`Translation config validation error: ${errorMessages.join('; ')}`);
  }

  return config;
});
