import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());

  // CORS
  const frontendOrigin = config.get<string>('FRONTEND_ORIGIN', 'http://localhost:5500');
  app.enableCors({
    origin: frontendOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Bhowanee backend running on http://localhost:${port}`);
  console.log(`📡 Socket.IO available at ws://localhost:${port}`);
}

bootstrap();
