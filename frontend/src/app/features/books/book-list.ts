import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookRow, BooksService, ItemType, LibraryStatus, ReadingStatus } from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';
import { SecureImageDirective } from '../../core/secure-image.directive';
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

const SORT_FIELD_LABELS: Record<SortField, string> = {
  title: 'Title',
  author: 'Author',
  itemType: 'Type',
  category: 'Category',
  subcategory: 'Subgenre',
  seriesName: 'Series',
  seriesNumber: 'Issue/volume',
  format: 'Format',
  location: 'Location',
  favorite: 'Favorite',
  libraryStatus: 'Collection status',
  readingStatus: 'Reading status',
  createdAt: 'Date added',
};

interface MobileSortOption {
  value: string;
  label: string;
}

/** Card view (mobile) only ever sorts by one column at a time — this flat
 * list of "field:direction" options replaces the table headers' click/shift-
 * click multi-sort UI, which has nothing to click below the table breakpoint. */
const MOBILE_SORT_OPTIONS: MobileSortOption[] = SORTABLE_FIELDS.flatMap((field) => [
  { value: `${field}:asc`, label: `${SORT_FIELD_LABELS[field]} (ascending)` },
  { value: `${field}:desc`, label: `${SORT_FIELD_LABELS[field]} (descending)` },
]);

