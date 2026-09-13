import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { imageUploadOptions } from '../uploads/multer.config.js';
import { BooksService } from './books.service.js';
import type { BookRow, BookWithRanking } from './books.types.js';

interface BookFormBody {
  title: string;
  author: string;
  category?: string;
  language?: string;
  description?: string;
  myReview?: string;
  myNote?: string;
  recommend?: string;
  locationId?: string;
  purchaseDate?: string;
  purchasePrice?: string;
}

export function parseBookForm(body: BookFormBody, photo?: Express.Multer.File) {
  return {
    title: body.title,
    author: body.author,
    category: body.category,
    language: body.language,
    description: body.description,
    myReview: body.myReview,
    myNote: body.myNote ? Number(body.myNote) : undefined,
    recommend:
      body.recommend === undefined ? undefined : body.recommend === 'true',
    coverImagePath: photo?.filename,
    locationId: body.locationId,
    purchaseDate:
      body.purchaseDate !== undefined && body.purchaseDate !== ''
        ? new Date(body.purchaseDate)
        : undefined,
    purchasePrice:
      body.purchasePrice !== undefined && body.purchasePrice !== ''
        ? Number(body.purchasePrice)
        : undefined,
  };
}

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  create(
    @CurrentUser() userId: string,
    @Body() body: BookFormBody,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<BookRow> {
    return this.booksService.create(userId, parseBookForm(body, photo));
  }

  @Get()
  findAll(@CurrentUser() userId: string): Promise<BookWithRanking[]> {
    return this.booksService.findAllForUser(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: Partial<BookFormBody>,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<BookRow> {
    return this.booksService.update(
      userId,
      id,
      parseBookForm(body as BookFormBody, photo),
    );
  }

  @Delete(':id')
  delete(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.booksService.delete(userId, id);
  }
}
