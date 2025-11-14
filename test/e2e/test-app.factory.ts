import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@/app.module';

export async function createTestApp(): Promise<NestFastifyApplication> {
  // Ensure defaults the same as in main.ts
  process.env.API_BASE_PATH = process.env.API_BASE_PATH ?? 'api';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const bodyLimitMb = parseInt(process.env.HTTP_REQUEST_BODY_LIMIT_MB ?? '3', 10);
  const httpBodyLimit = Number.isFinite(bodyLimitMb) && bodyLimitMb > 0 ? bodyLimitMb * 1024 * 1024 : 3 * 1024 * 1024;

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({
      logger: false, // We'll use Pino logger instead
      bodyLimit: httpBodyLimit,
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const apiBasePath = (process.env.API_BASE_PATH || 'api').replace(/^\/+|\/+$/g, '');
  app.setGlobalPrefix(`${apiBasePath}/v1`);

  await app.init();
  // Ensure Fastify has completed plugin registration and routing before tests
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

