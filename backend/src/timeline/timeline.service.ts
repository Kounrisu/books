import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateLoanInput,
  CreateTimelineEventInput,
  LoanRow,
  TimelineEventRow,
} from './timeline.types.js';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  findAllEvents(userId: string): Promise<TimelineEventRow[]> {
    return this.prisma.bookTimelineEvent.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async createEvent(userId: string, input: CreateTimelineEventInput): Promise<TimelineEventRow> {
    if (input.bookId) {
      const book = await this.prisma.book.findFirst({ where: { id: input.bookId, userId } });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
    }
    return this.prisma.bookTimelineEvent.create({ data: { ...input, userId } });
  }

  findAllLoans(userId: string): Promise<LoanRow[]> {
    return this.prisma.bookLoan.findMany({ where: { userId }, orderBy: { borrowedAt: 'desc' } });
  }

  async createLoan(userId: string, input: CreateLoanInput): Promise<LoanRow> {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findFirst({ where: { id: input.bookId, userId } });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      const openLoan = await tx.bookLoan.findFirst({
        where: { bookId: input.bookId, userId, returnedAt: null },
      });
      if (openLoan) {
        throw new BadRequestException('This book already has an open loan');
      }
      const loan = await tx.bookLoan.create({ data: { ...input, userId } });
      await tx.bookTimelineEvent.create({
        data: {
          userId,
          bookId: input.bookId,
          eventType: 'lent_out',
          occurredAt: input.borrowedAt,
          title: `Lent to ${input.borrowerName}`,
          notes: input.notes,
        },
      });
      await tx.book.update({ where: { id: input.bookId }, data: { physicalStatus: 'lent_out' } });
      return loan;
    });
  }

  async returnLoan(userId: string, id: string): Promise<LoanRow> {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.bookLoan.findFirst({ where: { id, userId } });
      if (!loan) {
        throw new NotFoundException('Loan not found');
      }
      // Idempotent: a loan already marked returned is handed back as-is,
      // with no duplicate event or date rewrite.
      if (loan.returnedAt) {
        return loan;
      }
      const returnedAt = new Date();
      const updated = await tx.bookLoan.update({
        where: { id },
        data: { returnedAt },
      });
      await tx.bookTimelineEvent.create({
        data: {
          userId,
          bookId: loan.bookId,
          eventType: 'returned',
          occurredAt: returnedAt,
          title: `Returned by ${loan.borrowerName}`,
        },
      });
      const book = await tx.book.findFirst({ where: { id: loan.bookId, userId } });
      if (book?.physicalStatus === 'lent_out') {
        await tx.book.update({ where: { id: loan.bookId }, data: { physicalStatus: 'in_collection' } });
      }
      return updated;
    });
  }
}
