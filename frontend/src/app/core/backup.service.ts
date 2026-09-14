import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RestoreSummary {
  locations: number;
  books: number;
  loans: number;
  timelineEvents: number;
  collectionAreas: number;
  collectionAreaBooks: number;
  settings: boolean;
  errors: string[];
}

/**
 * A genuine full-library backup/restore — every table scoped to the user,
 * not just books+covers. Distinct from BooksService's export/import, which
 * is an enrichment round-trip that only ever updates existing books.
 */
@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/backup`;

  async exportBlob(): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.baseUrl}/export`, { responseType: 'blob' }));
  }

  async importZip(file: File): Promise<RestoreSummary> {
    const formData = new FormData();
    formData.append('archive', file);
    return firstValueFrom(this.http.post<RestoreSummary>(`${this.baseUrl}/import`, formData));
  }
}
