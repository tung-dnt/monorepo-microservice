import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { InvoicesService } from './invoices.service.js';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceSvc: InvoicesService) { }

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.invoiceSvc.create(payload);
  }

  @Get('schedules')
  listSchedules() {
    return this.invoiceSvc.listSchedules();
  }

  @Put('schedules/:locationCode')
  saveSchedule(
    @Param('locationCode', ParseIntPipe) locationCode: number,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.invoiceSvc.saveSchedule(locationCode, payload);
  }

  @Post('schedules/:locationCode/notify')
  notifySchedule(@Param('locationCode', ParseIntPipe) locationCode: number) {
    return this.invoiceSvc.notifySchedule(locationCode);
  }

  @Get('get-summerize-data/:locationId')
  findByLOcationId(@Param('locationId', ParseIntPipe) id: number) {
    return this.invoiceSvc.findOneByLocation(id);
  }

  @Get(':tenantId')
  findByTenantId(@Param('tenantId', ParseIntPipe) id: number) {
    return this.invoiceSvc.findOneByTenantId(id);
  }
}
