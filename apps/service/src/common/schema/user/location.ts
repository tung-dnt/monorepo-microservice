import { BelongsToMany, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { RentProviderSchema } from "./rent-provider.js";
import { ExpenseSchema } from "./expense.js";
import { ExpenseLocationSchema } from "./expense-location.js";

@Table({ tableName: "locations", timestamps: false })
export class LocationSchema extends Model {
  @PrimaryKey
  @Column
  locationCode: string;

  @Column
  locationName: string;

  @Column
  locationAddress: string;

  @Column
  roomSize: number;

  @Column
  description?: string;

  @Column
  @ForeignKey(() => RentProviderSchema)
  owner?: string;

  @Column
  image?: string;

  @BelongsToMany(() => ExpenseSchema, () => ExpenseLocationSchema, "locationCode")
  expenses?: Array<any>;
}

export type LocationModel = typeof LocationSchema;