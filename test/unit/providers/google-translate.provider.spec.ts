import { GoogleTranslateProvider } from '@/modules/translate/providers/google/google-translate.provider';

let translateMock: jest.Mock;

jest.mock('@google-cloud/translate', () => {
  return {
    v2: {
      Translate: function () {
        return { translate: translateMock } as any;
      },
    },
  };
});

describe('GoogleTranslateProvider (unit)', () => {
  beforeEach(() => {
    translateMock = jest.fn();
  });

  it('translates text and returns provider label', async () => {
    translateMock.mockResolvedValue(['OK']);

    const provider = new GoogleTranslateProvider();
    const res = await provider.translate({ text: 'hello', targetLang: 'ru' });

    expect(res.translatedText).toBe('OK');
    expect(res.provider).toBe('google');
    expect(translateMock).toHaveBeenCalledWith('hello', {
      to: 'ru',
      from: undefined,
      format: 'text',
    });
  });

  it('passes html format option to client', async () => {
    translateMock.mockResolvedValue(['OK']);

    const provider = new GoogleTranslateProvider();
    await provider.translate({ text: '<b>a</b>', targetLang: 'ru', format: 'html' });

    const call = translateMock.mock.calls.at(-1);
    expect(call?.[1]).toMatchObject({ format: 'html' });
  });

  it('handles array payload from client', async () => {
    translateMock.mockResolvedValue([['A', 'B']]);
    const provider = new GoogleTranslateProvider();
    const res = await provider.translate({ text: 'x', targetLang: 'en' });
    expect(res.translatedText).toBe('A');
  });
});
