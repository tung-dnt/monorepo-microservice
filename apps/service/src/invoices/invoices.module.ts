import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller.js';
import { InvoicesService } from './invoices.service.js';
import { LocationsModule } from '../locations/locations.module.js';
import { TenantModule } from '../tenant/tenant.module.js';
import { RentProvidersModule } from '../rent-providers/rent-providers.module.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { InvoiceExpenseSchema, InvoiceScheduleSchema, InvoiceSchema } from '../common/schema/user/index.js';

@Module({
  imports: [TenantModule, LocationsModule, RentProvidersModule, SequelizeModule.forFeature([InvoiceSchema, InvoiceExpenseSchema, InvoiceScheduleSchema])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule { }
