import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { imageUploadOptions } from '../uploads/multer.config.js';
import { zipUploadOptions } from '../uploads/zip-upload.config.js';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
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

interface BulkImportBody {
  ownershipFormat?: string;
  locationId?: string;
  category?: string;
  language?: string;
}

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  create(
    @CurrentUser() userId: string,
    @Body() body: CreateBookDto,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<BookRow> {
    const input: CreateBookInput = { ...body };
    return this.booksService.create(userId, input, photo?.buffer);
  }

  @Get()
  findAll(@CurrentUser() userId: string): Promise<BookWithRanking[]> {
    return this.booksService.findAllForUser(userId);
  }

  @Get('categories')
  categories(@CurrentUser() userId: string): Promise<string[]> {
    return this.booksService.distinctCategoryValues(userId, 'category');
  }

  @Get('subcategories')
  subcategories(@CurrentUser() userId: string): Promise<string[]> {
    return this.booksService.distinctCategoryValues(userId, 'subcategory');
  }

  @Get('export')
  async export(
    @CurrentUser() userId: string,
    @Query('format') format: string | undefined,
    @Query('all') all: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const onlyIncomplete = all !== 'true';
    if (format === 'zip') {
      const buffer = await this.booksService.buildZipExport(userId, onlyIncomplete);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="books-export.zip"');
      res.send(buffer);
      return;
    }
    const books = await this.booksService.findForExport(userId, onlyIncomplete);
    if (format === 'csv') {
      const csv = this.booksService.toCsv(books);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="books-export.csv"');
      res.send(csv);
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="books-export.json"');
    res.send(JSON.stringify(books, null, 2));
  }

  @Post('bulk-import')
  @UseInterceptors(FilesInterceptor('photos', 50, imageUploadOptions))
  bulkImport(
    @CurrentUser() userId: string,
    @Body() body: BulkImportBody,
    @UploadedFiles() photos: Express.Multer.File[],
  ): Promise<BulkImportResult> {
    return this.booksService.bulkImportFromPhotos(userId, photos ?? [], {
      ownershipFormat: body.ownershipFormat as OwnershipFormat | undefined,
      locationId: body.locationId,
      category: body.category,
      language: body.language,
    });
  }

  @Post('import')
  importRows(
    @CurrentUser() userId: string,
    @Body() body: { rows: ImportRow[] },
  ): Promise<ImportResult> {
    return this.booksService.importRows(userId, body.rows ?? []);
  }

  @Post('import-zip')
  @UseInterceptors(FileInterceptor('archive', zipUploadOptions))
  importZip(
    @CurrentUser() userId: string,
    @UploadedFile() archive?: Express.Multer.File,
  ): Promise<ImportResult> {
    if (!archive) {
      throw new BadRequestException('No archive uploaded');
    }
    return this.booksService.importZip(userId, archive.buffer);
  }

  @Get(':id')
  findOne(@CurrentUser() userId: string, @Param('id') id: string): Promise<BookRow> {
    return this.booksService.findOne(userId, id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateBookDto,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<BookRow> {
    const input: UpdateBookInput = { ...body };
    return this.booksService.update(userId, id, input, photo?.buffer);
  }

  @Delete(':id')
  delete(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.booksService.delete(userId, id);
  }
}
