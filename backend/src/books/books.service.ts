import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import archiver = require('archiver');
import AdmZip = require('adm-zip');
import sharp = require('sharp');
import { PrismaService } from '../prisma/prisma.service.js';
import { UPLOADS_DIR } from '../uploads/multer.config.js';
import { computeRankings } from './ranking.js';
import type {
  BookRow,
  BookWithRanking,
  BulkImportResult,
  CreateBookInput,
  ImportResult,
  ImportRow,
  OwnershipFormat,
  UpdateBookInput,
} from './books.types.js';

type ZipImportRow = ImportRow & { coverPhotoInZip?: string };

interface BulkImportDefaults {
  ownershipFormat?: OwnershipFormat;
  locationId?: string;
  category?: string;
  language?: string;
}

const EXPORT_COLUMNS = [
  'id',
  'title',
  'author',
  'category',
  'subcategory',
  'language',
  'description',
  'isbn10',
  'isbn13',
  'publisher',
  'publicationYear',
  'edition',
  'pageCount',
  'seriesName',
  'seriesNumber',
  'translator',
  'tags',
  'condition',
  'format',
  'metadataStatus',
  'coverImagePath',
] as const;

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateBookInput): Promise<BookRow> {
    if (input.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: input.locationId, userId },
      });
      if (!location) {
        throw new NotFoundException('Location not found');
      }
    }
    return this.prisma.book.create({ data: { ...input, userId } });
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
    if (input.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: input.locationId, userId },
      });
      if (!location) {
        throw new NotFoundException('Location not found');
      }
    }
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

  async bulkImportFromPhotos(
    userId: string,
    photos: Express.Multer.File[],
    defaults: BulkImportDefaults,
  ): Promise<BulkImportResult> {
    if (defaults.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: defaults.locationId, userId },
      });
      if (!location) {
        return {
          created: [],
          errors: photos.map((photo) => ({
            filename: photo.originalname,
            message: 'Location not found',
          })),
        };
      }
    }

    const created: BookRow[] = [];
    const errors: BulkImportResult['errors'] = [];
    for (const photo of photos) {
      try {
        const placeholderTitle = photo.originalname.replace(/\.[^/.]+$/, '') || 'Untitled';
        const book = await this.prisma.book.create({
          data: {
            userId,
            title: placeholderTitle,
            author: 'Unknown',
            coverImagePath: photo.filename,
            metadataStatus: 'needs_metadata',
            ownershipFormat: defaults.ownershipFormat,
            locationId: defaults.locationId,
            category: defaults.category,
            language: defaults.language,
          },
        });
        created.push(book);
      } catch (error) {
        errors.push({
          filename: photo.originalname,
          message: error instanceof Error ? error.message : 'Could not create this book',
        });
      }
    }
    return { created, errors };
  }

  async distinctCategoryValues(
    userId: string,
    field: 'category' | 'subcategory',
  ): Promise<string[]> {
    const rows = await this.prisma.book.findMany({
      where: { userId },
      select: { category: true, subcategory: true },
    });
    const values = rows
      .map((row) => row[field])
      .filter((value): value is string => !!value && value.trim().length > 0);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }

  findForExport(userId: string, onlyIncomplete: boolean): Promise<BookRow[]> {
    return this.prisma.book.findMany({
      where: {
        userId,
        ...(onlyIncomplete ? { metadataStatus: { not: 'complete' } } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  toCsv(books: BookRow[]): string {
    const escape = (value: unknown): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const text = Array.isArray(value) ? value.join(';') : String(value);
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const header = EXPORT_COLUMNS.join(',');
    const rows = books.map((book) =>
      EXPORT_COLUMNS.map((column) => escape((book as unknown as Record<string, unknown>)[column])).join(','),
    );
    return [header, ...rows].join('\n');
  }

  async importRows(userId: string, rows: ImportRow[]): Promise<ImportResult> {
    const updated: BookRow[] = [];
    const errors: ImportResult['errors'] = [];

    for (const row of rows) {
      if (!row.id) {
        errors.push({ id: '(missing)', message: 'Row is missing an id' });
        continue;
      }
      try {
        const fields = this.pickImportableFields(row);
        const result = await this.prisma.book.updateMany({
          where: { id: row.id, userId },
          data: fields,
        });
        if (result.count === 0) {
          errors.push({ id: row.id, message: 'Book not found' });
          continue;
        }
        updated.push(
          await this.prisma.book.findFirstOrThrow({ where: { id: row.id, userId } }),
        );
      } catch (error) {
        errors.push({
          id: row.id,
          message: error instanceof Error ? error.message : 'Could not update this book',
        });
      }
    }

    return { updated, errors };
  }

  /**
   * Builds a downloadable zip containing `books.json` (the same metadata as
   * the JSON export, plus a `coverPhotoInZip` pointer per book) and a
   * `photos/` folder of compressed cover images, keyed by the book's stable
   * id rather than its on-disk upload filename — so `importZip` can match
   * photos back to books even if the upload filename scheme ever changes.
   * This whole photo-inclusive round-trip (and the local recognition step
   * that reads it) is new scope beyond the original spec, which planned
   * metadata-only export/import and cloud-based cover recognition.
   */
  async buildZipExport(userId: string, onlyIncomplete: boolean): Promise<Buffer> {
    const books = await this.findForExport(userId, onlyIncomplete);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    const finished = new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', (error) => reject(error));
    });

    const metadata: Record<string, unknown>[] = [];
    for (const book of books) {
      const entry: Record<string, unknown> = { ...book };
      delete entry.userId;
      if (book.coverImagePath) {
        try {
          const compressed = await sharp(join(UPLOADS_DIR, book.coverImagePath))
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 82 })
            .toBuffer();
          const zipPath = `photos/${book.id}.jpg`;
          archive.append(compressed, { name: zipPath });
          entry['coverPhotoInZip'] = zipPath;
        } catch {
          // Cover file missing or unreadable on disk — export the metadata anyway, just without a photo.
        }
      }
      metadata.push(entry);
    }
    archive.append(
      JSON.stringify({ exportedAt: new Date().toISOString(), books: metadata }, null, 2),
      { name: 'books.json' },
    );
    await archive.finalize();
    await finished;
    return Buffer.concat(chunks);
  }

  /**
   * The reverse of `buildZipExport`: reads `books.json` plus any `photos/`
   * entries from an uploaded zip, applies metadata the same way
   * `importRows` does, and additionally copies any matched photo into the
   * uploads volume and sets `coverImagePath` — the plain JSON import
   * intentionally never touches photos, this path does.
   */
  async importZip(userId: string, buffer: Buffer): Promise<ImportResult> {
    const zip = new AdmZip(buffer);
    const metadataEntry = zip.getEntry('books.json');
    if (!metadataEntry) {
      return { updated: [], errors: [{ id: '(missing)', message: 'books.json not found in the uploaded archive' }] };
    }

    let rows: ZipImportRow[];
    try {
      const parsed = JSON.parse(metadataEntry.getData().toString('utf-8')) as { books?: ZipImportRow[] };
      rows = parsed.books ?? [];
    } catch {
      return { updated: [], errors: [{ id: '(missing)', message: 'books.json in the archive is not valid JSON' }] };
    }

    const updated: BookRow[] = [];
    const errors: ImportResult['errors'] = [];

    for (const row of rows) {
      if (!row.id) {
        errors.push({ id: '(missing)', message: 'Row is missing an id' });
        continue;
      }
      try {
        const fields = this.pickImportableFields(row);
        if (row.coverPhotoInZip) {
          const photoEntry = zip.getEntry(row.coverPhotoInZip);
          if (photoEntry) {
            const filename = `${randomUUID()}${extname(row.coverPhotoInZip) || '.jpg'}`;
            await fs.mkdir(UPLOADS_DIR, { recursive: true });
            await fs.writeFile(join(UPLOADS_DIR, filename), photoEntry.getData());
            fields.coverImagePath = filename;
          }
        }
        const result = await this.prisma.book.updateMany({
          where: { id: row.id, userId },
          data: fields,
        });
        if (result.count === 0) {
          errors.push({ id: row.id, message: 'Book not found' });
          continue;
        }
        updated.push(
          await this.prisma.book.findFirstOrThrow({ where: { id: row.id, userId } }),
        );
      } catch (error) {
        errors.push({
          id: row.id,
          message: error instanceof Error ? error.message : 'Could not update this book',
        });
      }
    }

    return { updated, errors };
  }

  /**
   * Import rows come from a re-uploaded export, which contains the FULL book
   * record (userId, createdAt, purchaseDate as a string, etc.) so AI tools
   * have full context. Only forward the fields this app's `ImportRow` type
   * declares as editable — never trust the raw object's keys, since a plain
   * (non-DTO) request body isn't stripped by Nest's ValidationPipe the way a
   * class-validated DTO would be.
   */
  private pickImportableFields(row: ImportRow): Partial<CreateBookInput> {
    const fields: Partial<CreateBookInput> = {};
    if (row.title !== undefined) fields.title = row.title;
    if (row.author !== undefined) fields.author = row.author;
    if (row.category !== undefined) fields.category = row.category;
    if (row.subcategory !== undefined) fields.subcategory = row.subcategory;
    if (row.language !== undefined) fields.language = row.language;
    if (row.description !== undefined) fields.description = row.description;
    if (row.isbn10 !== undefined) fields.isbn10 = row.isbn10;
    if (row.isbn13 !== undefined) fields.isbn13 = row.isbn13;
    if (row.publisher !== undefined) fields.publisher = row.publisher;
    if (row.publicationYear !== undefined) fields.publicationYear = row.publicationYear;
    if (row.edition !== undefined) fields.edition = row.edition;
    if (row.pageCount !== undefined) fields.pageCount = row.pageCount;
    if (row.seriesName !== undefined) fields.seriesName = row.seriesName;
    if (row.seriesNumber !== undefined) fields.seriesNumber = row.seriesNumber;
    if (row.translator !== undefined) fields.translator = row.translator;
    if (row.tags !== undefined) fields.tags = row.tags;
    if (row.condition !== undefined) fields.condition = row.condition;
    if (row.format !== undefined) fields.format = row.format;
    if (row.metadataStatus !== undefined) fields.metadataStatus = row.metadataStatus;
    return fields;
  }
}
