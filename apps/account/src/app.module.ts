import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule, EnvService } from '@nhl/env';
import { RoleSchema, AccountSchema } from './common/schema/user';
import { AuthCodeSchema, ClientSchema } from './common/schema/account';
import { Env } from './common/env';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    EnvModule.register({ path: '/config/env.json', class: Env }),
    SequelizeModule.forRootAsync({
      inject: [EnvService],
      useFactory: async (env: EnvService<Env>) => {
        const { pathname, username, hostname, port } = new URL(
          env.get('db.sqlUrl'),
        );
        return {
          dialect: 'mysql',
          host: hostname,
          port: +port,
          username: username,
          database: pathname.replace('/', ''),
          models: [AccountSchema, RoleSchema, AuthCodeSchema, ClientSchema],
          // `force: true` DROPS AND RECREATES every table on boot, i.e. on every
          // serverless cold start. Opt-in only; never set outside a scratch DB.
          ...(process.env.DB_SYNC_FORCE === 'true' && {
            sync: { force: true },
          }),
        };
      },
    }),

    SequelizeModule.forFeature([AccountSchema, RoleSchema]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
