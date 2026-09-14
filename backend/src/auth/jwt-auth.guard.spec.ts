import { describe, it, expect, vi } from 'vitest';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const SECRET = 'test-secret';

function makeContext(headers: Record<string, string>): ExecutionContext {
  const request: Record<string, unknown> = { headers };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function makePrismaMock(user: { isActive: boolean } | null): PrismaService {
  return {
    user: { findUnique: vi.fn().mockResolvedValue(user) },
  } as unknown as PrismaService;
}

describe('JwtAuthGuard', () => {
  it('rejects a request with no bearer token', async () => {
    const guard = new JwtAuthGuard(SECRET, makePrismaMock({ isActive: true }));
    await expect(guard.canActivate(makeContext({}))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token for a user that no longer exists', async () => {
    const jwt = new JwtService({ secret: SECRET });
    const token = jwt.sign({ sub: 'deleted-user' });
    const guard = new JwtAuthGuard(SECRET, makePrismaMock(null));

    await expect(
      guard.canActivate(makeContext({ authorization: `Bearer ${token}` })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a valid token belonging to a deactivated account', async () => {
    const jwt = new JwtService({ secret: SECRET });
    const token = jwt.sign({ sub: 'user-1' });
    const guard = new JwtAuthGuard(SECRET, makePrismaMock({ isActive: false }));

    await expect(
      guard.canActivate(makeContext({ authorization: `Bearer ${token}` })),
    ).rejects.toThrow('Account is disabled or no longer exists');
  });

  it('accepts a valid token for an active account', async () => {
    const jwt = new JwtService({ secret: SECRET });
    const token = jwt.sign({ sub: 'user-1' });
    const guard = new JwtAuthGuard(SECRET, makePrismaMock({ isActive: true }));

    await expect(
      guard.canActivate(makeContext({ authorization: `Bearer ${token}` })),
    ).resolves.toBe(true);
  });
});
