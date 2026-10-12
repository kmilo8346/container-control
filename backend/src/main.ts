import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { webUrl } from './auth/auth.controller.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: new URL(webUrl).origin, credentials: true });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
