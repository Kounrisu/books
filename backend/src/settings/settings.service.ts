import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateUserSettingsInput, UserSettingsRow } from './settings.types.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<UserSettingsRow> {
    const row = await this.prisma.userSettings.findUnique({ where: { userId } });
    // No row yet means "no customization made" — every column/filter is
    // visible by default, so the frontend doesn't need a backfill migration.
    return {
      visibleColumns: (row?.visibleColumns as string[] | null) ?? null,
      visibleFilters: (row?.visibleFilters as string[] | null) ?? null,
    };
  }

  async update(userId: string, input: UpdateUserSettingsInput): Promise<UserSettingsRow> {
    const row = await this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        visibleColumns: input.visibleColumns ?? undefined,
        visibleFilters: input.visibleFilters ?? undefined,
      },
      update: {
        ...(input.visibleColumns !== undefined ? { visibleColumns: input.visibleColumns } : {}),
        ...(input.visibleFilters !== undefined ? { visibleFilters: input.visibleFilters } : {}),
      },
    });
    return {
      visibleColumns: (row.visibleColumns as string[] | null) ?? null,
      visibleFilters: (row.visibleFilters as string[] | null) ?? null,
    };
  }
}
