import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BooksService } from '../../core/books.service';
import { TimelineEventType, TimelineService } from '../../core/timeline.service';

const EVENT_TYPE_OPTIONS: { value: TimelineEventType; label: string }[] = [
  { value: 'read_started', label: 'Started reading' },
  { value: 'read_finished', label: 'Finished reading' },
  { value: 'acquired', label: 'Acquired' },
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
  { value: 'external_borrowed', label: 'Borrowed from elsewhere' },
  { value: 'external_returned', label: 'Returned to source' },
];

const EVENT_TYPE_ICON: Record<TimelineEventType, string> = {
  read_started: '📖',
  read_finished: '✅',
  acquired: '🛒',
  lent_out: '📤',
  returned: '📥',
  lost: '❓',
  found: '🔎',
  external_borrowed: '📚',
  external_returned: '↩️',
};

@Component({
  selector: 'app-timeline-list',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './timeline-list.html',
  styleUrl: './timeline-list.scss',
})
export class TimelineListComponent implements OnInit {
  protected readonly timelineService = inject(TimelineService);
  protected readonly booksService = inject(BooksService);
  protected readonly eventTypeOptions = EVENT_TYPE_OPTIONS;

  readonly bookId = signal('');
  readonly eventType = signal<TimelineEventType>('read_started');
  readonly occurredAt = signal(new Date().toISOString().slice(0, 10));
  readonly title = signal('');
  readonly notes = signal('');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.timelineService.load();
    if (this.booksService.books().length === 0) {
      void this.booksService.load();
    }
  }

  protected iconFor(eventType: string): string {
    return EVENT_TYPE_ICON[eventType as TimelineEventType] ?? '•';
  }

  protected bookTitle(bookId: string | null): string | undefined {
    if (!bookId) {
      return undefined;
    }
    return this.booksService.findById(bookId)?.title;
  }

  async submit(): Promise<void> {
    if (!this.title().trim()) {
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.timelineService.createEvent({
        bookId: this.bookId() || undefined,
        eventType: this.eventType(),
        occurredAt: this.occurredAt(),
        title: this.title().trim(),
        notes: this.notes() || undefined,
      });
      this.title.set('');
      this.notes.set('');
    } catch {
      this.error.set('Could not add this event. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
