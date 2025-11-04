import { Test } from '@nestjs/testing';
import { TranslateService } from '@/modules/translate/translate.service';
import { TRANSLATE_PROVIDER_REGISTRY, type TranslateProvider, type TranslateProviderRegistry } from '@/modules/translate/providers/translate.provider';
import { ConfigService } from '@nestjs/config';
import { PayloadTooLargeException, NotFoundException } from '@nestjs/common';

function makeRegistry(map: Record<string, TranslateProvider>): TranslateProviderRegistry {
  return new Map<string, TranslateProvider>(Object.entries(map));
}

describe('TranslateService (unit)', () => {
  let service: TranslateService;
  const fakeProvider: TranslateProvider = {
    translate: jest.fn(async ({ text }) => ({ translatedText: `ok:${text}`, provider: 'google' })),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TranslateService,
        {
          provide: TRANSLATE_PROVIDER_REGISTRY,
          useValue: makeRegistry({ google: fakeProvider }),
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'translation') return { defaultProvider: 'google', maxTextLength: 10 };
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(TranslateService);
  });

  it('uses default provider when not specified', async () => {
    const res = await service.translate({ text: 'hello', targetLang: 'ru' });
    expect(res.translatedText).toBe('ok:hello');
    expect(res.provider).toBe('google');
    expect((fakeProvider.translate as jest.Mock).mock.calls[0][0]).toMatchObject({ format: 'text' });
  });

  it('detects html format', async () => {
    await service.translate({ text: '<b>a</b>', targetLang: 'ru' });
    expect((fakeProvider.translate as jest.Mock).mock.calls.at(-1)[0]).toMatchObject({ format: 'html' });
  });

  it('uses provider from request when specified', async () => {
    const res = await service.translate({ text: 'x', targetLang: 'ru', provider: 'google' });
    expect(res.provider).toBe('google');
  });

  it('throws 413 when text exceeds effective max', async () => {
    await expect(
      service.translate({ text: '01234567890', targetLang: 'ru' }) // length 11 > env 10
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('throws 404 when provider unknown', async () => {
    await expect(
      service.translate({ text: 'x', targetLang: 'ru', provider: 'unknown' })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
