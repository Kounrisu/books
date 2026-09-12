import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLocationInput, LocationRow, UpdateLocationInput } from './locations.types.js';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, input: CreateLocationInput): Promise<LocationRow> {
    return this.prisma.location.create({
      data: {
        userId,
        name: input.name,
        photoPath: input.photoPath,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });
  }

  findAllForUser(userId: string): Promise<LocationRow[]> {
    return this.prisma.location.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async update(userId: string, id: string, input: UpdateLocationInput): Promise<LocationRow> {
    const result = await this.prisma.location.updateMany({ where: { id, userId }, data: input });
    if (result.count === 0) {
      throw new NotFoundException('Location not found');
    }
    return this.prisma.location.findFirstOrThrow({ where: { id, userId } });
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.location.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new NotFoundException('Location not found');
    }
  }
}
