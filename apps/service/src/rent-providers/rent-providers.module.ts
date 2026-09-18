import { Module } from '@nestjs/common';
import { RentProvidersController } from './rent-providers.controller.js';
import { RentProvidersService } from './rent-providers.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { RentProviderSchema } from '../common/schema/user/index.js';

@Module({
  imports: [SequelizeModule.forFeature([RentProviderSchema])],
  controllers: [RentProvidersController],
  providers: [RentProvidersService],
  exports: [RentProvidersService],
})
export class RentProvidersModule {}
