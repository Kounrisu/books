import type { RankInfo } from './ranking.js';

export type OwnershipFormat = 'physical' | 'ebook' | 'both' | 'none';
export type PhysicalStatus = 'in_collection' | 'unknown_location' | 'lost' | 'lent_out';
export type LibraryStatus =
  | 'owned'
  | 'wishlist'
  | 'want_to_read'
  | 'want_to_buy'
  | 'borrowed';
export type ReadingStatus = 'unread' | 'reading' | 'read' | 'abandoned' | 'reference_only';
export type MetadataStatus = 'complete' | 'needs_metadata' | 'needs_review';
export type ItemType = 'book' | 'magazine' | 'manga' | 'bd' | 'manhwa';

export interface BookRow {
  id: string;
  userId: string;
  title: string;
  author: string;
  category: string | null;
  subcategory: string | null;
  itemType: string;
  language: string | null;
  description: string | null;
  myReview: string | null;
  myNote: number | null;
  recommend: boolean | null;
  isFavorite: boolean;
  coverImagePath: string | null;
  locationId: string | null;
  purchaseDate: Date | null;
  purchasePrice: unknown;
  ownershipFormat: string;
  physicalStatus: string;
  libraryStatus: string;
  readingStatus: string;
  savedList: string | null;
  externalRating: unknown;
  externalRank: string | null;
  externalSource: string | null;
  personalNotes: string | null;
  spoilerNotes: string | null;
  metadataStatus: string;
  isbn10: string | null;
  isbn13: string | null;
  publisher: string | null;
  publicationYear: number | null;
  edition: string | null;
  pageCount: number | null;
  seriesName: string | null;
  seriesNumber: string | null;
  translator: string | null;
  tags: string[];
  condition: string | null;
  format: string | null;
  source: string;
  createdAt: Date;
}

export type BookWithRanking = BookRow & { ranking: RankInfo | null };

export interface CreateBookInput {
  title: string;
  author: string;
  category?: string;
  subcategory?: string;
  itemType?: ItemType;
  language?: string;
  description?: string;
  myReview?: string;
  myNote?: number;
  recommend?: boolean;
  isFavorite?: boolean;
  coverImagePath?: string;
  locationId?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  ownershipFormat?: OwnershipFormat;
  physicalStatus?: PhysicalStatus;
  libraryStatus?: LibraryStatus;
  readingStatus?: ReadingStatus;
  savedList?: string;
  externalRating?: number;
  externalRank?: string;
  externalSource?: string;
  personalNotes?: string;
  spoilerNotes?: string;
  metadataStatus?: MetadataStatus;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  pageCount?: number;
  seriesName?: string;
  seriesNumber?: string;
  translator?: string;
  tags?: string[];
  condition?: string;
  format?: string;
}

export type UpdateBookInput = Partial<CreateBookInput>;

export interface BulkImportError {
  filename: string;
  message: string;
}

export interface BulkImportResult {
  created: BookRow[];
  errors: BulkImportError[];
}

export interface ImportRowError {
  id: string;
  message: string;
}

export interface ImportRow {
  id: string;
  title?: string;
  author?: string;
  category?: string;
  subcategory?: string;
  itemType?: ItemType;
  language?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  pageCount?: number;
  seriesName?: string;
  seriesNumber?: string;
  translator?: string;
  tags?: string[];
  condition?: string;
  format?: string;
  metadataStatus?: MetadataStatus;
}

export interface ImportResult {
  updated: BookRow[];
  errors: ImportRowError[];
}
