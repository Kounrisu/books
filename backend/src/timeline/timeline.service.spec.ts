import { describe, it, expect, vi } from 'vitest';
import { TimelineService } from './timeline.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(overrides: {
  book?: unknown;
  openLoan?: unknown;
  loan?: unknown;
} = {}) {
  const bookDelegate = {
    findFirst: vi.fn().mockResolvedValue('book' in overrides ? overrides.book : { id: 'book-1', userId: 'user-1' }),
    update: vi.fn().mockResolvedValue(null),
  };
  const loanDelegate = {
    findFirst: vi.fn().mockImplementation((args: { where: Record<string, unknown> }) => {
      if ('returnedAt' in args.where) {
        return Promise.resolve('openLoan' in overrides ? overrides.openLoan : null);
      }
      return Promise.resolve('loan' in overrides ? overrides.loan : { id: 'loan-1', userId: 'user-1', bookId: 'book-1', borrowerName: 'Alex', returnedAt: null });
    }),
    create: vi.fn().mockResolvedValue({ id: 'loan-1' }),
    update: vi.fn().mockResolvedValue({ id: 'loan-1', returnedAt: new Date() }),
  };
  const eventDelegate = { create: vi.fn().mockResolvedValue({}) };
  const tx = { book: bookDelegate, bookLoan: loanDelegate, bookTimelineEvent: eventDelegate };
  return {
    ...tx,
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(tx)),
  } as unknown as PrismaService;
}

describe('TimelineService', () => {
  it('rejects a timeline event referencing a book owned by another user', async () => {
    const prisma = makePrismaMock({ book: null });
    const service = new TimelineService(prisma);

    await expect(
      service.createEvent('user-1', {
        bookId: 'someone-elses-book',
        eventType: 'acquired',
        occurredAt: new Date(),
        title: 'Acquired',
      }),
    ).rejects.toThrow('Book not found');
  });

  it('rejects creating a loan when the book already has an open loan', async () => {
    const prisma = makePrismaMock({ openLoan: { id: 'existing-loan' } });
    const service = new TimelineService(prisma);

    await expect(
      service.createLoan('user-1', { bookId: 'book-1', borrowerName: 'Alex', borrowedAt: new Date() }),
    ).rejects.toThrow('This book already has an open loan');
  });

  it('does not create a duplicate return event when a loan is already returned', async () => {
    const returnedLoan = { id: 'loan-1', userId: 'user-1', bookId: 'book-1', borrowerName: 'Alex', returnedAt: new Date('2026-01-01') };
    const prisma = makePrismaMock({ loan: returnedLoan });
    const service = new TimelineService(prisma);

    const result = await service.returnLoan('user-1', 'loan-1');

    expect(result).toBe(returnedLoan);
    expect(prisma.bookLoan.update).not.toHaveBeenCalled();
    expect(prisma.bookTimelineEvent.create).not.toHaveBeenCalled();
  });
});
