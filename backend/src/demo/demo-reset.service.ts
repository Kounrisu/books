import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { DEMO_RESET_INTERVAL_MS, DEMO_USER_EMAIL } from './demo.constants.js';
import { DEMO_BOOKS, DEMO_LOCATIONS } from './demo-seed-data.js';

/**
 * No @nestjs/schedule dependency in this project yet, so a plain
 * OnModuleInit + setInterval is enough for a single periodic job.
 */
@Injectable()
export class DemoResetService implements OnModuleInit {
  private readonly logger = new Logger(DemoResetService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    void this.resetDemoData();
    setInterval(() => void this.resetDemoData(), DEMO_RESET_INTERVAL_MS);
  }

  async getOrCreateDemoUser(): Promise<{ id: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
    if (existing) {
      return existing;
    }
    const passwordHash = await bcrypt.hash(randomUUID(), 10);
    return this.prisma.user.create({
      data: { email: DEMO_USER_EMAIL, passwordHash, isDemo: true },
    });
  }

  async resetDemoData(): Promise<void> {
    try {
      const user = await this.getOrCreateDemoUser();
      const userId = user.id;

      await this.prisma.collectionAreaBook.deleteMany({ where: { userId } });
      await this.prisma.collectionArea.deleteMany({ where: { userId } });
      await this.prisma.bookLoan.deleteMany({ where: { userId } });
      await this.prisma.bookTimelineEvent.deleteMany({ where: { userId } });
      await this.prisma.book.deleteMany({ where: { userId } });
      await this.prisma.location.deleteMany({ where: { userId } });

      const locations = await Promise.all(
        DEMO_LOCATIONS.map((location) => this.prisma.location.create({ data: { ...location, userId } })),
      );

      await this.prisma.book.createMany({
        data: DEMO_BOOKS.map((book, index) => ({
          ...book,
          userId,
          locationId: locations[index % locations.length]?.id,
        })),
      });

      this.logger.log(`Demo data reset: ${DEMO_BOOKS.length} books, ${locations.length} locations`);
    } catch (error) {
      this.logger.error('Demo data reset failed', error instanceof Error ? error.stack : error);
    }
  }
}
