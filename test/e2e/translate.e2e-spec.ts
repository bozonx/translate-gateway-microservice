import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@/app.module';
import { TRANSLATE_PROVIDER_REGISTRY, type TranslateProvider, type TranslateProviderRegistry } from '@/modules/translate/providers/translate.provider';

function makeRegistry(map: Record<string, TranslateProvider>): TranslateProviderRegistry {
  return new Map<string, TranslateProvider>(Object.entries(map));
}

describe('Translate (e2e)', () => {
  let app: NestFastifyApplication;

  const fakeProvider: TranslateProvider = {
    translate: async ({ text }) => ({ translatedText: `ok:${text}`, provider: 'google' }),
  };
  const fakeDeepseek: TranslateProvider = {
    translate: async ({ text }) => ({ translatedText: `ds:${text}`, provider: 'deepseek', model: 'deepseek-chat' }),
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
    app = await createApp();
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
});
