import { Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseEntity } from '../base/index.js';

@Table({ tableName: 'invoices' })
export class InvoiceSchema extends BaseEntity {
    @PrimaryKey
    @Column({ autoIncrement: true })
    invoiceCode: number;

    @Column
    locationCode: number;

    @Column({ type: DataType.DECIMAL(15, 2) })
    totalAmount: number;

    @Column
    status: string;
}

export type InvoiceModel = typeof InvoiceSchema;
