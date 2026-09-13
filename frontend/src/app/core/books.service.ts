import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RankInfo {
  categoryRank: number;
  categoryTotal: number;
  overallRank: number;
  overallTotal: number;
}

export interface BookRow {
  id: string;
  title: string;
  author: string;
  category: string | null;
  language: string | null;
  description: string | null;
  myReview: string | null;
  myNote: number | null;
  recommend: boolean | null;
  coverImagePath: string | null;
  locationId: string | null;
  purchaseDate: string | null;
  purchasePrice: string | null;
  ranking: RankInfo | null;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/books`;

  readonly books = signal<BookRow[]>([]);

  async load(): Promise<void> {
    const result = await firstValueFrom(this.http.get<BookRow[]>(this.baseUrl));
    this.books.set(result);
  }

  async create(formData: FormData): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, formData));
    await this.load();
  }
}
