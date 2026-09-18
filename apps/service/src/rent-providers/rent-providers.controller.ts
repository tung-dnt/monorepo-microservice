import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RentProvidersService } from './rent-providers.service.js';

@Controller('rent-provider')
export class RentProvidersController {
  constructor(private readonly rentProvider: RentProvidersService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.rentProvider.create(payload);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.rentProvider.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentProvider.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.rentProvider.update(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentProvider.remove(+id);
  }
}
