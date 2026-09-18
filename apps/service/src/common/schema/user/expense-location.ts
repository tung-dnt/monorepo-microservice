import { Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { LocationSchema } from "./location.js";
import { ExpenseSchema } from "./expense.js";
import { BaseEntity } from "../base/index.js";

@Table({
  modelName: "expenses_location",
  tableName: "expenses_location",
  indexes: [
    {
      unique: true,
      fields: ["locationCode", "expenseCode"],
    },
  ],
})
export class ExpenseLocationSchema extends BaseEntity {
  @ForeignKey(() => ExpenseSchema)
  @Column({ unique: false })
  expenseCode: number;

  @ForeignKey(() => LocationSchema)
  @Column({ unique: false })
  locationCode: number;

  @Column({ type: DataType.INTEGER })
  initialUnit: number;

  @Column({ type: DataType.INTEGER })
  currentUnit: number;
}

export type ExpenseLocationModel = typeof ExpenseLocationSchema;