import { describe, it, expect, vi } from 'vitest';
import { LocationsService } from './locations.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(overrides: Partial<Record<'create' | 'findMany' | 'updateMany' | 'update' | 'deleteMany', unknown>> = {}) {
  return {
    location: {
      create: vi.fn().mockResolvedValue(overrides.create ?? null),
      findMany: vi.fn().mockResolvedValue(overrides.findMany ?? []),
      updateMany: vi.fn().mockResolvedValue(overrides.updateMany ?? { count: 1 }),
      update: vi.fn().mockResolvedValue(overrides.update ?? null),
      deleteMany: vi.fn().mockResolvedValue(overrides.deleteMany ?? { count: 1 }),
    },
  } as unknown as PrismaService;
}

describe('LocationsService', () => {
  it('creates a location scoped to the given user', async () => {
    const prisma = makePrismaMock({ create: { id: 'loc-1', userId: 'user-1', name: 'Garage' } });
    const service = new LocationsService(prisma);

    await service.create('user-1', { name: 'Garage' });

    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', name: 'Garage', photoPath: undefined, latitude: undefined, longitude: undefined },
    });
  });

  it('lists only the given user\'s locations', async () => {
    const prisma = makePrismaMock({ findMany: [{ id: 'loc-1', userId: 'user-1' }] });
    const service = new LocationsService(prisma);

    const result = await service.findAllForUser('user-1');

    expect(prisma.location.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([{ id: 'loc-1', userId: 'user-1' }]);
  });

  it('rejects updating a location that does not belong to the user', async () => {
    const prisma = makePrismaMock({ updateMany: { count: 0 } });
    const service = new LocationsService(prisma);

    await expect(service.update('user-1', 'loc-of-someone-else', { name: 'x' })).rejects.toThrow('Location not found');
  });

  it('rejects deleting a location that does not belong to the user', async () => {
    const prisma = makePrismaMock({ deleteMany: { count: 0 } });
    const service = new LocationsService(prisma);

    await expect(service.delete('user-1', 'loc-of-someone-else')).rejects.toThrow('Location not found');
  });
});
