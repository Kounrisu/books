import { describe, it, expect, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(overrides: { findUnique?: unknown; create?: unknown } = {}) {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(overrides.findUnique ?? null),
      create: vi.fn().mockResolvedValue(overrides.create ?? null),
    },
  } as unknown as PrismaService;
}

describe('AuthService', () => {
  it('registers a new user and returns an access token', async () => {
    const prisma = makePrismaMock({
      findUnique: null,
      create: { id: 'user-1', email: 'a@b.com', passwordHash: 'hashed', createdAt: new Date() },
    });
    const service = new AuthService(prisma, {} as any, 'test-secret');

    const result = await service.register('a@b.com', 'password123');

    expect(result.accessToken).toBeTruthy();
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'a@b.com' }) }),
    );
  });

  it('rejects registration when the email is already taken', async () => {
    const prisma = makePrismaMock({ findUnique: { id: 'user-1', email: 'a@b.com' } });
    const service = new AuthService(prisma, {} as any, 'test-secret');

    await expect(service.register('a@b.com', 'password123')).rejects.toThrow('Email already registered');
  });

  it('logs in with correct credentials', async () => {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    const prisma = makePrismaMock({
      findUnique: { id: 'user-1', email: 'a@b.com', passwordHash, isActive: true },
    });
    const service = new AuthService(prisma, {} as any, 'test-secret');

    const result = await service.login('a@b.com', 'password123');

    expect(result.accessToken).toBeTruthy();
  });

  it('rejects login with wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    const prisma = makePrismaMock({
      findUnique: { id: 'user-1', email: 'a@b.com', passwordHash, isActive: true },
    });
    const service = new AuthService(prisma, {} as any, 'test-secret');

    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('rejects login for a disabled account', async () => {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    const prisma = makePrismaMock({
      findUnique: { id: 'user-1', email: 'a@b.com', passwordHash, isActive: false },
    });
    const service = new AuthService(prisma, {} as any, 'test-secret');

    await expect(service.login('a@b.com', 'password123')).rejects.toThrow(
      'This account has been disabled',
    );
  });
});
