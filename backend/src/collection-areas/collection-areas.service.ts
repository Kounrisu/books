import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AddBookToAreaInput,
  CollectionAreaBookRow,
  CollectionAreaRow,
  CreateCollectionAreaInput,
  UpdateCollectionAreaInput,
} from './collection-areas.types.js';

const LINKED_BOOK_SELECT = {
  id: true,
  title: true,
  author: true,
  category: true,
  subcategory: true,
  coverImagePath: true,
  libraryStatus: true,
  readingStatus: true,
  isFavorite: true,
  format: true,
  createdAt: true,
} as const;

@Injectable()
export class CollectionAreasService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string): Promise<CollectionAreaRow[]> {
    return this.prisma.collectionArea.findMany({ where: { userId }, orderBy: { title: 'asc' } });
  }

  async findOne(userId: string, id: string): Promise<CollectionAreaRow> {
    const area = await this.prisma.collectionArea.findFirst({ where: { id, userId } });
    if (!area) {
      throw new NotFoundException('Collection area not found');
    }
    return area;
  }

  create(userId: string, input: CreateCollectionAreaInput): Promise<CollectionAreaRow> {
    return this.prisma.collectionArea.create({ data: { ...input, userId } });
  }

  async update(
    userId: string,
    id: string,
    input: UpdateCollectionAreaInput,
  ): Promise<CollectionAreaRow> {
    const result = await this.prisma.collectionArea.updateMany({
      where: { id, userId },
      data: input,
    });
    if (result.count === 0) {
      throw new NotFoundException('Collection area not found');
    }
    return this.prisma.collectionArea.findFirstOrThrow({ where: { id, userId } });
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.collectionArea.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new NotFoundException('Collection area not found');
    }
  }

  listBooks(userId: string, areaId: string): Promise<CollectionAreaBookRow[]> {
    return this.prisma.collectionAreaBook.findMany({
      where: { userId, areaId },
      include: { book: { select: LINKED_BOOK_SELECT } },
    });
  }

  async addBook(
    userId: string,
    areaId: string,
    input: AddBookToAreaInput,
  ): Promise<CollectionAreaBookRow> {
    const area = await this.prisma.collectionArea.findFirst({ where: { id: areaId, userId } });
    if (!area) {
      throw new NotFoundException('Collection area not found');
    }
    const book = await this.prisma.book.findFirst({ where: { id: input.bookId, userId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return this.prisma.collectionAreaBook.create({
      data: { ...input, userId, areaId },
      include: { book: { select: LINKED_BOOK_SELECT } },
    });
  }

  async removeBook(userId: string, areaId: string, bookId: string): Promise<void> {
    const result = await this.prisma.collectionAreaBook.deleteMany({
      where: { userId, areaId, bookId },
    });
    if (result.count === 0) {
      throw new NotFoundException('This book is not linked to that area');
    }
  }
}
