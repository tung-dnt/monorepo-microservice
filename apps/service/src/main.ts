import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { EnvService } from '@nhl/env';
import { AppModule } from './app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@nhl/error/filter';
import { LoggingInterceptor } from '@nhl/error/interceptor';
import { Env } from './common/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn', "log"],
  });
  app.enableCors({ origin: '*' });

  const env = app.get(EnvService<Env>);
  const logger = new Logger();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  app.useGlobalInterceptors(new LoggingInterceptor(logger))

  // await app.startAllMicroservices();

  // Vercel captures the server from this listen() call and routes to it over an
  // internal port, so the value passed here only matters locally and in Docker.
  const port = Number(process.env.PORT ?? env.get('port'));
  const isDev = env.get('env') === 'dev' || process.env.NODE_ENV === 'dev';

  // `host` is an @IsUrl() value, not a bind address. Locally it resolves to
  // loopback so binding to it happens to work, but on Vercel it resolves to a
  // public IP the container cannot bind -> EADDRNOTAVAIL. Note Environment.Production
  // is also "dev", so this branch is taken in every environment. Bind all
  // interfaces whenever we are not on a developer machine.
  if (isDev && !process.env.VERCEL) await app.listen(port, env.get('host'));
  else await app.listen(port)
}

bootstrap();