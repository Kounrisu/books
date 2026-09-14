import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AdminUserRow } from './admin.types.js';

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers(): Promise<AdminUserRow[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'asc' }, select: SAFE_USER_SELECT });
  }

  private async activeAdminCount(
    tx: Pick<PrismaService, 'user'>,
    excludingUserId?: string,
  ): Promise<number> {
    return tx.user.count({
      where: {
        role: 'admin',
        isActive: true,
        ...(excludingUserId ? { id: { not: excludingUserId } } : {}),
      },
    });
  }

  async setRole(actingUserId: string, targetUserId: string, role: string): Promise<AdminUserRow> {
    if (role !== 'admin' && role !== 'user') {
      throw new BadRequestException('Role must be "admin" or "user"');
    }
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!target) {
        throw new NotFoundException('User not found');
      }
      if (target.role === 'admin' && role === 'user') {
        const remaining = await this.activeAdminCount(tx, targetUserId);
        if (remaining === 0) {
          throw new BadRequestException('Cannot demote the last active admin');
        }
      }
      return tx.user.update({ where: { id: targetUserId }, data: { role }, select: SAFE_USER_SELECT });
    });
  }

  async setActive(actingUserId: string, targetUserId: string, isActive: boolean): Promise<AdminUserRow> {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!target) {
        throw new NotFoundException('User not found');
      }
      if (target.role === 'admin' && !isActive) {
        const remaining = await this.activeAdminCount(tx, targetUserId);
        if (remaining === 0) {
          throw new BadRequestException('Cannot disable the last active admin');
        }
      }
      return tx.user.update({ where: { id: targetUserId }, data: { isActive }, select: SAFE_USER_SELECT });
    });
  }

  async deleteUser(actingUserId: string, targetUserId: string): Promise<void> {
    if (actingUserId === targetUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    await this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!target) {
        throw new NotFoundException('User not found');
      }
      if (target.role === 'admin' && target.isActive) {
        const remaining = await this.activeAdminCount(tx, targetUserId);
        if (remaining === 0) {
          throw new BadRequestException('Cannot delete the last active admin');
        }
      }
      // All of the user's books/locations/loans/timeline events/collection
      // areas cascade-delete at the database level (see schema.prisma
      // onDelete: Cascade), so a single delete here is enough.
      await tx.user.delete({ where: { id: targetUserId } });
    });
  }
}
