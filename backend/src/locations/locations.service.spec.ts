import { describe, it, expect, vi } from 'vitest';
import { LocationsService } from './locations.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { UploadsService } from '../uploads/uploads.service.js';

function makePrismaMock(
  overrides: Partial<Record<'create' | 'findMany' | 'updateMany' | 'update' | 'deleteMany' | 'delete' | 'findFirst' | 'findFirstOrThrow', unknown>> = {},
) {
  return {
    location: {
      create: vi.fn().mockResolvedValue(overrides.create ?? null),
      findMany: vi.fn().mockResolvedValue(overrides.findMany ?? []),
      updateMany: vi.fn().mockResolvedValue(overrides.updateMany ?? { count: 1 }),
      update: vi.fn().mockResolvedValue(overrides.update ?? null),
      deleteMany: vi.fn().mockResolvedValue(overrides.deleteMany ?? { count: 1 }),
      delete: vi.fn().mockResolvedValue(overrides.delete ?? null),
      findFirst: vi
        .fn()
        .mockResolvedValue(
          'findFirst' in overrides
            ? overrides.findFirst
            : { id: 'loc-1', userId: 'user-1', photoPath: null, parentLocationId: null },
        ),
      findFirstOrThrow: vi.fn().mockResolvedValue(overrides.findFirstOrThrow ?? null),
    },
  } as unknown as PrismaService;
}

function makeUploadsMock(): UploadsService {
  return {
    saveImage: vi.fn().mockResolvedValue('generated-filename.webp'),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  } as unknown as UploadsService;
}

describe('LocationsService', () => {
  it('creates a location scoped to the given user', async () => {
    const prisma = makePrismaMock({ create: { id: 'loc-1', userId: 'user-1', name: 'Garage' } });
    const service = new LocationsService(prisma, makeUploadsMock());

    await service.create('user-1', { name: 'Garage' });

    expect(prisma.location.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'Garage',
        photoPath: undefined,
        latitude: undefined,
        longitude: undefined,
        parentLocationId: null,
      },
    });
  });

  it('lists only the given user\'s locations', async () => {
    const prisma = makePrismaMock({ findMany: [{ id: 'loc-1', userId: 'user-1' }] });
    const service = new LocationsService(prisma, makeUploadsMock());

    const result = await service.findAllForUser('user-1');

    expect(prisma.location.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([{ id: 'loc-1', userId: 'user-1' }]);
  });

  it('rejects updating a location that does not belong to the user', async () => {
    const prisma = makePrismaMock({ findFirst: null });
    const service = new LocationsService(prisma, makeUploadsMock());

    await expect(service.update('user-1', 'loc-of-someone-else', { name: 'x' })).rejects.toThrow('Location not found');
  });

  it('rejects deleting a location that does not belong to the user', async () => {
    const prisma = makePrismaMock({ findFirst: null });
    const service = new LocationsService(prisma, makeUploadsMock());

    await expect(service.delete('user-1', 'loc-of-someone-else')).rejects.toThrow('Location not found');
  });

  it('rejects a location being set as its own parent', async () => {
    const prisma = makePrismaMock();
    const service = new LocationsService(prisma, makeUploadsMock());

    await expect(
      service.update('user-1', 'loc-1', { parentLocationId: 'loc-1' }),
    ).rejects.toThrow('A location cannot be its own parent');
  });

  it('rejects assigning a parent that would create a loop', async () => {
    // loc-1 (being edited) is already the parent of loc-2; assigning loc-2
    // as loc-1's parent would create a cycle.
    const prisma = makePrismaMock({
      findFirst: { id: 'loc-2', parentLocationId: 'loc-1' },
    });
    const service = new LocationsService(prisma, makeUploadsMock());

    await expect(
      service.update('user-1', 'loc-1', { parentLocationId: 'loc-2' }),
    ).rejects.toThrow('That would create a location loop');
  });
});
