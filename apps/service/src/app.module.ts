import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EnvModule, EnvService } from '@nhl/env';
import { Env } from './common/env';
import { RentProvidersModule } from './rent-providers/rent-providers.module';
import { TenantModule } from './tenant/tenant.module';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  RentProviderSchema,
  TenantSchema,
  LocationSchema,
  ExpenseLocationSchema,
  TenantLocationSchema,
  InvoiceSchema,
  InvoiceExpenseSchema,
  InvoiceScheduleSchema,
} from './common/schema/user';
import { LocationsModule } from './locations/locations.module';
import { ExpenseSchema } from './common/schema/user/expense';
import { ExpenseModule } from './expense/expense.module';
import { InvoicesModule } from './invoices/invoices.module';
import { OcrModule } from './ocr/ocr.module';
require('dotenv').config()
@Module({
  imports: [
    EnvModule.register({ path: '/config/env.json', class: Env }),
    SequelizeModule.forRootAsync({
      inject: [EnvService],
      useFactory: async (env: EnvService<Env>) => {
        const database = env.get('db');
        const { pathname, username, password, hostname, port } = new URL(
          database.sqlUrl,
        );
        console.log('Connecting to database', {
          dialect: 'mysql',
          host: hostname,
          port: +port,
          username: username,
          database: pathname.replace('/', ''),
        });
        console.log('Using ssl', database.ssl?.ca, process.env.SQL_CERT)
        return {
          dialect: 'mysql',
          dialectModule: require('mysql2'),
          host: hostname,
          port: +port,
          username: username,
          database: pathname.replace('/', ''),
          ...(password && { password: password }),
          ...(database.ssl?.ca && {
            dialectOptions: {
              ssl: {
                ca: process.env.SQL_CERT.replace(/\\n/g, '\n'),
              },
            },
          }),
          models: [
            RentProviderSchema,
            TenantSchema,
            LocationSchema,
            ExpenseSchema,
            ExpenseLocationSchema,
            TenantLocationSchema,
            InvoiceSchema,
            InvoiceExpenseSchema,
            InvoiceScheduleSchema,
          ],
          logging: false,
          // `sync: { force: true }` DROPS AND RECREATES every table on boot. On
          // serverless that means each cold start wipes the database, so it is now
          // opt-in via DB_SYNC_FORCE and must never be set outside a scratch DB.
          // Without it @nestjs/sequelize still syncs non-destructively.
          ...(process.env.DB_SYNC_FORCE === 'true' && {
            sync: { force: true },
          }),
        };
      },
    }),
    RentProvidersModule,
    TenantModule,
    LocationsModule,
    ExpenseModule,
    InvoicesModule,
    OcrModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
