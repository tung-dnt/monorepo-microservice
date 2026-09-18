import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller.js';
import { ExpenseService } from './expense.service.js';
import { ExpenseSchema } from '../common/schema/user/index.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { LocationsModule } from '../locations/locations.module.js';

@Module({
  imports: [SequelizeModule.forFeature([ExpenseSchema])],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
