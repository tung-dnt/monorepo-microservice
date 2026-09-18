import { Column, PrimaryKey, Table } from "sequelize-typescript";
import { BaseEntity } from "../base/index.js";

@Table({ tableName: "tenants" })
export class TenantSchema extends BaseEntity {
  @PrimaryKey
  @Column
  tenantCode: number;

  @Column
  firstName?: string;

  @Column
  lastName?: string;

  @Column
  tenantName: string;

  @Column
  dateOfBirth: Date;

  @Column
  gender: number;

  genderName: string;

  @Column
  phoneNumber: string;

  @Column
  email?: string;

  @Column
  contactAddress: string;

  @Column
  description?: string;

  @Column
  contractUrl?: string;
}

export type TenantModel = typeof TenantSchema;