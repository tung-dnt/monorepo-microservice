import { AllowNull, Column, PrimaryKey, Table } from "sequelize-typescript";
import { BaseEntity } from "../base/index.js";

@Table({ tableName: "roles" })
export class RoleSchema extends BaseEntity {
  @PrimaryKey
  @AllowNull(false)
  @Column
  id: number;

  @Column
  role: string;
}

export type RoleModel = typeof RoleSchema;