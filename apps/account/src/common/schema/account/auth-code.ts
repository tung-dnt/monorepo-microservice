import { Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { AccountSchema } from "../user/index.js";

@Table({ tableName: "auth_codes", timestamps: false })
export class AuthCodeSchema extends Model<AuthCodeSchema> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id: number;

  @Column
  code: number;

  @Column
  @ForeignKey(() => AccountSchema)
  accountId: number;

  @Column
  codeType: string;

  @Column
  expiresAt: number;

  @Column
  createdAt: Date;
}

export type AuthCodeModel = typeof AuthCodeSchema;