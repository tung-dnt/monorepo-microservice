import { Injectable } from '@nestjs/common';
import { RentProviderModel, RentProviderSchema } from '../common/schema/user/index.js';
import { UpsertRentProviderDto } from './dto/upsert-provider.dto.js';
import { InjectModel } from '@nestjs/sequelize';
import { PaginatedQuery, paginatedQuery } from '../common/pagination.js';

@Injectable()
export class RentProvidersService {
  constructor(
    @InjectModel(RentProviderSchema)
    private readonly rentProviderRepository: RentProviderModel,
  ) {}

  create(payload: Record<string, unknown>) {
    return this.rentProviderRepository.create(payload);
  }

  findAll(query: PaginatedQuery) {
    return paginatedQuery<RentProviderSchema>(
      this.rentProviderRepository,
      query,
    );
  }

  findOne(id: number) {
    return this.rentProviderRepository.findByPk(id);
  }

  async update(id: number, payload: Record<string, unknown>) {
    const instance = await this.rentProviderRepository.findByPk(id);

    if (!instance) throw new Error('Owner not found');

    return instance.update({ ...payload });
  }

  async remove(id: number) {
    const provider = await this.rentProviderRepository.findByPk(id);

    return provider.destroy();
  }
}
