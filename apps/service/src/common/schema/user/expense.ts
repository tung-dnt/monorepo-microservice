import { BelongsToMany, Column, PrimaryKey, Table } from "sequelize-typescript";
import { BaseEntity } from "../base/index.js";
import { LocationSchema } from "./location.js";
import { ExpenseLocationSchema } from "./expense-location.js";

@Table({ tableName: "expenses" })
export class ExpenseSchema extends BaseEntity {
  @PrimaryKey
  @Column
  expenseCode: string;

  @Column
  expenseName: string;

  @Column
  type?: string;

  @Column
  price: number;

  @Column
  inUsed: boolean;

  @Column
  unitName?: string;

  @BelongsToMany(() => LocationSchema, () => ExpenseLocationSchema, "expenseCode")
  locations?: Array<any>;
}

export type ExpenseModel = typeof ExpenseSchema;