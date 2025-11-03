export class TranslateResponseDto {
  public translatedText!: string;
  public detectedSourceLang?: string;
  public provider!: string;
  public model?: string;
}
