import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TranslateRequestDto } from '@/modules/translate/dto/translate-request.dto';

describe('TranslateRequestDto validation', () => {
  it('passes with minimal valid payload', async () => {
    const dto = plainToInstance(TranslateRequestDto, {
      text: 'hello',
      targetLang: 'ru',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when required fields are missing', async () => {
    const dto = plainToInstance(TranslateRequestDto, {});
    const errors = await validate(dto);
    const props = errors.map(e => e.property);
    expect(props).toEqual(expect.arrayContaining(['text', 'targetLang']));
  });

  it('accepts optional fields', async () => {
    const dto = plainToInstance(TranslateRequestDto, {
      text: 'hello',
      targetLang: 'fr',
      sourceLang: 'en',
      provider: 'google',
      model: 'deepseek-chat',
      maxLength: 123,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-positive maxLength', async () => {
    const dto = plainToInstance(TranslateRequestDto, {
      text: 'hello',
      targetLang: 'fr',
      maxLength: 0,
    });
    const errors = await validate(dto);
    expect(errors).not.toHaveLength(0);
    expect(errors.find(e => e.property === 'maxLength')).toBeTruthy();
  });
});
