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
  LibraryStatus,
  MetadataStatus,
  OwnershipFormat,
  PhysicalStatus,
  ReadingStatus,
} from '../books.types.js';
import { toOptionalBoolean, toOptionalDate, toOptionalNumber, toTagList } from './book-transforms.js';
import {
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
  @IsOptional() @IsString() @MaxLength(120) category?: string;
  @IsOptional() @IsString() @MaxLength(120) subcategory?: string;
  @IsOptional() @IsString() @MaxLength(60) language?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() myReview?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(1)
  @Max(10)
  myNote?: number;

  @IsOptional() @Transform(toOptionalBoolean) @IsBoolean() recommend?: boolean;
  @IsOptional() @Transform(toOptionalBoolean) @IsBoolean() isFavorite?: boolean;

  @IsOptional() @IsString() locationId?: string;

  @IsOptional() @Transform(toOptionalDate) purchaseDate?: Date;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @IsOptional() @IsIn(OWNERSHIP_FORMATS) ownershipFormat?: OwnershipFormat;
  @IsOptional() @IsIn(PHYSICAL_STATUSES) physicalStatus?: PhysicalStatus;
  @IsOptional() @IsIn(LIBRARY_STATUSES) libraryStatus?: LibraryStatus;
  @IsOptional() @IsIn(READING_STATUSES) readingStatus?: ReadingStatus;
  @IsOptional() @IsString() @MaxLength(200) savedList?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(10)
  externalRating?: number;

  @IsOptional() @IsString() externalRank?: string;
  @IsOptional() @IsString() externalSource?: string;
  @IsOptional() @IsString() personalNotes?: string;
  @IsOptional() @IsString() spoilerNotes?: string;
  @IsOptional() @IsIn(METADATA_STATUSES) metadataStatus?: MetadataStatus;

  @IsOptional() @IsString() @MaxLength(20) isbn10?: string;
  @IsOptional() @IsString() @MaxLength(20) isbn13?: string;
  @IsOptional() @IsString() publisher?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  @Max(3000)
  publicationYear?: number;

  @IsOptional() @IsString() edition?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  pageCount?: number;

  @IsOptional() @IsString() seriesName?: string;
  @IsOptional() @IsString() seriesNumber?: string;
  @IsOptional() @IsString() translator?: string;

  @IsOptional() @Transform(toTagList) @IsArray() @IsString({ each: true }) tags?: string[];

  @IsOptional() @IsString() condition?: string;
  @IsOptional() @IsString() @MaxLength(60) format?: string;
}
