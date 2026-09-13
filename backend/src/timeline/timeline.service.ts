import { Injectable, NotFoundException } from '@nestjs/common';
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

  createEvent(userId: string, input: CreateTimelineEventInput): Promise<TimelineEventRow> {
    return this.prisma.bookTimelineEvent.create({ data: { ...input, userId } });
  }

  findAllLoans(userId: string): Promise<LoanRow[]> {
    return this.prisma.bookLoan.findMany({ where: { userId }, orderBy: { borrowedAt: 'desc' } });
  }

  async createLoan(userId: string, input: CreateLoanInput): Promise<LoanRow> {
    const book = await this.prisma.book.findFirst({ where: { id: input.bookId, userId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    const loan = await this.prisma.bookLoan.create({ data: { ...input, userId } });
    await this.prisma.bookTimelineEvent.create({
      data: {
        userId,
        bookId: input.bookId,
        eventType: 'lent_out',
        occurredAt: input.borrowedAt,
        title: `Lent to ${input.borrowerName}`,
        notes: input.notes,
      },
    });
    return loan;
  }

  async returnLoan(userId: string, id: string): Promise<LoanRow> {
    const loan = await this.prisma.bookLoan.findFirst({ where: { id, userId } });
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    const returnedAt = new Date();
    const updated = await this.prisma.bookLoan.update({
      where: { id },
      data: { returnedAt },
    });
    await this.prisma.bookTimelineEvent.create({
      data: {
        userId,
        bookId: loan.bookId,
        eventType: 'returned',
        occurredAt: returnedAt,
        title: `Returned by ${loan.borrowerName}`,
      },
    });
    return updated;
  }
}
