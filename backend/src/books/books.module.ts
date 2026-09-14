import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';

@Module({
  imports: [AuthModule, UploadsModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
