import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EnvService } from '@nhl/env';
import { Env } from './common/env';
import { AllExceptionsFilter } from '@nhl/error/filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  const env = app.get(EnvService<Env>);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  await app.startAllMicroservices();

  // `host` is an @IsUrl() value, not a bind address: on Vercel it resolves to a
  // public IP the container cannot bind (EADDRNOTAVAIL). Bind all interfaces there.
  const port = Number(process.env.PORT ?? env.get('port'));

  if (process.env.VERCEL) await app.listen(port);
  else await app.listen(port, env.get('host'));
}
bootstrap();
