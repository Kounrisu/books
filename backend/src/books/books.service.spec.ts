import { describe, it, expect, vi } from 'vitest';
import { BooksService } from './books.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(
  overrides: Partial<
    Record<
      | 'create'
      | 'findMany'
      | 'updateMany'
      | 'findFirstOrThrow'
      | 'deleteMany'
      | 'locationFindFirst',
      unknown
    >
  > = {},
) {
  return {
    book: {
      create: vi.fn().mockResolvedValue(overrides.create ?? null),
      findMany: vi.fn().mockResolvedValue(overrides.findMany ?? []),
      updateMany: vi
        .fn()
        .mockResolvedValue(overrides.updateMany ?? { count: 1 }),
      findFirstOrThrow: vi
        .fn()
        .mockResolvedValue(overrides.findFirstOrThrow ?? null),
      deleteMany: vi
        .fn()
        .mockResolvedValue(overrides.deleteMany ?? { count: 1 }),
    },
    location: {
      findFirst: vi
        .fn()
        .mockResolvedValue(
          'locationFindFirst' in overrides
            ? overrides.locationFindFirst
            : { id: 'location-1', userId: 'user-1' },
        ),
    },
  } as unknown as PrismaService;
}

describe('BooksService', () => {
  it('creates a book scoped to the given user, requiring only title and author', async () => {
    const prisma = makePrismaMock({
      create: {
        id: 'book-1',
        userId: 'user-1',
        title: 'Dune',
        author: 'Herbert',
      },
    });
    const service = new BooksService(prisma);

    await service.create('user-1', { title: 'Dune', author: 'Herbert' });

    expect(prisma.book.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        title: 'Dune',
        author: 'Herbert',
      }),
    });
  });

  it("lists the user's books enriched with computed ranking", async () => {
    const prisma = makePrismaMock({
      findMany: [
        { id: 'a', userId: 'user-1', category: 'Sci-Fi', myNote: 9 },
        { id: 'b', userId: 'user-1', category: 'Sci-Fi', myNote: 5 },
      ],
    });
    const service = new BooksService(prisma);

    const result = await service.findAllForUser('user-1');

    expect(prisma.book.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
    expect(result[0].ranking).toEqual({
      categoryRank: 1,
      categoryTotal: 2,
      overallRank: 1,
      overallTotal: 2,
    });
    expect(result[1].ranking).toEqual({
      categoryRank: 2,
      categoryTotal: 2,
      overallRank: 2,
      overallTotal: 2,
    });
  });

  it('gives a null ranking to a book with no myNote yet', async () => {
    const prisma = makePrismaMock({
      findMany: [
        { id: 'a', userId: 'user-1', category: 'Sci-Fi', myNote: null },
      ],
    });
    const service = new BooksService(prisma);

    const result = await service.findAllForUser('user-1');

    expect(result[0].ranking).toBeNull();
  });

  it('rejects updating a book that does not belong to the user', async () => {
    const prisma = makePrismaMock({ updateMany: { count: 0 } });
    const service = new BooksService(prisma);

    await expect(
      service.update('user-1', 'book-of-someone-else', { title: 'x' }),
    ).rejects.toThrow('Book not found');
  });

  it('rejects deleting a book that does not belong to the user', async () => {
    const prisma = makePrismaMock({ deleteMany: { count: 0 } });
    const service = new BooksService(prisma);

    await expect(
      service.delete('user-1', 'book-of-someone-else'),
    ).rejects.toThrow('Book not found');
  });

  it('rejects creating a book with a locationId that belongs to a different user', async () => {
    const prisma = makePrismaMock({ locationFindFirst: null });
    const service = new BooksService(prisma);

    await expect(
      service.create('user-1', {
        title: 'Dune',
        author: 'Herbert',
        locationId: 'location-of-someone-else',
      }),
    ).rejects.toThrow('Location not found');

    expect(prisma.location.findFirst).toHaveBeenCalledWith({
      where: { id: 'location-of-someone-else', userId: 'user-1' },
    });
    expect(prisma.book.create).not.toHaveBeenCalled();
  });

  it('rejects updating a book with a locationId that belongs to a different user', async () => {
    const prisma = makePrismaMock({ locationFindFirst: null });
    const service = new BooksService(prisma);

    await expect(
      service.update('user-1', 'book-1', {
        locationId: 'location-of-someone-else',
      }),
    ).rejects.toThrow('Location not found');

    expect(prisma.location.findFirst).toHaveBeenCalledWith({
      where: { id: 'location-of-someone-else', userId: 'user-1' },
    });
    expect(prisma.book.updateMany).not.toHaveBeenCalled();
  });
});
