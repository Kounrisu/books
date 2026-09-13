import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AreasService, CollectionAreaBookRow } from '../../core/areas.service';
import { BooksService } from '../../core/books.service';
import { bookFormatLabel, libraryStatusLabel, readingStatusLabel } from '../../core/book-labels';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { environment } from '../../../environments/environment';

type SortField = 'title' | 'author' | 'category' | 'favorite' | 'libraryStatus' | 'readingStatus' | 'createdAt';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-area-detail',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './area-detail.html',
  styleUrl: './area-detail.scss',
})
export class AreaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly areasService = inject(AreasService);
  protected readonly booksService = inject(BooksService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;
  protected readonly libraryStatusLabel = libraryStatusLabel;
  protected readonly readingStatusLabel = readingStatusLabel;
  protected readonly bookFormatLabel = bookFormatLabel;

  protected readonly displayedColumns = [
    'cover',
    'title',
    'author',
    'category',
    'format',
    'status',
    'reading',
    'favorite',
    'actions',
  ];

  readonly links = signal<CollectionAreaBookRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedBookId = signal('');
  readonly sortField = signal<SortField>('createdAt');
  readonly sortDirection = signal<SortDirection>('desc');

  readonly editingNotes = signal(false);
  readonly notesDraft = signal('');
  readonly savingNotes = signal(false);

  protected readonly areaId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly area = computed(() => this.areasService.findById(this.areaId()));

  protected readonly availableBooks = computed(() => {
    const linkedIds = new Set(this.links().map((link) => link.bookId));
    return this.booksService.books().filter((book) => !linkedIds.has(book.id));
  });

  protected readonly sortedLinks = computed(() => {
    const field = this.sortField();
    const direction = this.sortDirection();
    const factor = direction === 'asc' ? 1 : -1;
    return [...this.links()].sort((a, b) => {
      const left = this.sortValue(a, field);
      const right = this.sortValue(b, field);
      if (left === right) return 0;
      if (left === null) return 1;
      if (right === null) return -1;
      return left < right ? -1 * factor : 1 * factor;
    });
  });

  async ngOnInit(): Promise<void> {
    if (this.areasService.areas().length === 0) {
      await this.areasService.load();
    }
    if (this.booksService.books().length === 0) {
      void this.booksService.load();
    }
    await this.reloadLinks();
  }

  private async reloadLinks(): Promise<void> {
    this.loading.set(true);
    try {
      this.links.set(await this.areasService.listBooks(this.areaId()));
    } catch {
      this.error.set('Could not load the books in this area.');
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  private sortValue(link: CollectionAreaBookRow, field: SortField): string | number | null {
    const book = link.book;
    switch (field) {
      case 'title':
        return book.title?.toLowerCase() ?? null;
      case 'author':
        return book.author?.toLowerCase() ?? null;
      case 'category':
        return book.category?.toLowerCase() ?? null;
      case 'favorite':
        return book.isFavorite ? 1 : 0;
      case 'libraryStatus':
        return libraryStatusLabel(book.libraryStatus)?.toLowerCase() ?? null;
      case 'readingStatus':
        return readingStatusLabel(book.readingStatus)?.toLowerCase() ?? null;
      case 'createdAt':
      default:
        return book.createdAt ? new Date(book.createdAt).getTime() : null;
    }
  }

  async addBook(): Promise<void> {
    const bookId = this.selectedBookId();
    if (!bookId) {
      return;
    }
    this.error.set(null);
    try {
      await this.areasService.addBook(this.areaId(), { bookId });
      this.selectedBookId.set('');
      await this.reloadLinks();
    } catch {
      this.error.set('Could not add this book. Please try again.');
    }
  }

  async removeBook(link: CollectionAreaBookRow): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Remove from area',
      message: `Remove "${link.book.title}" from this area? The book itself won't be deleted.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.error.set(null);
    try {
      await this.areasService.removeBook(this.areaId(), link.bookId);
      await this.reloadLinks();
    } catch {
      this.error.set('Could not remove this book. Please try again.');
    }
  }

  protected startEditingNotes(): void {
    this.notesDraft.set(this.area()?.notes ?? '');
    this.editingNotes.set(true);
  }

  protected cancelEditingNotes(): void {
    this.editingNotes.set(false);
  }

  async saveNotes(): Promise<void> {
    this.savingNotes.set(true);
    try {
      await this.areasService.update(this.areaId(), { notes: this.notesDraft() });
      this.editingNotes.set(false);
    } catch {
      this.error.set('Could not save notes. Please try again.');
    } finally {
      this.savingNotes.set(false);
    }
  }
}
