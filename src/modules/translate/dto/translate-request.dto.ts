import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class TranslateRequestDto {
  @IsString()
  public text!: string;

  @IsString()
  public targetLang!: string;

  @IsOptional()
  @IsString()
  public sourceLang?: string;

  @IsOptional()
  @IsString()
  public provider?: string;

  @IsOptional()
  @IsString()
  public model?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public maxLength?: number;
}
