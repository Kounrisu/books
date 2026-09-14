import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type {
  ItemType,
  LibraryStatus,
  MetadataStatus,
  OwnershipFormat,
  PhysicalStatus,
  ReadingStatus,
} from '../books.types.js';
import {
  toOptionalBoolean,
  toOptionalDate,
  toOptionalNumber,
  toOptionalString,
  toTagList,
} from './book-transforms.js';
import {
  ITEM_TYPES,
  LIBRARY_STATUSES,
  METADATA_STATUSES,
  OWNERSHIP_FORMATS,
  PHYSICAL_STATUSES,
  READING_STATUSES,
} from './create-book.dto.js';

// A separate class (rather than PartialType(CreateBookDto)) so every field's
// optionality is explicit at a glance and update requests never accidentally
// require title/author.
export class UpdateBookDto {
  @IsOptional() @IsString() @MaxLength(500) title?: string;
  @IsOptional() @IsString() @MaxLength(300) author?: string;
  @IsOptional() @Transform(toOptionalString) @IsString() @MaxLength(120) category?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() @MaxLength(120) subcategory?: string | null;
  @IsOptional() @IsIn(ITEM_TYPES) itemType?: ItemType;
  @IsOptional() @Transform(toOptionalString) @IsString() @MaxLength(60) language?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() description?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() myReview?: string | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(1)
  @Max(10)
  myNote?: number | null;

  @IsOptional() @Transform(toOptionalBoolean) @IsBoolean() recommend?: boolean;
  @IsOptional() @Transform(toOptionalBoolean) @IsBoolean() isFavorite?: boolean;

  @IsOptional() @IsString() locationId?: string;

  @IsOptional() @Transform(toOptionalDate) purchaseDate?: Date | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  purchasePrice?: number | null;

  @IsOptional() @IsIn(OWNERSHIP_FORMATS) ownershipFormat?: OwnershipFormat;
  @IsOptional() @IsIn(PHYSICAL_STATUSES) physicalStatus?: PhysicalStatus;
  @IsOptional() @IsIn(LIBRARY_STATUSES) libraryStatus?: LibraryStatus;
  @IsOptional() @IsIn(READING_STATUSES) readingStatus?: ReadingStatus;
  @IsOptional() @Transform(toOptionalString) @IsString() @MaxLength(200) savedList?: string | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(10)
  externalRating?: number | null;

  @IsOptional() @Transform(toOptionalString) @IsString() externalRank?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() externalSource?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() personalNotes?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() spoilerNotes?: string | null;
  @IsOptional() @IsIn(METADATA_STATUSES) metadataStatus?: MetadataStatus;

  @IsOptional() @Transform(toOptionalString) @IsString() @MaxLength(20) isbn10?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() @MaxLength(20) isbn13?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() publisher?: string | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  @Max(3000)
  publicationYear?: number | null;

  @IsOptional() @Transform(toOptionalString) @IsString() edition?: string | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  pageCount?: number | null;

  @IsOptional() @Transform(toOptionalString) @IsString() seriesName?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() seriesNumber?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() translator?: string | null;

  @IsOptional() @Transform(toTagList) @IsArray() @IsString({ each: true }) tags?: string[];

  @IsOptional() @Transform(toOptionalString) @IsString() condition?: string | null;
  @IsOptional() @Transform(toOptionalString) @IsString() @MaxLength(60) format?: string | null;
}
