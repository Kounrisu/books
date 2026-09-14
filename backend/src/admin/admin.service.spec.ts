import { describe, it, expect, vi } from 'vitest';
import { AdminService } from './admin.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(overrides: {
  findUnique?: unknown;
  update?: unknown;
  count?: number;
  listUsers?: unknown[];
} = {}) {
  const userDelegate = {
    findMany: vi.fn().mockResolvedValue(overrides.listUsers ?? []),
    findUnique: vi.fn().mockResolvedValue(
      'findUnique' in overrides ? overrides.findUnique : { id: 'target-1', role: 'user', isActive: true },
    ),
    update: vi.fn().mockResolvedValue(overrides.update ?? { id: 'target-1', role: 'user', isActive: true }),
    count: vi.fn().mockResolvedValue(overrides.count ?? 1),
  };
  return {
    user: userDelegate,
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn({ user: userDelegate })),
  } as unknown as PrismaService;
}

describe('AdminService', () => {
  it('never includes passwordHash in the listed user rows', async () => {
    const prisma = makePrismaMock();
    const service = new AdminService(prisma);

    await service.listUsers();

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({ passwordHash: true }),
      }),
    );
    const call = (prisma.user.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.select.passwordHash).toBeUndefined();
  });

  it('never returns passwordHash from setRole/setActive responses', async () => {
    const prisma = makePrismaMock();
    const service = new AdminService(prisma);

    await service.setRole('admin-1', 'target-1', 'admin');
    await service.setActive('admin-1', 'target-1', false);

    for (const call of (prisma.user.update as ReturnType<typeof vi.fn>).mock.calls) {
      expect(call[0].select?.passwordHash).toBeUndefined();
    }
  });

  it('blocks demoting the last active admin', async () => {
    const prisma = makePrismaMock({
      findUnique: { id: 'target-1', role: 'admin', isActive: true },
      count: 0,
    });
    const service = new AdminService(prisma);

    await expect(service.setRole('admin-1', 'target-1', 'user')).rejects.toThrow(
      'Cannot demote the last active admin',
    );
  });

  it('blocks disabling the last active admin', async () => {
    const prisma = makePrismaMock({
      findUnique: { id: 'target-1', role: 'admin', isActive: true },
      count: 0,
    });
    const service = new AdminService(prisma);

    await expect(service.setActive('admin-1', 'target-1', false)).rejects.toThrow(
      'Cannot disable the last active admin',
    );
  });
});
