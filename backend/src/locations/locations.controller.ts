import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { imageUploadOptions } from '../uploads/multer.config.js';
import { LocationsService } from './locations.service.js';
import type { LocationRow } from './locations.types.js';

function parseCoordinate(value: string | undefined, field: string): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new BadRequestException(`${field} must be a number`);
  }
  return parsed;
}

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  create(
    @CurrentUser() userId: string,
    @Body() body: { name: string; latitude?: string; longitude?: string; parentLocationId?: string },
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<LocationRow> {
    return this.locationsService.create(
      userId,
      {
        name: body.name,
        latitude: parseCoordinate(body.latitude, 'latitude'),
        longitude: parseCoordinate(body.longitude, 'longitude'),
        parentLocationId: body.parentLocationId || null,
      },
      photo?.buffer,
    );
  }

  @Get()
  findAll(@CurrentUser() userId: string): Promise<LocationRow[]> {
    return this.locationsService.findAllForUser(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; latitude?: string; longitude?: string; parentLocationId?: string },
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<LocationRow> {
    return this.locationsService.update(
      userId,
      id,
      {
        name: body.name,
        latitude: parseCoordinate(body.latitude, 'latitude'),
        longitude: parseCoordinate(body.longitude, 'longitude'),
        parentLocationId: body.parentLocationId !== undefined ? body.parentLocationId || null : undefined,
      },
      photo?.buffer,
    );
  }

  @Delete(':id')
  delete(@CurrentUser() userId: string, @Param('id') id: string): Promise<void> {
    return this.locationsService.delete(userId, id);
  }
}
