import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service.js';
import { LocationsController } from './locations.controller.js';
import { ExpenseLocationSchema, LocationSchema } from '../common/schema/user/index.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { FilePostModule } from '../filepost/filepost.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([LocationSchema, ExpenseLocationSchema]),
    FilePostModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
