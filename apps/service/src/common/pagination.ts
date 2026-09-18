import { IsNumber, IsObject } from 'class-validator';
import { Model, type ModelCtor } from 'sequelize-typescript';
import { Expose, Transform, plainToClass } from 'class-transformer';
import lodash from 'lodash';
const { size } = lodash;

export class PaginatedQuery {
  //   @IsObject()
  //   filter?: Record<string, unknown>;

  @IsNumber()
  page?: number;

  @IsNumber()
  size?: number;
}

export class PaginatedResponse<M> {
  total: number;
  page: number;
  size: number;
  data: M[];
}

export async function paginatedQuery<T extends Model<any, any>>(
  model: ModelCtor<T>,
  filter: PaginatedQuery,
  rest?: Record<string, any>,
): Promise<PaginatedResponse<T>> {
  const transformFilter = plainToClass(PaginatedQuery, filter, {
    enableImplicitConversion: true,
  });

  console.log(transformFilter);

  const skip =
    transformFilter.page > 1
      ? (transformFilter.page - 1) * transformFilter.size
      : 0;
  const limit = transformFilter.size;

  const response = await model.findAndCountAll({
    offset: skip,
    limit,
    ...rest,
  });

  return {
    total: response.count,
    page: transformFilter.page,
    size: transformFilter.size,
    data: response.rows,
  };
}
