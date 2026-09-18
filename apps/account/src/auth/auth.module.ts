import { Module } from '@nestjs/common';
import { AuthCodeService } from './auth-code.service.js';
import { ClientService } from './client.service.js';
import { OAuthService } from './oauth.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthCodeSchema, ClientSchema } from '../common/schema/account/index.js';

@Module({
  imports: [SequelizeModule.forFeature([ClientSchema, AuthCodeSchema])],
  providers: [AuthCodeService, ClientService, OAuthService],
  exports: [AuthCodeService, ClientService, OAuthService],
})
export class AuthModule {}
