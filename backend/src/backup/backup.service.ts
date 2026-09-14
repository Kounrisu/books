import { BadRequestException, Injectable } from '@nestjs/common';
import archiver = require('archiver');
import AdmZip = require('adm-zip');
import sharp = require('sharp');
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { UPLOADS_DIR } from '../uploads/multer.config.js';
import { UploadsService } from '../uploads/uploads.service.js';

const BACKUP_FORMAT_VERSION = 1;
const MAX_ZIP_ENTRIES = 20000;
const MAX_ZIP_UNCOMPRESSED_BYTES = 2 * 1024 * 1024 * 1024; // 2 GiB

export interface RestoreSummary {
  locations: number;
  books: number;
  loans: number;
  timelineEvents: number;
  collectionAreas: number;
  collectionAreaBooks: number;
  settings: boolean;
  errors: string[];
}

/**
 * A genuine full-library backup/restore, distinct from the lighter
 * "enrichment" export/import in BooksService (which only covers books +
 * covers and only ever updates existing rows). This covers every table
 * scoped to a user — locations (with hierarchy), books, loans, timeline
 * events, collection areas and their book links, and UI settings — and
 * restore *creates* missing rows (upsert by original id), so it can rebuild
 * a deleted or empty library, not just enrich an existing one.
 */
