import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { BookRow, BooksService, ItemType, LibraryStatus, ReadingStatus } from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';
import {
  ITEM_TYPE_OPTIONS,
  LIBRARY_STATUS_OPTIONS,
  READING_STATUS_OPTIONS,
  bookFormatLabel,
  itemTypeLabel,
  libraryStatusLabel,
  readingStatusLabel,
} from '../../core/book-labels';
import { ALWAYS_VISIBLE_COLUMNS, BOOK_COLUMN_ORDER } from '../../core/book-list-settings';
import { SettingsService } from '../../core/settings.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { environment } from '../../../environments/environment';

export type SortField =
  | 'title'
  | 'author'
  | 'itemType'
  | 'category'
  | 'subcategory'
  | 'seriesName'
  | 'seriesNumber'
  | 'format'
  | 'location'
  | 'favorite'
  | 'libraryStatus'
  | 'readingStatus'
  | 'createdAt';
type SortDirection = 'asc' | 'desc';

export interface SortCriterion {
  field: SortField;
  direction: SortDirection;
}

const DEFAULT_SORT: SortCriterion[] = [{ field: 'createdAt', direction: 'desc' }];
// 'cover' has no meaningful order (it's an image), so it's intentionally
// left out of this list rather than omitted by oversight.
const SORTABLE_FIELDS: SortField[] = [
  'title',
  'author',
  'itemType',
  'category',
  'subcategory',
  'seriesName',
  'seriesNumber',
  'format',
  'location',
  'favorite',
  'libraryStatus',
  'readingStatus',
  'createdAt',
];

