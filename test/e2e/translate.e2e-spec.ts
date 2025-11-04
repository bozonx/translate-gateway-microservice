import { Test } from '@nestjs/testing';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@/app.module';
import { TRANSLATE_PROVIDER_REGISTRY, type TranslateProvider, type TranslateProviderRegistry } from '@/modules/translate/providers/translate.provider';

function makeRegistry(map: Record<string, TranslateProvider>): TranslateProviderRegistry {
  return new Map<string, TranslateProvider>(Object.entries(map));
}

describe('Translate (e2e)', () => {
  let app: NestFastifyApplication;
  let savedEnv: {
    TRANSLATE_DEFAULT_PROVIDER?: string;
    TRANSLATE_ALLOWED_PROVIDERS?: string;
    REQUEST_TIMEOUT_SEC?: string;
  };

  beforeAll(() => {
    savedEnv = {
      TRANSLATE_DEFAULT_PROVIDER: process.env.TRANSLATE_DEFAULT_PROVIDER,
      TRANSLATE_ALLOWED_PROVIDERS: process.env.TRANSLATE_ALLOWED_PROVIDERS,
      REQUEST_TIMEOUT_SEC: process.env.REQUEST_TIMEOUT_SEC,
    };
  });

  const fakeProvider: TranslateProvider = {
    translate: async ({ text }) => ({ translatedText: `ok:${text}`, provider: 'google' }),
  };
  const fakeDeepseek: TranslateProvider = {
    translate: async ({ text }) => ({ translatedText: `ds:${text}`, provider: 'deepseek', model: 'deepseek-chat' }),
  };
  const fakeOpenrouter: TranslateProvider = {
    translate: async ({ text }) => ({ translatedText: `or:${text}`, provider: 'openrouter', model: 'openrouter/auto' }),
  };

  async function createApp(): Promise<NestFastifyApplication> {
    // Ensure defaults the same as in main.ts and test factory
    process.env.API_BASE_PATH = process.env.API_BASE_PATH ?? 'api';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSLATE_PROVIDER_REGISTRY)
      .useValue(makeRegistry({ google: fakeProvider }))
      .compile();

    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
    app.setGlobalPrefix(`${apiBasePath}/v1`);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
  }

  beforeEach(async () => {
    process.env.TRANSLATE_DEFAULT_PROVIDER = 'google';
    process.env.TRANSLATE_ALLOWED_PROVIDERS = '';
    process.env.REQUEST_TIMEOUT_SEC = '60';
    app = await createApp();
  });

  afterAll(async () => {
    process.env.TRANSLATE_DEFAULT_PROVIDER = savedEnv.TRANSLATE_DEFAULT_PROVIDER;
    process.env.TRANSLATE_ALLOWED_PROVIDERS = savedEnv.TRANSLATE_ALLOWED_PROVIDERS;
    process.env.REQUEST_TIMEOUT_SEC = savedEnv.REQUEST_TIMEOUT_SEC;
  });

  it('allows selecting openrouter provider when available', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSLATE_PROVIDER_REGISTRY)
      .useValue(makeRegistry({ google: fakeProvider, openrouter: fakeOpenrouter }))
      .compile();

    const localApp = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    localApp.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
    localApp.setGlobalPrefix(`${apiBasePath}/v1`);
    await localApp.init();
    await localApp.getHttpAdapter().getInstance().ready();

    const res = await localApp.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: { text: 'hello', targetLang: 'ru', provider: 'openrouter' },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.translatedText).toBe('or:hello');
    expect(body.provider).toBe('openrouter');

    await localApp.close();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('POST /api/v1/translate returns translated text', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: {
        text: 'hello',
        targetLang: 'ru',
      },
    });

    expect(res.statusCode).toBe(201); // Fastify/Nest defaults to 201 for POST
    const body = JSON.parse(res.body);
    expect(body).toEqual({ translatedText: 'ok:hello', provider: 'google' });
  });

  it('POST /api/v1/translate validates required fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.message).toBeDefined();
  });

  it('allows selecting deepseek provider when available', async () => {
    // Build app with both providers in registry
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSLATE_PROVIDER_REGISTRY)
      .useValue(makeRegistry({ google: fakeProvider, deepseek: fakeDeepseek }))
      .compile();

    const localApp = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    localApp.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
    localApp.setGlobalPrefix(`${apiBasePath}/v1`);
    await localApp.init();
    await localApp.getHttpAdapter().getInstance().ready();

    const res = await localApp.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: { text: 'hello', targetLang: 'ru', provider: 'deepseek' },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.translatedText).toBe('ds:hello');
    expect(body.provider).toBe('deepseek');

    await localApp.close();
  });

  it('returns 404 when provider not in allow-list', async () => {
    // Restrict allow-list to google only
    const oldEnv = process.env.TRANSLATE_ALLOWED_PROVIDERS;
    process.env.TRANSLATE_ALLOWED_PROVIDERS = 'google';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSLATE_PROVIDER_REGISTRY)
      .useValue(makeRegistry({ google: fakeProvider, deepseek: fakeDeepseek }))
      .compile();

    const localApp = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    localApp.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
    localApp.setGlobalPrefix(`${apiBasePath}/v1`);
    await localApp.init();
    await localApp.getHttpAdapter().getInstance().ready();

    const res = await localApp.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: { text: 'hello', targetLang: 'ru', provider: 'deepseek' },
    });
    expect(res.statusCode).toBe(404);

    await localApp.close();
    process.env.TRANSLATE_ALLOWED_PROVIDERS = oldEnv;
  });

  it('normalizes language tag casing for sourceLang/targetLang', async () => {
    const echoProvider: TranslateProvider = {
      translate: async ({ text, targetLang, sourceLang }) => ({
        translatedText: `t=${targetLang};s=${sourceLang ?? ''};${text}`,
        provider: 'google',
      }),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSLATE_PROVIDER_REGISTRY)
      .useValue(makeRegistry({ google: echoProvider }))
      .compile();

    const localApp = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    localApp.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
    localApp.setGlobalPrefix(`${apiBasePath}/v1`);
    await localApp.init();
    await localApp.getHttpAdapter().getInstance().ready();

    const cases = [
      { target: 'en', expectT: 'en' },
      { target: 'EN-us', expectT: 'en-US' },
      { target: 'en-gb', expectT: 'en-GB' },
      { target: 'pt', expectT: 'pt' },
      { target: 'pt-br', expectT: 'pt-BR' },
      { target: 'zh', expectT: 'zh' },
      { target: 'zh-tw', expectT: 'zh-TW' },
    ];

    for (const c of cases) {
      const res = await localApp.inject({
        method: 'POST',
        url: '/api/v1/translate',
        payload: { text: 'x', targetLang: c.target },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.translatedText.startsWith(`t=${c.expectT};s=;`)).toBe(true);
    }

    // Also check sourceLang normalization
    const res2 = await localApp.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: { text: 'y', targetLang: 'EN-us', sourceLang: 'ZH-tw' },
    });
    expect(res2.statusCode).toBe(201);
    const body2 = JSON.parse(res2.body);
    expect(body2.translatedText).toContain('t=en-US;');
    expect(body2.translatedText).toContain('s=zh-TW;');

    await localApp.close();
  });

  it('returns 503 on provider timeout', async () => {
    const slowProvider: TranslateProvider = {
      translate: async ({ text }) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { translatedText: `slow:${text}`, provider: 'google' };
      },
    };

    const oldTimeout = process.env.REQUEST_TIMEOUT_SEC;
    process.env.REQUEST_TIMEOUT_SEC = '1';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSLATE_PROVIDER_REGISTRY)
      .useValue(makeRegistry({ google: slowProvider }))
      .compile();

    const localApp = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    localApp.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
    localApp.setGlobalPrefix(`${apiBasePath}/v1`);
    await localApp.init();
    await localApp.getHttpAdapter().getInstance().ready();

    const res = await localApp.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: { text: 'hello', targetLang: 'ru' },
    });

    expect(res.statusCode).toBe(503);

    await localApp.close();
    process.env.REQUEST_TIMEOUT_SEC = oldTimeout;
  });

  it('returns 422 when provider rejects unsupported language variant', async () => {
    const rejectingProvider: TranslateProvider = {
      translate: async ({ targetLang }) => {
        if (targetLang === 'zz-ZZ') {
          throw new UnprocessableEntityException({ message: 'Unsupported language' });
        }
        return { translatedText: 'ok', provider: 'google' };
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSLATE_PROVIDER_REGISTRY)
      .useValue(makeRegistry({ google: rejectingProvider }))
      .compile();

    const localApp = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    localApp.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
    localApp.setGlobalPrefix(`${apiBasePath}/v1`);
    await localApp.init();
    await localApp.getHttpAdapter().getInstance().ready();

    const res = await localApp.inject({
      method: 'POST',
      url: '/api/v1/translate',
      payload: { text: 'hello', targetLang: 'zz-zz' },
    });
    expect(res.statusCode).toBe(422);

    await localApp.close();
  });
});
