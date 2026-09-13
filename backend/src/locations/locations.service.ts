import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLocationInput, LocationRow, UpdateLocationInput } from './locations.types.js';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertValidParent(userId: string, id: string | null, parentLocationId: string | null | undefined): Promise<void> {
    if (!parentLocationId) {
      return;
    }
    if (parentLocationId === id) {
      throw new BadRequestException('A location cannot be its own parent');
    }
    const parent = await this.prisma.location.findFirst({ where: { id: parentLocationId, userId } });
    if (!parent) {
      throw new NotFoundException('Parent location not found');
    }
    // Walk up the chain being assigned to make sure `id` isn't one of its
    // own ancestors (which would turn the tree into a cycle).
    let current: string | null = parent.parentLocationId;
    while (current) {
      if (current === id) {
        throw new BadRequestException('That would create a location loop');
      }
      const next: { parentLocationId: string | null } | null = await this.prisma.location.findFirst({
        where: { id: current, userId },
        select: { parentLocationId: true },
      });
      current = next?.parentLocationId ?? null;
    }
  }

  async create(userId: string, input: CreateLocationInput): Promise<LocationRow> {
    await this.assertValidParent(userId, null, input.parentLocationId);
    return this.prisma.location.create({
      data: {
        userId,
        name: input.name,
        photoPath: input.photoPath,
        latitude: input.latitude,
        longitude: input.longitude,
        parentLocationId: input.parentLocationId || null,
      },
    });
  }

  findAllForUser(userId: string): Promise<LocationRow[]> {
    return this.prisma.location.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async update(userId: string, id: string, input: UpdateLocationInput): Promise<LocationRow> {
    if (input.parentLocationId !== undefined) {
      await this.assertValidParent(userId, id, input.parentLocationId);
    }
    const result = await this.prisma.location.updateMany({
      where: { id, userId },
      data: { ...input, parentLocationId: input.parentLocationId === undefined ? undefined : input.parentLocationId || null },
    });
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
