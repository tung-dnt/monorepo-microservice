import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantService } from './tenant.service.js';
import 'multer';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @Post()
  @UseInterceptors(FileInterceptor('contract'))
  create(
    @Body() createTenantDto: Record<string, unknown>,
    @UploadedFile() contract?: Express.Multer.File,
  ) {
    return this.tenantService.create(createTenantDto, contract);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.tenantService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(+id);
  }

  @Post(':tenantCode/locations/:locationCode')
  assignLocation(
    @Param('tenantCode') tenantCode: string,
    @Param('locationCode') locationCode: string,
  ) {
    return this.tenantService.assignLocation(+tenantCode, +locationCode);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('contract'))
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: Record<string, unknown>,
    @UploadedFile() contract?: Express.Multer.File,
  ) {
    return this.tenantService.update(+id, updateTenantDto, contract);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantService.remove(+id);
  }
}
