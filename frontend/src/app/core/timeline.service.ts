import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type TimelineEventType =
  | 'read_started'
  | 'read_finished'
  | 'acquired'
  | 'lent_out'
  | 'returned'
  | 'lost'
  | 'found'
  | 'external_borrowed'
  | 'external_returned';

export interface TimelineEventRow {
  id: string;
  bookId: string | null;
  eventType: TimelineEventType;
  occurredAt: string;
  title: string;
  notes: string | null;
  createdAt: string;
}

export interface LoanRow {
  id: string;
  bookId: string;
  borrowerName: string;
  borrowedAt: string;
  returnedAt: string | null;
  notes: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  readonly events = signal<TimelineEventRow[]>([]);
  readonly loans = signal<LoanRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [events, loans] = await Promise.all([
        firstValueFrom(this.http.get<TimelineEventRow[]>(`${this.baseUrl}/timeline`)),
        firstValueFrom(this.http.get<LoanRow[]>(`${this.baseUrl}/loans`)),
      ]);
      this.events.set(events);
      this.loans.set(loans);
    } catch {
      this.error.set('Could not load the timeline. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async createEvent(input: {
    bookId?: string;
    eventType: TimelineEventType;
    occurredAt: string;
    title: string;
    notes?: string;
  }): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/timeline`, input));
    await this.load();
  }

  async createLoan(input: {
    bookId: string;
    borrowerName: string;
    borrowedAt: string;
    notes?: string;
  }): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/loans`, input));
    await this.load();
  }

  async returnLoan(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.baseUrl}/loans/${id}/return`, {}));
    await this.load();
  }

  activeLoanForBook(bookId: string): LoanRow | undefined {
    return this.loans().find((loan) => loan.bookId === bookId && !loan.returnedAt);
  }
}
