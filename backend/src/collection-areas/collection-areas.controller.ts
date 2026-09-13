import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CollectionAreasService } from './collection-areas.service.js';
import type {
  AddBookToAreaInput,
  CollectionAreaBookRow,
  CollectionAreaRow,
  CreateCollectionAreaInput,
  UpdateCollectionAreaInput,
} from './collection-areas.types.js';

@Controller('areas')
@UseGuards(JwtAuthGuard)
export class CollectionAreasController {
  constructor(private readonly areasService: CollectionAreasService) {}

  @Get()
  findAll(@CurrentUser() userId: string): Promise<CollectionAreaRow[]> {
    return this.areasService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@CurrentUser() userId: string, @Param('id') id: string): Promise<CollectionAreaRow> {
    return this.areasService.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body() body: CreateCollectionAreaInput,
  ): Promise<CollectionAreaRow> {
    return this.areasService.create(userId, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateCollectionAreaInput,
  ): Promise<CollectionAreaRow> {
    return this.areasService.update(userId, id, body);
  }

  @Delete(':id')
  delete(@CurrentUser() userId: string, @Param('id') id: string): Promise<void> {
    return this.areasService.delete(userId, id);
  }

  @Get(':id/books')
  listBooks(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<CollectionAreaBookRow[]> {
    return this.areasService.listBooks(userId, id);
  }

  @Post(':id/books')
  addBook(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: AddBookToAreaInput,
  ): Promise<CollectionAreaBookRow> {
    return this.areasService.addBook(userId, id, body);
  }

  @Delete(':id/books/:bookId')
  removeBook(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Param('bookId') bookId: string,
  ): Promise<void> {
    return this.areasService.removeBook(userId, id, bookId);
  }
}
