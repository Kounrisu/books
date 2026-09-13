import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CollectionAreaRow {
  id: string;
  title: string;
  kind: string;
  description: string | null;
  objectives: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedBookSummary {
  id: string;
  title: string;
  author: string;
  category: string | null;
  subcategory: string | null;
  coverImagePath: string | null;
  libraryStatus: string;
  readingStatus: string;
  isFavorite: boolean;
  format: string | null;
  createdAt: string;
}

export interface CollectionAreaBookRow {
  id: string;
  areaId: string;
  bookId: string;
  areaLevel: string | null;
  priority: string | null;
  relationStatus: string | null;
  notes: string | null;
  createdAt: string;
  book: LinkedBookSummary;
}

@Injectable({ providedIn: 'root' })
export class AreasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/areas`;

  readonly areas = signal<CollectionAreaRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.http.get<CollectionAreaRow[]>(this.baseUrl));
      this.areas.set(result);
    } catch {
      this.error.set('Could not load collection areas. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  findById(id: string): CollectionAreaRow | undefined {
    return this.areas().find((area) => area.id === id);
  }

  async create(input: {
    title: string;
    kind: string;
    description?: string;
    objectives?: string;
    notes?: string;
    status?: string;
  }): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, input));
    await this.load();
  }

  async update(
    id: string,
    input: Partial<{
      title: string;
      kind: string;
      description: string;
      objectives: string;
      notes: string;
      status: string;
    }>,
  ): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.baseUrl}/${id}`, input));
    await this.load();
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    await this.load();
  }

  listBooks(areaId: string): Promise<CollectionAreaBookRow[]> {
    return firstValueFrom(
      this.http.get<CollectionAreaBookRow[]>(`${this.baseUrl}/${areaId}/books`),
    );
  }

  async addBook(
    areaId: string,
    input: { bookId: string; areaLevel?: string; priority?: string; notes?: string },
  ): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/${areaId}/books`, input));
  }

  async removeBook(areaId: string, bookId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${areaId}/books/${bookId}`));
  }
}
