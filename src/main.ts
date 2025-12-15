import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // strips unknown fields
      forbidNonWhitelisted: true, // errors on extra fields
      transform: true,            // auto-transform types
    }),
  );

  await app.listen(3000);
}
bootstrap();
