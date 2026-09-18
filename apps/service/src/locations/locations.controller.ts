import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LocationsService } from './locations.service.js';

@Controller('location')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() payload: Record<string, unknown>,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.locationsService.create(payload, image);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.locationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: Record<string, unknown>,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.locationsService.update(+id, updateLocationDto, image);
  }

  @Patch(':id')
  assign(@Param('id') id: string, @Body() payload: number[]) {
    return this.locationsService.updateExpensesByLocation(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(+id);
  }
}
