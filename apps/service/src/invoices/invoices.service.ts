import { Injectable, NotImplementedException } from '@nestjs/common';
import { PaginatedQuery } from '../common/pagination.js';
import { RentProvidersService } from '../rent-providers/rent-providers.service.js';
import { TenantService } from '../tenant/tenant.service.js';
import { LocationsService } from '../locations/locations.service.js';
import { ExpenseService } from '../expense/expense.service.js';
import { InjectModel } from '@nestjs/sequelize';
import {
  InvoiceExpenseModel,
  InvoiceExpenseSchema,
  InvoiceModel,
  InvoiceSchema,
  InvoiceScheduleModel,
  InvoiceScheduleSchema,
} from '../common/schema/user/index.js';
import { EnvService } from '@nhl/env';
import { Env } from '../common/env.js';
import { MailSenderClient } from '../common/mail-sender.client.js';

@Injectable()
export class InvoicesService {
  private readonly mailSenderClient: MailSenderClient;

  constructor(
    private readonly locationSvc: LocationsService,
    private readonly rentProviderSvc: RentProvidersService,
    private readonly tenantSvc: TenantService,
    @InjectModel(InvoiceSchema)
    private readonly invoiceRepository: InvoiceModel,
    @InjectModel(InvoiceExpenseSchema)
    private readonly invoiceExpenseRepository: InvoiceExpenseModel,
    @InjectModel(InvoiceScheduleSchema)
    private readonly scheduleRepository: InvoiceScheduleModel,
    private readonly config: EnvService<Env>,
  ) {
    this.mailSenderClient = new MailSenderClient({
      baseURL: this.config.get('mailjs.url'),
      serviceId: this.config.get('mailjs.serviceId'),
      userId: this.config.get('mailjs.userId'),
      invoiceTemplateId: this.config.get('mailjs.template.invoice'),
      timeoutMs: this.config.get('mailjs.timeoutMs'),
    });
  }

