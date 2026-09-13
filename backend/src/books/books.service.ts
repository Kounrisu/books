import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { computeRankings } from './ranking.js';
import type {
  BookRow,
  BookWithRanking,
  CreateBookInput,
  UpdateBookInput,
} from './books.types.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, input: CreateBookInput): Promise<BookRow> {
    return this.prisma.book.create({ data: { userId, ...input } });
  }

  async findAllForUser(userId: string): Promise<BookWithRanking[]> {
    const books = await this.prisma.book.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const rankings = computeRankings(books);
    return books.map((book) => ({
      ...book,
      ranking: rankings.get(book.id) ?? null,
    }));
  }

  async update(
    userId: string,
    id: string,
    input: UpdateBookInput,
  ): Promise<BookRow> {
    const result = await this.prisma.book.updateMany({
      where: { id, userId },
      data: input,
    });
    if (result.count === 0) {
      throw new NotFoundException('Book not found');
    }
    return this.prisma.book.findFirstOrThrow({ where: { id, userId } });
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.book.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new NotFoundException('Book not found');
    }
  }
}