@Component({
  selector: 'app-book-list',
  imports: [
    DatePipe,
    RouterLink,
    FormsModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    SecureImageDirective,
  ],
  templateUrl: './book-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  readonly deleteError = signal<string | null>(null);
  readonly editingCategoryId = signal<string | null>(null);
  readonly categoryEditValue = signal('');
  readonly editingSubcategoryId = signal<string | null>(null);
  readonly subcategoryEditValue = signal('');

  /** Row-level mutation feedback: which books have an inline edit in
   * flight, and which have one that failed (with a retry available) —
   * inline edits used to fail silently, rolling back with no visible sign
   * anything went wrong. */
  readonly mutatingIds = signal<ReadonlySet<string>>(new Set());
  readonly mutationErrors = signal<Readonly<Record<string, string>>>({});
  private readonly pendingWrites = new Map<string, Promise<unknown>>();
  private readonly lastFailedRetry = new Map<string, () => void>();

  readonly search = signal('');
  readonly favoriteOnlyFilter = signal(false);
  readonly filtersExpanded = signal(false);
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

  readonly activeAdvancedFiltersCount = computed(() => {
    let count = 0;
    if (this.itemTypeFilter()) count++;
    if (this.categoryFilter()) count++;
    if (this.subcategoryFilter()) count++;
    if (this.locationFilter()) count++;
    if (this.libraryStatusFilter().length > 0) count++;
    if (this.readingStatusFilter().length > 0) count++;
    return count;
  });

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
    const favOnly = this.favoriteOnlyFilter();
    const itemType = this.itemTypeFilter();
    const category = this.categoryFilter();
    const subcategory = this.subcategoryFilter();
    const locationId = this.locationFilter();
    const libraryStatuses = this.libraryStatusFilter();
    const readingStatuses = this.readingStatusFilter();

    const filtered = this.booksService.books().filter((book) => {
      if (favOnly && !book.isFavorite) {
        return false;
      }
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
      this.favoriteOnlyFilter() ||
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
    this.favoriteOnlyFilter.set(false);
    this.itemTypeFilter.set('');
    this.categoryFilter.set('');
    this.subcategoryFilter.set('');
    this.locationFilter.set('');
    this.libraryStatusFilter.set([]);
    this.readingStatusFilter.set([]);
  }

  protected toggleFavoriteOnly(): void {
    this.favoriteOnlyFilter.set(!this.favoriteOnlyFilter());
  }

  protected toggleFiltersExpanded(): void {
    this.filtersExpanded.set(!this.filtersExpanded());
  }

  /**
   * Click sorts by only this column (toggling asc/desc if it's already the
   * sole criterion). Shift-click adds/toggles it as an additional criterion
   * on top of whatever is already active, for multi-column sort.
   */
  protected toggleSort(field: SortField, event: Event): void {
    const current = this.sortCriteria();
    const existingIndex = current.findIndex((c) => c.field === field);
    // Accessed via a type guard rather than a MouseEvent/KeyboardEvent
    // parameter type — Angular's strict template checker can't always
    // narrow $event to those specific DOM event types on a th[mat-header-cell].
    const shiftKey = 'shiftKey' in event && (event as { shiftKey: boolean }).shiftKey;

    if (!shiftKey) {
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

  /** Space normally scrolls the page — suppress that when it's activating a
   * focused, keyboard-operable sort header instead. */
  protected onSortKeySpace(field: SortField, event: Event): void {
    event.preventDefault();
    this.toggleSort(field, event);
  }

  /** aria-sort for screen readers — only announced when this column is the
   * sole sort criterion, since aria-sort has no concept of secondary keys. */
  protected ariaSort(field: SortField): 'ascending' | 'descending' | 'none' {
    const current = this.sortCriteria();
    if (current.length !== 1 || current[0].field !== field) {
      return 'none';
    }
    return current[0].direction === 'asc' ? 'ascending' : 'descending';
  }

  protected readonly mobileSortOptions = MOBILE_SORT_OPTIONS;

  protected mobileSortValue(): string {
    const current = this.sortCriteria();
    const primary = current[0] ?? DEFAULT_SORT[0];
    return `${primary.field}:${primary.direction}`;
  }

  protected setMobileSort(value: string): void {
    const [field, direction] = value.split(':') as [SortField, SortDirection];
    this.sortCriteria.set([{ field, direction }]);
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
    this.deleteError.set(null);
    try {
      await this.booksService.delete(book.id);
    } catch {
      this.deleteError.set(`Could not delete "${book.title}". Please try again.`);
    } finally {
      this.deletingId.set(null);
    }
  }

  private markMutating(id: string, active: boolean): void {
    this.mutatingIds.update((set) => {
      const next = new Set(set);
      if (active) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  private clearMutationError(id: string): void {
    this.mutationErrors.update((errors) => {
      if (!(id in errors)) {
        return errors;
      }
      const { [id]: _removed, ...rest } = errors;
      return rest;
    });
  }

  /**
   * Applies an optimistic field edit and serializes it behind any
   * already-in-flight write for the same book, so an earlier request's
   * response can never land after (and overwrite) a later optimistic
   * value. On failure the field is rolled back and a retryable, visible
   * error is shown — inline edits used to roll back silently, with the
   * user having no idea the save failed.
   */
  private runFieldMutation(
    bookId: string,
    optimistic: (book: BookRow) => BookRow,
    rollback: (book: BookRow) => BookRow,
    fields: Record<string, string>,
  ): void {
    this.clearMutationError(bookId);
    this.booksService.books.update((list) => list.map((b) => (b.id === bookId ? optimistic(b) : b)));
    this.markMutating(bookId, true);
    this.lastFailedRetry.set(bookId, () => this.runFieldMutation(bookId, optimistic, rollback, fields));

    const prior = this.pendingWrites.get(bookId) ?? Promise.resolve();
    const task = prior
      .catch(() => undefined)
      .then(() => this.booksService.patchFields(bookId, fields))
      .then(() => {
        this.lastFailedRetry.delete(bookId);
      })
      .catch(() => {
        this.booksService.books.update((list) => list.map((b) => (b.id === bookId ? rollback(b) : b)));
        this.mutationErrors.update((errors) => ({ ...errors, [bookId]: 'Could not save this change.' }));
      })
      .finally(() => {
        this.markMutating(bookId, false);
      });
    this.pendingWrites.set(bookId, task);
  }

  protected retryMutation(bookId: string): void {
    this.lastFailedRetry.get(bookId)?.();
  }

  protected dismissMutationError(bookId: string): void {
    this.clearMutationError(bookId);
    this.lastFailedRetry.delete(bookId);
  }

  toggleFavorite(book: BookRow): void {
    const previous = book.isFavorite;
    this.runFieldMutation(
      book.id,
      (b) => ({ ...b, isFavorite: !previous }),
      (b) => ({ ...b, isFavorite: previous }),
      { isFavorite: String(!previous) },
    );
  }

  protected startEditingCategory(book: BookRow): void {
    this.editingCategoryId.set(book.id);
    this.categoryEditValue.set(book.category ?? '');
  }

  commitCategoryEdit(book: BookRow): void {
    const value = this.categoryEditValue().trim();
    this.editingCategoryId.set(null);
    if (value === (book.category ?? '')) {
      return;
    }
    const previous = book.category;
    this.runFieldMutation(
      book.id,
      (b) => ({ ...b, category: value || null }),
      (b) => ({ ...b, category: previous }),
      { category: value },
    );
  }

  protected startEditingSubcategory(book: BookRow): void {
    this.editingSubcategoryId.set(book.id);
    this.subcategoryEditValue.set(book.subcategory ?? '');
  }

  commitSubcategoryEdit(book: BookRow): void {
    const value = this.subcategoryEditValue().trim();
    this.editingSubcategoryId.set(null);
    if (value === (book.subcategory ?? '')) {
      return;
    }
    const previous = book.subcategory;
    this.runFieldMutation(
      book.id,
      (b) => ({ ...b, subcategory: value || null }),
      (b) => ({ ...b, subcategory: previous }),
      { subcategory: value },
    );
  }

  updateLocation(book: BookRow, value: string): void {
    const nextLocationId = value || null;
    if (nextLocationId === book.locationId) {
      return;
    }
    const previous = book.locationId;
    this.runFieldMutation(
      book.id,
      (b) => ({ ...b, locationId: nextLocationId }),
      (b) => ({ ...b, locationId: previous }),
      { locationId: value },
    );
  }

  updateItemType(book: BookRow, value: ItemType): void {
    if (value === book.itemType) {
      return;
    }
    const previous = book.itemType;
    this.runFieldMutation(
      book.id,
      (b) => ({ ...b, itemType: value }),
      (b) => ({ ...b, itemType: previous }),
      { itemType: value },
    );
  }

  updateLibraryStatus(book: BookRow, value: LibraryStatus): void {
    if (value === book.libraryStatus) {
      return;
    }
    const previous = book.libraryStatus;
    this.runFieldMutation(
      book.id,
      (b) => ({ ...b, libraryStatus: value }),
      (b) => ({ ...b, libraryStatus: previous }),
      { libraryStatus: value },
    );
  }

  updateReadingStatus(book: BookRow, value: ReadingStatus): void {
    if (value === book.readingStatus) {
      return;
    }
    const previous = book.readingStatus;
    this.runFieldMutation(
      book.id,
      (b) => ({ ...b, readingStatus: value }),
      (b) => ({ ...b, readingStatus: previous }),
      { readingStatus: value },
    );
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
