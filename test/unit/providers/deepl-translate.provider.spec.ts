import { DeepLTranslateProvider } from '@/modules/translate/providers/deepl/deepl-translate.provider';
import { ServiceUnavailableException } from '@nestjs/common';

let translateTextMock: jest.Mock;

jest.mock('deepl-node', () => {
  return {
    DeepLClient: function () {
      return { translateText: translateTextMock } as any;
    },
  };
});

describe('DeepLTranslateProvider (unit)', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    translateTextMock = jest.fn();
    process.env.DEEPL_AUTH_KEY = 'test-key';
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('translates text and returns provider label', async () => {
    translateTextMock.mockResolvedValue({ text: 'OK', detectedSourceLang: 'en' });

    const provider = new DeepLTranslateProvider();
    const res = await provider.translate({ text: 'hello', targetLang: 'ru' });

    expect(res.translatedText).toBe('OK');
    expect(res.provider).toBe('deepl');

    // Expect call signature: (text, sourceLang|null, targetLang, options)
    expect(translateTextMock).toHaveBeenCalledWith('hello', null, 'ru', {});
  });

  it('passes html tagHandling option when format is html', async () => {
    translateTextMock.mockResolvedValue({ text: 'OK', detectedSourceLang: 'en' });

    const provider = new DeepLTranslateProvider();
    await provider.translate({ text: '<b>a</b>', targetLang: 'ru', format: 'html' });

    const call = translateTextMock.mock.calls.at(-1);
    expect(call?.[3]).toMatchObject({ tagHandling: 'html' });
  });

  it('throws 503 when DEEPL_AUTH_KEY is missing', async () => {
    delete process.env.DEEPL_AUTH_KEY;
    const provider = new DeepLTranslateProvider();
    await expect(
      provider.translate({ text: 'hello', targetLang: 'ru' })
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
