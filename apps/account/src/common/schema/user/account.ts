import { Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { RoleSchema } from "./role.js";

@Table({ tableName: "accounts", timestamps: false })
export class AccountSchema extends Model<AccountSchema> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id: number;

  @Column
  fullName: string;

  @Column
  email: string;

  @Column
  password: string;

  @ForeignKey(() => RoleSchema)
  @Column({ type: DataType.INTEGER, allowNull: false })
  role: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  status: number;
}

export type AccountModel = typeof AccountSchema;