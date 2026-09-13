import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Local dev (docker-compose.yml) publishes frontend/backend on separate host
  // ports with no reverse proxy, so the browser calls the API cross-origin.
  // Production (docker-compose.prod.yml) routes both through Caddy on one
  // origin via /api, where CORS isn't needed.
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
