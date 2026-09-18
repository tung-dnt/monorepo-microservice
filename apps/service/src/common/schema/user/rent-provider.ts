import { Column, PrimaryKey, Table } from "sequelize-typescript";
import { BaseEntity } from "../base/index.js";

@Table({ tableName: "rent_providers" })
export class RentProviderSchema extends BaseEntity {
  @PrimaryKey
  @Column
  providerCode: number;

  @Column
  providerName: string;

  @Column
  firstName?: string;

  @Column
  lastName?: string;

  @Column
  dateOfBirth: Date;

  @Column
  phoneNumber: string;

  @Column
  email?: string;

  @Column
  contactAddress?: string;

  @Column
  gender: number;

  genderName: string;

  @Column
  description?: string;
}

export type RentProviderModel = typeof RentProviderSchema;