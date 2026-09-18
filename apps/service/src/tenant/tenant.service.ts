import { Injectable } from '@nestjs/common';
import { TenantModel, TenantSchema } from '../common/schema/user/index.js';
import { InjectModel } from '@nestjs/sequelize';
import { PaginatedQuery, paginatedQuery } from '../common/pagination.js';
import { FilePostService } from '../filepost/filepost.service.js';
import { TenantLocationModel, TenantLocationSchema } from '../common/schema/user/index.js';
import { Op } from 'sequelize';
import 'multer';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(TenantSchema)
    private readonly tenantRepository: TenantModel,
    @InjectModel(TenantLocationSchema)
    private readonly tenantLocationRepository: TenantLocationModel,
    private readonly filePostService: FilePostService,
  ) { }

  async create(payload: Record<string, unknown>, contract?: Express.Multer.File) {
    const contractUrl = contract
      ? await this.filePostService.upload(contract)
      : undefined;

    const { locationCode, ...tenantPayload } = payload;
    const tenant = await this.tenantRepository.create({ ...tenantPayload, contractUrl });
    if (locationCode) {
      await this.assignLocation(tenant.tenantCode, Number(locationCode));
    }
    return tenant;
  }

  findAll(query: PaginatedQuery) {
    return paginatedQuery<TenantSchema>(this.tenantRepository, query);
  }

  findOne(id: number) {
    return this.tenantRepository.findByPk(id);
  }

  async findTenantsByLocation(id: number) {
    const assignments = await this.tenantLocationRepository.findAll({
      where: { locationCode: id },
    });
    const assignedTenantCodes = assignments.map(({ tenantCode }) => tenantCode);

    return this.tenantRepository.findAll({
      where: assignedTenantCodes.length
        ? { tenantCode: { [Op.in]: assignedTenantCodes } }
        : { tenantCode: { [Op.in]: [] } },
    });
  }

  async findLocationsByTenant(tenantCode: number) {
    return this.tenantLocationRepository.findAll({ where: { tenantCode } });
  }

  async assignLocation(tenantCode: number, locationCode: number) {
    const tenant = await this.tenantRepository.findByPk(tenantCode);
    if (!tenant) throw new Error('Tenant not found');

    await this.tenantLocationRepository.findOrCreate({
      where: { tenantCode, locationCode },
      defaults: { tenantCode, locationCode },
    });

    return tenant;
  }

  async update(
    id: number,
    payload: Record<string, unknown>,
    contract?: Express.Multer.File,
  ) {
    const { locationCode, ...tenantPayload } = payload;
    const instance = await this.tenantRepository.findByPk(id);

    if (!instance) throw new Error('Owner not found');

    const contractUrl = contract
      ? await this.filePostService.upload(contract)
      : undefined;

    const result = await instance.update({
      ...tenantPayload,
      ...(contractUrl ? { contractUrl } : {}),
    });

    if (locationCode) await this.assignLocation(id, Number(locationCode));
    return result;
  }

  async remove(id: number) {
    const tenant = await this.tenantRepository.findByPk(id);

    return tenant.destroy();
  }
}