@Injectable()
export class BackupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  async buildFullBackup(userId: string): Promise<Buffer> {
    const [locations, books, loans, timelineEvents, collectionAreas, collectionAreaBooks, settings] =
      await Promise.all([
        this.prisma.location.findMany({ where: { userId } }),
        this.prisma.book.findMany({ where: { userId } }),
        this.prisma.bookLoan.findMany({ where: { userId } }),
        this.prisma.bookTimelineEvent.findMany({ where: { userId } }),
        this.prisma.collectionArea.findMany({ where: { userId } }),
        this.prisma.collectionAreaBook.findMany({ where: { userId } }),
        this.prisma.userSettings.findUnique({ where: { userId } }),
      ]);

    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    const finished = new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', (error) => reject(error));
    });

    for (const location of locations) {
      if (!location.photoPath) continue;
      try {
        const compressed = await sharp(join(UPLOADS_DIR, location.photoPath))
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        archive.append(compressed, { name: `photos/locations/${location.id}.jpg` });
      } catch {
        // Photo missing or unreadable on disk — back up the record anyway.
      }
    }
    for (const book of books) {
      if (!book.coverImagePath) continue;
      try {
        const compressed = await sharp(join(UPLOADS_DIR, book.coverImagePath))
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        archive.append(compressed, { name: `photos/books/${book.id}.jpg` });
      } catch {
        // Photo missing or unreadable on disk — back up the record anyway.
      }
    }

    archive.append(
      JSON.stringify({ version: BACKUP_FORMAT_VERSION, exportedAt: new Date().toISOString() }, null, 2),
      { name: 'manifest.json' },
    );
    archive.append(JSON.stringify(locations, null, 2), { name: 'locations.json' });
    archive.append(JSON.stringify(books, null, 2), { name: 'books.json' });
    archive.append(JSON.stringify(loans, null, 2), { name: 'loans.json' });
    archive.append(JSON.stringify(timelineEvents, null, 2), { name: 'timeline_events.json' });
    archive.append(JSON.stringify(collectionAreas, null, 2), { name: 'collection_areas.json' });
    archive.append(JSON.stringify(collectionAreaBooks, null, 2), { name: 'collection_area_books.json' });
    archive.append(JSON.stringify(settings, null, 2), { name: 'settings.json' });

    await archive.finalize();
    await finished;
    return Buffer.concat(chunks);
  }

  async restoreFullBackup(userId: string, buffer: Buffer): Promise<RestoreSummary> {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    if (entries.length > MAX_ZIP_ENTRIES) {
      throw new BadRequestException(`Archive has too many entries (max ${MAX_ZIP_ENTRIES})`);
    }
    const totalUncompressed = entries.reduce((sum, entry) => sum + entry.header.size, 0);
    if (totalUncompressed > MAX_ZIP_UNCOMPRESSED_BYTES) {
      throw new BadRequestException('Archive expands beyond the allowed size limit');
    }

    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      throw new BadRequestException('Not a full-backup archive (manifest.json is missing)');
    }

    const readJson = <T>(name: string): T[] => {
      const entry = zip.getEntry(name);
      if (!entry) return [];
      try {
        return JSON.parse(entry.getData().toString('utf-8')) as T[];
      } catch {
        throw new BadRequestException(`${name} in the archive is not valid JSON`);
      }
    };

    type AnyRow = Record<string, unknown> & { id: string };
    const locations = readJson<AnyRow>('locations.json');
    const books = readJson<AnyRow>('books.json');
    const loans = readJson<AnyRow>('loans.json');
    const timelineEvents = readJson<AnyRow>('timeline_events.json');
    const collectionAreas = readJson<AnyRow>('collection_areas.json');
    const collectionAreaBooks = readJson<AnyRow>('collection_area_books.json');
    const settingsEntry = zip.getEntry('settings.json');
    const settings = settingsEntry
      ? (JSON.parse(settingsEntry.getData().toString('utf-8')) as AnyRow | null)
      : null;

    const errors: string[] = [];

    // Every referenced id must either not exist yet, or already belong to
    // this user — never overwrite another user's row just because a backup
    // file happens to carry the same id.
    const assertOwnable = async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: { findUnique: (args: any) => Promise<{ userId?: string } | null> },
      id: string,
      label: string,
    ): Promise<boolean> => {
      const existing = await model.findUnique({ where: { id } });
      if (existing && existing.userId !== userId) {
        errors.push(`Skipped ${label} ${id}: belongs to a different account`);
        return false;
      }
      return true;
    };

    const restorePhoto = async (
      zipPath: string,
      currentPath: string | null | undefined,
    ): Promise<string | null | undefined> => {
      const entry = zip.getEntry(zipPath);
      if (!entry) return currentPath;
      try {
        return await this.uploads.saveImage(entry.getData());
      } catch {
        return currentPath;
      }
    };

    await this.prisma.$transaction(
      async (tx) => {
        // Pass 1: locations without their parent link, so self-references
        // never point at a not-yet-created row.
        for (const row of locations) {
          if (!(await assertOwnable(tx.location, row.id, 'location'))) continue;
          const photoPath = await restorePhoto(`photos/locations/${row.id}.jpg`, row.photoPath as string | null);
          await tx.location.upsert({
            where: { id: row.id },
            create: {
              id: row.id,
              userId,
              name: row.name as string,
              photoPath: photoPath ?? null,
              latitude: (row.latitude as number | null) ?? null,
              longitude: (row.longitude as number | null) ?? null,
              createdAt: new Date(row.createdAt as string),
            },
            update: {
              name: row.name as string,
              photoPath: photoPath ?? null,
              latitude: (row.latitude as number | null) ?? null,
              longitude: (row.longitude as number | null) ?? null,
            },
          });
        }
        // Pass 2: wire up parentLocationId now that every location exists.
        for (const row of locations) {
          if (!row.parentLocationId) continue;
          await tx.location.update({
            where: { id: row.id },
            data: { parentLocationId: row.parentLocationId as string },
          });
        }

        for (const row of books) {
          if (!(await assertOwnable(tx.book, row.id, 'book'))) continue;
          const coverImagePath = await restorePhoto(`photos/books/${row.id}.jpg`, row.coverImagePath as string | null);
          const { id, userId: _u, createdAt, purchaseDate, metadataReviewedAt, ...rest } = row;
          void _u;
          const dates = {
            purchaseDate: purchaseDate ? new Date(purchaseDate as string) : null,
            metadataReviewedAt: metadataReviewedAt ? new Date(metadataReviewedAt as string) : null,
          };
          await tx.book.upsert({
            where: { id },
            create: { id, userId, createdAt: new Date(createdAt as string), ...rest, ...dates, coverImagePath } as never,
            update: { ...rest, ...dates, coverImagePath } as never,
          });
        }

        for (const row of loans) {
          if (!(await assertOwnable(tx.bookLoan, row.id, 'loan'))) continue;
          const { id, userId: _u, createdAt, borrowedAt, returnedAt, ...rest } = row;
          void _u;
          const dates = {
            borrowedAt: new Date(borrowedAt as string),
            returnedAt: returnedAt ? new Date(returnedAt as string) : null,
          };
          await tx.bookLoan.upsert({
            where: { id },
            create: { id, userId, createdAt: new Date(createdAt as string), ...rest, ...dates } as never,
            update: { ...rest, ...dates } as never,
          });
        }

        for (const row of timelineEvents) {
          if (!(await assertOwnable(tx.bookTimelineEvent, row.id, 'timeline event'))) continue;
          const { id, userId: _u, createdAt, occurredAt, ...rest } = row;
          void _u;
          const dates = { occurredAt: new Date(occurredAt as string) };
          await tx.bookTimelineEvent.upsert({
            where: { id },
            create: { id, userId, createdAt: new Date(createdAt as string), ...rest, ...dates } as never,
            update: { ...rest, ...dates } as never,
          });
        }

        for (const row of collectionAreas) {
          if (!(await assertOwnable(tx.collectionArea, row.id, 'collection area'))) continue;
          const { id, userId: _u, createdAt, updatedAt, ...rest } = row;
          void _u;
          void updatedAt;
          await tx.collectionArea.upsert({
            where: { id },
            create: { id, userId, createdAt: new Date(createdAt as string), ...rest } as never,
            update: { ...rest } as never,
          });
        }

        for (const row of collectionAreaBooks) {
          if (!(await assertOwnable(tx.collectionAreaBook, row.id, 'collection area book'))) continue;
          const { id, userId: _u, createdAt, ...rest } = row;
          void _u;
          await tx.collectionAreaBook.upsert({
            where: { id },
            create: { id, userId, createdAt: new Date(createdAt as string), ...rest } as never,
            update: { ...rest } as never,
          });
        }

        if (settings) {
          const { id: _id, userId: _u, updatedAt, ...rest } = settings;
          void _id;
          void _u;
          void updatedAt;
          await tx.userSettings.upsert({
            where: { userId },
            create: { userId, ...rest } as never,
            update: { ...rest } as never,
          });
        }
      },
      { timeout: 120_000 },
    );

    return {
      locations: locations.length,
      books: books.length,
      loans: loans.length,
      timelineEvents: timelineEvents.length,
      collectionAreas: collectionAreas.length,
      collectionAreaBooks: collectionAreaBooks.length,
      settings: !!settings,
      errors,
    };
  }
}
