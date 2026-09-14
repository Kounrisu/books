import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { BackupController } from './backup.controller.js';
import { BackupService } from './backup.service.js';

@Module({
  imports: [AuthModule, UploadsModule],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
