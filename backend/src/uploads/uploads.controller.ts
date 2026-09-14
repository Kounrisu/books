import { Controller, Get, NotFoundException, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'node:path';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UPLOADS_DIR } from './multer.config.js';

/**
 * Media is private per-user. A filename only resolves if it's currently
 * referenced by one of the caller's own books or locations — an attacker
 * who knows or guesses a filename still can't fetch it, and there's no
 * directory traversal risk because a crafted filename simply won't match
 * any row and gets a 404 before any filesystem access happens.
 */
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':filename')
  async serve(
    @CurrentUser() userId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const [book, location] = await Promise.all([
      this.prisma.book.findFirst({ where: { userId, coverImagePath: filename }, select: { id: true } }),
      this.prisma.location.findFirst({ where: { userId, photoPath: filename }, select: { id: true } }),
    ]);
    if (!book && !location) {
      throw new NotFoundException('File not found');
    }
    res.sendFile(join(UPLOADS_DIR, filename));
  }
}
