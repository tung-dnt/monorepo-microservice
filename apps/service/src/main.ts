import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { EnvService } from '@nhl/env';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@nhl/error/filter';
import { LoggingInterceptor } from '@nhl/error/interceptor';
import { Env } from './common/env';

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

  if (env.get('env') === 'dev' || process.env.NODE_ENV === 'dev') await app.listen(port, env.get('host'));
  else await app.listen(port)
}

bootstrap();