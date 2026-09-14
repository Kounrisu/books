import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { zipUploadOptions } from '../uploads/zip-upload.config.js';
import { BackupService, RestoreSummary } from './backup.service.js';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  async export(@CurrentUser() userId: string, @Res() res: Response): Promise<void> {
    const buffer = await this.backupService.buildFullBackup(userId);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="library-full-backup.zip"');
    res.send(buffer);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('archive', zipUploadOptions))
  async import(
    @CurrentUser() userId: string,
    @UploadedFile() archive?: Express.Multer.File,
  ): Promise<RestoreSummary> {
    if (!archive) {
      throw new BadRequestException('No archive uploaded');
    }
    return this.backupService.restoreFullBackup(userId, archive.buffer);
  }
}