@Component({
  selector: 'app-book-list',
  imports: [
    DatePipe,
    RouterLink,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookListComponent implements OnInit {
  protected readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  protected readonly settingsService = inject(SettingsService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;
  protected readonly displayedColumns = computed(() => {
    const visible = new Set([
      ...ALWAYS_VISIBLE_COLUMNS,
      ...BOOK_COLUMN_ORDER.filter((key) => this.settingsService.isColumnVisible(key)),
    ]);
    return BOOK_COLUMN_ORDER.filter((key) => visible.has(key));
  });
  protected readonly bookFormatLabel = bookFormatLabel;
  protected readonly itemTypeLabel = itemTypeLabel;
  protected readonly sortableFields = SORTABLE_FIELDS;
  protected readonly itemTypeOptions = ITEM_TYPE_OPTIONS;
  protected readonly libraryStatusOptions = LIBRARY_STATUS_OPTIONS;
  protected readonly readingStatusOptions = READING_STATUS_OPTIONS;
  protected readonly libraryStatusLabel = libraryStatusLabel;
  protected readonly readingStatusLabel = readingStatusLabel;
  readonly deletingId = signal<string | null>(null);
  readonly editingCategoryId = signal<string | null>(null);
  readonly categoryEditValue = signal('');
  readonly editingSubcategoryId = signal<string | null>(null);
  readonly subcategoryEditValue = signal('');

  readonly search = signal('');
  readonly itemTypeFilter = signal('');
  readonly categoryFilter = signal('');
  readonly subcategoryFilter = signal('');
  readonly locationFilter = signal('');
  // Multi-select ("checked dropdown") filters: an empty array means "no
  // filter applied" (show every status), matching how the shelf/status
  // filters work in apps like Goodreads and StoryGraph.
  readonly libraryStatusFilter = signal<LibraryStatus[]>([]);
  readonly readingStatusFilter = signal<ReadingStatus[]>([]);
  readonly sortCriteria = signal<SortCriterion[]>(DEFAULT_SORT);

  protected readonly categories = computed(() => {
    const values = this.booksService
      .books()
      .map((book) => book.category)
      .filter((category): category is string => !!category);
    return [...new Set(values)].sort();
  });

  protected readonly subcategories = computed(() => {
    const values = this.booksService
      .books()
      .map((book) => book.subcategory)
      .filter((subcategory): subcategory is string => !!subcategory);
    return [...new Set(values)].sort();
  });

  protected readonly filteredBooks = computed(() => {
    const query = this.search().trim().toLowerCase();
    const itemType = this.itemTypeFilter();
    const category = this.categoryFilter();
    const subcategory = this.subcategoryFilter();
    const locationId = this.locationFilter();
    const libraryStatuses = this.libraryStatusFilter();
    const readingStatuses = this.readingStatusFilter();

    const filtered = this.booksService.books().filter((book) => {
      if (itemType && book.itemType !== itemType) {
        return false;
      }
      if (category && book.category !== category) {
        return false;
      }
      if (subcategory && book.subcategory !== subcategory) {
        return false;
      }
      if (locationId && book.locationId !== locationId) {
        return false;
      }
      if (libraryStatuses.length > 0 && !libraryStatuses.includes(book.libraryStatus)) {
        return false;
      }
      if (readingStatuses.length > 0 && !readingStatuses.includes(book.readingStatus)) {
        return false;
      }
      if (query) {
        const haystack = [book.title, book.author, book.seriesName, book.seriesNumber, book.description, book.myReview]
          .filter((value): value is string => !!value)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });

    return this.sortBooks(filtered);
  });

  ngOnInit(): void {
    void this.booksService.load();
    void this.locationsService.load();
    void this.settingsService.load();
  }

  protected hasActiveFilters(): boolean {
    return !!(
      this.search() ||
      this.itemTypeFilter() ||
      this.categoryFilter() ||
      this.subcategoryFilter() ||
      this.locationFilter() ||
      this.libraryStatusFilter().length > 0 ||
      this.readingStatusFilter().length > 0
    );
  }

  protected clearFilters(): void {
    this.search.set('');
    this.itemTypeFilter.set('');
    this.categoryFilter.set('');
    this.subcategoryFilter.set('');
    this.locationFilter.set('');
    this.libraryStatusFilter.set([]);
    this.readingStatusFilter.set([]);
  }

  /**
   * Click sorts by only this column (toggling asc/desc if it's already the
   * sole criterion). Shift-click adds/toggles it as an additional criterion
   * on top of whatever is already active, for multi-column sort.
   */
  protected toggleSort(field: SortField, event: MouseEvent): void {
    const current = this.sortCriteria();
    const existingIndex = current.findIndex((c) => c.field === field);

    if (!event.shiftKey) {
      if (current.length === 1 && existingIndex === 0) {
        this.sortCriteria.set([{ field, direction: current[0].direction === 'asc' ? 'desc' : 'asc' }]);
      } else {
        this.sortCriteria.set([{ field, direction: 'asc' }]);
      }
      return;
    }

    if (existingIndex === -1) {
      this.sortCriteria.set([...current, { field, direction: 'asc' }]);
      return;
    }

    const existing = current[existingIndex];
    if (existing.direction === 'asc') {
      const next = [...current];
      next[existingIndex] = { field, direction: 'desc' };
      this.sortCriteria.set(next);
    } else {
      const next = current.filter((c) => c.field !== field);
      this.sortCriteria.set(next.length > 0 ? next : DEFAULT_SORT);
    }
  }

  protected sortState(field: SortField): { active: boolean; direction: SortDirection | null; priority: number | null } {
    const current = this.sortCriteria();
    const index = current.findIndex((c) => c.field === field);
    if (index === -1) {
      return { active: false, direction: null, priority: null };
    }
    return {
      active: true,
      direction: current[index].direction,
      priority: current.length > 1 ? index + 1 : null,
    };
  }

  async deleteBook(book: BookRow): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete book',
      message: `Delete "${book.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.deletingId.set(book.id);
    try {
      await this.booksService.delete(book.id);
    } finally {
      this.deletingId.set(null);
    }
  }

  async toggleFavorite(book: BookRow): Promise<void> {
    const previous = book.isFavorite;
    this.booksService.books.update((list) =>
      list.map((b) => (b.id === book.id ? { ...b, isFavorite: !previous } : b)),
    );
    try {
      await this.booksService.patchFields(book.id, { isFavorite: String(!previous) });
    } catch {
      this.booksService.books.update((list) =>
        list.map((b) => (b.id === book.id ? { ...b, isFavorite: previous } : b)),
      );
    }
  }

  protected startEditingCategory(book: BookRow): void {
    this.editingCategoryId.set(book.id);
    this.categoryEditValue.set(book.category ?? '');
  }

  async commitCategoryEdit(book: BookRow): Promise<void> {
    const value = this.categoryEditValue().trim();
    this.editingCategoryId.set(null);
    if (value === (book.category ?? '')) {
      return;
    }
    const previous = book.category;
    this.booksService.books.update((list) =>
      list.map((b) => (b.id === book.id ? { ...b, category: value || null } : b)),
    );
    try {
      await this.booksService.patchFields(book.id, { category: value });
    } catch {
      this.booksService.books.update((list) =>
        list.map((b) => (b.id === book.id ? { ...b, category: previous } : b)),
      );
    }
  }

  protected startEditingSubcategory(book: BookRow): void {
    this.editingSubcategoryId.set(book.id);
    this.subcategoryEditValue.set(book.subcategory ?? '');
  }

  async commitSubcategoryEdit(book: BookRow): Promise<void> {
    const value = this.subcategoryEditValue().trim();
    this.editingSubcategoryId.set(null);
    if (value === (book.subcategory ?? '')) {
      return;
    }
    const previous = book.subcategory;
    this.booksService.books.update((list) =>
      list.map((b) => (b.id === book.id ? { ...b, subcategory: value || null } : b)),
    );
    try {
      await this.booksService.patchFields(book.id, { subcategory: value });
    } catch {
      this.booksService.books.update((list) =>
        list.map((b) => (b.id === book.id ? { ...b, subcategory: previous } : b)),
      );
    }
  }

  async updateItemType(book: BookRow, value: ItemType): Promise<void> {
    if (value === book.itemType) {
      return;
    }
    const previous = book.itemType;
    this.booksService.books.update((list) =>
      list.map((b) => (b.id === book.id ? { ...b, itemType: value } : b)),
    );
    try {
      await this.booksService.patchFields(book.id, { itemType: value });
    } catch {
      this.booksService.books.update((list) =>
        list.map((b) => (b.id === book.id ? { ...b, itemType: previous } : b)),
      );
    }
  }

  async updateLibraryStatus(book: BookRow, value: LibraryStatus): Promise<void> {
    if (value === book.libraryStatus) {
      return;
    }
    const previous = book.libraryStatus;
    this.booksService.books.update((list) =>
      list.map((b) => (b.id === book.id ? { ...b, libraryStatus: value } : b)),
    );
    try {
      await this.booksService.patchFields(book.id, { libraryStatus: value });
    } catch {
      this.booksService.books.update((list) =>
        list.map((b) => (b.id === book.id ? { ...b, libraryStatus: previous } : b)),
      );
    }
  }

  async updateReadingStatus(book: BookRow, value: ReadingStatus): Promise<void> {
    if (value === book.readingStatus) {
      return;
    }
    const previous = book.readingStatus;
    this.booksService.books.update((list) =>
      list.map((b) => (b.id === book.id ? { ...b, readingStatus: value } : b)),
    );
    try {
      await this.booksService.patchFields(book.id, { readingStatus: value });
    } catch {
      this.booksService.books.update((list) =>
        list.map((b) => (b.id === book.id ? { ...b, readingStatus: previous } : b)),
      );
    }
  }

  private sortBooks(books: BookRow[]): BookRow[] {
    const criteria = this.sortCriteria();

    return [...books].sort((a, b) => {
      for (const { field, direction } of criteria) {
        const left = this.sortValue(a, field);
        const right = this.sortValue(b, field);
        if (left === right) {
          continue;
        }
        if (left === null) {
          return 1;
        }
        if (right === null) {
          return -1;
        }
        const factor = direction === 'asc' ? 1 : -1;
        return left < right ? -1 * factor : 1 * factor;
      }
      return 0;
    });
  }

  private sortValue(book: BookRow, field: SortField): string | number | null {
    switch (field) {
      case 'title':
        return book.title?.toLowerCase() ?? null;
      case 'author':
        return book.author?.toLowerCase() ?? null;
      case 'itemType':
        return itemTypeLabel(book.itemType)?.toLowerCase() ?? null;
      case 'category':
        return book.category?.toLowerCase() ?? null;
      case 'subcategory':
        return book.subcategory?.toLowerCase() ?? null;
      case 'seriesName':
        return book.seriesName?.toLowerCase() ?? null;
      case 'seriesNumber':
        return book.seriesNumber?.toLowerCase() ?? null;
      case 'format':
        return bookFormatLabel(book.format)?.toLowerCase() || null;
      case 'location':
        return (book.locationId ? this.locationsService.findById(book.locationId)?.name : null)?.toLowerCase() ?? null;
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
}
