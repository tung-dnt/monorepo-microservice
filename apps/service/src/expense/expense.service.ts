import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  ExpenseLocationModel,
  ExpenseLocationSchema,
  ExpenseModel,
  ExpenseSchema,
} from '../common/schema/user/index.js';
import { PaginatedQuery, paginatedQuery } from '../common/pagination.js';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(ExpenseSchema)
    private readonly expenseRepository: ExpenseModel,
  ) {}

  create(payload: Record<string, unknown>) {
    return this.expenseRepository.create({
      ...payload,
      unitName: payload.unitName || 'unit',
    });
  }

  findAll(query: PaginatedQuery) {
    return paginatedQuery<ExpenseSchema>(this.expenseRepository, query);
  }

  findOne(id: number) {
    return this.expenseRepository.findByPk(id);
  }

  async update(id: number, payload: Record<string, unknown>) {
    const instance = await this.expenseRepository.findByPk(id);

    if (!instance) throw new Error('Expense not found');

    return instance.update({ ...payload });
  }

  async remove(id: number) {
    const provider = await this.expenseRepository.findByPk(id);

    return provider.destroy();
  }
}
