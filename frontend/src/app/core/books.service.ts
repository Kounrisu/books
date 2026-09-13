import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type OwnershipFormat = 'physical' | 'ebook' | 'both' | 'none';
export type PhysicalStatus = 'in_collection' | 'unknown_location' | 'lost' | 'lent_out';
export type LibraryStatus = 'owned' | 'wishlist' | 'want_to_read' | 'want_to_buy' | 'borrowed';
export type ReadingStatus = 'unread' | 'reading' | 'read' | 'abandoned' | 'reference_only';
export type MetadataStatus = 'complete' | 'needs_metadata' | 'needs_review';

export interface BookRow {
  id: string;
  title: string;
  author: string;
  category: string | null;
  subcategory: string | null;
  language: string | null;
  description: string | null;
  myReview: string | null;
  myNote: number | null;
  recommend: boolean | null;
  isFavorite: boolean;
  coverImagePath: string | null;
  locationId: string | null;
  purchaseDate: string | null;
  purchasePrice: string | null;
  ownershipFormat: OwnershipFormat;
  physicalStatus: PhysicalStatus;
  libraryStatus: LibraryStatus;
  readingStatus: ReadingStatus;
  savedList: string | null;
  // Present in the model/API for a future external-ratings feature (e.g. an
  // Amazon rating alongside your own), intentionally not shown in the UI yet.
  externalRating: string | null;
  externalRank: string | null;
  externalSource: string | null;
  personalNotes: string | null;
  spoilerNotes: string | null;
  metadataStatus: MetadataStatus;
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
  createdAt: string;
}

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

export interface ImportResult {
  updated: BookRow[];
  errors: ImportRowError[];
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/books`;

  readonly books = signal<BookRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.http.get<BookRow[]>(this.baseUrl));
      this.books.set(result);
    } catch {
      this.error.set('Could not load your books. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(formData: FormData): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, formData));
    await this.load();
  }

  async update(id: string, formData: FormData): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.baseUrl}/${id}`, formData));
    await this.load();
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    await this.load();
  }

  /** Lightweight partial update (e.g. inline table edits) that patches the
   * signal from the response instead of reloading the whole list. */
  async patchFields(id: string, fields: Record<string, string>): Promise<BookRow> {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
    const updated = await firstValueFrom(this.http.patch<BookRow>(`${this.baseUrl}/${id}`, formData));
    this.books.update((list) => list.map((book) => (book.id === id ? updated : book)));
    return updated;
  }

  findById(id: string): BookRow | undefined {
    return this.books().find((book) => book.id === id);
  }

  async bulkImportPhotos(formData: FormData): Promise<BulkImportResult> {
    const result = await firstValueFrom(
      this.http.post<BulkImportResult>(`${this.baseUrl}/bulk-import`, formData),
    );
    await this.load();
    return result;
  }

  async importRows(rows: unknown[]): Promise<ImportResult> {
    const result = await firstValueFrom(
      this.http.post<ImportResult>(`${this.baseUrl}/import`, { rows }),
    );
    await this.load();
    return result;
  }

  async exportBlob(format: 'json' | 'csv' | 'zip', onlyIncomplete: boolean): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/export`, {
        params: { format, all: String(!onlyIncomplete) },
        responseType: 'blob',
      }),
    );
  }

  async importZip(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('archive', file);
    const result = await firstValueFrom(
      this.http.post<ImportResult>(`${this.baseUrl}/import-zip`, formData),
    );
    await this.load();
    return result;
  }

  categorySuggestions(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${this.baseUrl}/categories`));
  }

  subcategorySuggestions(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${this.baseUrl}/subcategories`));
  }
}
