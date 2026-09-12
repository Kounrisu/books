import { describe, it, expect } from 'vitest';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('constructs without connecting (no DB required for this test)', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
    const service = new PrismaService();
    expect(service).toBeDefined();
    expect(service.user).toBeDefined();
    expect(service.book).toBeDefined();
    expect(service.location).toBeDefined();
  });
});