  async create(payload: Record<string, unknown>) {
    const locationCode = Number(payload.locationCode);
    const expenses = Array.isArray(payload.expenses) ? payload.expenses : [];

    if (!locationCode || expenses.length === 0) {
      throw new Error('Location and expenses are required');
    }

    const snapshots = expenses.map((expense: Record<string, unknown>) => {
      const initialUnit = Number(expense.initialUnit || 0);
      const currentUnit = Number(expense.currentUnit || 0);
      const unitPrice = Number(expense.price || 0);

      return {
        expenseCode: Number(expense.expenseCode),
        expenseName: String(expense.expenseName || ''),
        type: String(expense.type || ''),
        unitName: String(expense.unitName || ''),
        initialUnit,
        currentUnit,
        unitPrice,
        amount: (currentUnit - initialUnit) * unitPrice,
      };
    });
    const totalAmount = snapshots.reduce((total, expense) => total + expense.amount, 0);
    const transaction = await this.invoiceRepository.sequelize.transaction();

    try {
      const invoice = await this.invoiceRepository.create(
        { locationCode, totalAmount, status: 'DRAFT' },
        { transaction },
      );
      await this.invoiceExpenseRepository.bulkCreate(
        snapshots.map((expense) => ({ ...expense, invoiceCode: invoice.invoiceCode })),
        { transaction },
      );
      await transaction.commit();
      return { ...invoice.toJSON(), expenses: snapshots };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  findAll(query: PaginatedQuery) {
    return this.invoiceRepository.findAll({ order: [['createdAt', 'DESC']] });
  }

  async listSchedules() {
    const [locations, invoices, schedules] = await Promise.all([
      this.locationSvc.findAll({ page: 1, size: 1000 }),
      this.invoiceRepository.findAll({ order: [['createdAt', 'DESC']] }),
      this.scheduleRepository.findAll(),
    ]);

    return locations.data.map((location) => {
      const locationCode = Number(location.locationCode);
      const schedule = schedules.find((item) => item.locationCode === locationCode);
      const locationInvoices = invoices.filter((invoice) => invoice.locationCode === locationCode);

      return {
        location,
        schedule: schedule || null,
        invoices: locationInvoices,
      };
    });
  }

  async saveSchedule(locationCode: number, payload: Record<string, unknown>) {
    const location = await this.locationSvc.findOne(locationCode);
    const dueDay = Number(payload.dueDay);
    if (dueDay < 1 || dueDay > 28) throw new Error('dueDay must be between 1 and 28');

    const invoiceCode = payload.invoiceCode ? Number(payload.invoiceCode) : undefined;
    if (invoiceCode) {
      const invoice = await this.invoiceRepository.findOne({ where: { invoiceCode } });
      if (!invoice || invoice.locationCode !== Number(location.locationCode)) {
        throw new Error('Invoice does not belong to this location');
      }
    }

    const [schedule] = await this.scheduleRepository.findOrCreate({
      where: { locationCode },
      defaults: {
        locationCode,
        invoiceCode,
        dueDay,
        enabled: payload.enabled !== false,
      },
    });

    return schedule.update({
      invoiceCode,
      dueDay,
      enabled: payload.enabled !== false,
    });
  }

  async notifySchedule(locationCode: number) {
    const schedule = await this.scheduleRepository.findByPk(locationCode);
    if (!schedule || !schedule.enabled) throw new Error('Schedule is disabled');

    const tenants = await this.tenantSvc.findTenantsByLocation(locationCode);
    if (!tenants.length) throw new Error('Location has no tenants');
    if (!schedule.invoiceCode) throw new Error('No invoice assigned');

    const [invoice, location] = await Promise.all([
      this.invoiceRepository.findByPk(schedule.invoiceCode),
      this.locationSvc.findOne(locationCode),
    ]);
    if (!invoice) throw new Error('Invoice not found');
    if (!location.owner) throw new Error('Location has no rent provider');

    const provider = await this.rentProviderSvc.findOne(Number(location.owner));
    if (!provider?.email) throw new Error('Rent provider has no email');

    const invoiceExpenses = await this.invoiceExpenseRepository.findAll({
      where: { invoiceCode: schedule.invoiceCode },
      order: [['invoiceExpenseCode', 'ASC']],
    });

    const mailResult = await this.mailSenderClient.sendInvoice({
      recipientEmail: provider.email,
      providerName: provider.providerName,
      locationName: location.locationName,
      locationCode,
      invoiceCode: invoice.invoiceCode,
      dueDay: schedule.dueDay,
      total: Number(invoice.totalAmount).toLocaleString('vi-VN'),
      expenses: invoiceExpenses.map((expense) => ({
        name: expense.expenseName,
        type: expense.type,
        units: expense.type === 'per_unit'
          ? `${expense.initialUnit} - ${expense.currentUnit} ${expense.unitName}`
          : expense.unitName,
        unitPrice: Number(expense.unitPrice).toLocaleString('vi-VN'),
        amount: Number(expense.amount).toLocaleString('vi-VN'),
      })),
    });

    if ('error' in mailResult) {
      await schedule.update({
        lastStatus: 'FAILED',
        lastError: mailResult.error,
      });

      return {
        locationCode,
        recipient: 'rent-provider',
        tenantCount: tenants.length,
        status: 'FAILED',
        message: mailResult.error,
      };
    }

    await schedule.update({ lastNotifiedAt: new Date(), lastStatus: 'SENT', lastError: null });
    return {
      locationCode,
      invoiceCode: schedule.invoiceCode,
      recipient: 'rent-provider',
      tenantCount: tenants.length,
      status: 'SENT',
      message: 'Invoice notification sent to the rent provider',
    };
  }

  async findOneByTenantId(id: number) {
    const result = {};
    const tenant = await this.tenantSvc.findOne(id);
    Object.assign(result, { tenant });
    const assignments = await this.tenantSvc.findLocationsByTenant(id);
    const [assignment] = assignments;
    if (assignment) {
      const location = await this.locationSvc.findOne(assignment.locationCode);
      Object.assign(result, { location });
      if (location.owner) {
        const owner = await this.rentProviderSvc.findOne(+location.owner);
        Object.assign(result, { owner });
      }
    }

    return result;
  }

  async findOneByLocation(id: number) {
    const result = {};
    const location = await this.locationSvc.findOne(id);

    const tenants =
      (await this.tenantSvc.findTenantsByLocation(+location.locationCode)) ||
      [];

    const owner = await this.rentProviderSvc.findOne(+location.owner);

    Object.assign(result, { location, tenants, owner });

    return result;
  }

  async update(id: number, payload: Record<string, unknown>) {
    throw new NotImplementedException();
  }

  async remove(id: number) {
    throw new NotImplementedException();
  }
}
