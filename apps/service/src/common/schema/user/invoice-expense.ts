import { Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseEntity } from '../base/index.js';
import { ExpenseSchema } from './expense.js';
import { InvoiceSchema } from './invoice.js';

@Table({ tableName: 'invoice_expenses' })
export class InvoiceExpenseSchema extends BaseEntity {
    @PrimaryKey
    @Column({ autoIncrement: true })
    invoiceExpenseCode: number;

    @ForeignKey(() => InvoiceSchema)
    @Column
    invoiceCode: number;

    @ForeignKey(() => ExpenseSchema)
    @Column
    expenseCode: number;

    @Column
    expenseName: string;

    @Column
    type: string;

    @Column
    unitName: string;

    @Column({ type: DataType.DECIMAL(15, 2) })
    initialUnit: number;

    @Column({ type: DataType.DECIMAL(15, 2) })
    currentUnit: number;

    @Column({ type: DataType.DECIMAL(15, 2) })
    unitPrice: number;

    @Column({ type: DataType.DECIMAL(15, 2) })
    amount: number;
}

export type InvoiceExpenseModel = typeof InvoiceExpenseSchema;
