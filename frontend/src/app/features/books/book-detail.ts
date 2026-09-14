import { Component, HostListener, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  BookRow,
  BooksService,
  ItemType,
  LibraryStatus,
  MetadataStatus,
  OwnershipFormat,
  PhysicalStatus,
  ReadingStatus,
} from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';
import { TimelineService } from '../../core/timeline.service';
import { SecureImageDirective } from '../../core/secure-image.directive';
import { CanComponentDeactivate } from '../../core/unsaved-changes.guard';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import {
  BOOK_FORMAT_OPTIONS,
  ITEM_TYPE_OPTIONS,
  LIBRARY_STATUS_OPTIONS,
  METADATA_STATUS_OPTIONS,
  OWNERSHIP_FORMAT_OPTIONS,
  PHYSICAL_STATUS_OPTIONS,
  READING_STATUS_OPTIONS,
  itemTypeLabel,
  libraryStatusLabel,
  metadataStatusLabel,
  ownershipFormatLabel,
  physicalStatusLabel,
  readingStatusLabel,
} from '../../core/book-labels';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-detail',
  imports: [
    RouterLink,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    SecureImageDirective,
  ],
  templateUrl: './book-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './book-detail.scss',
})
export class BookDetailComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  protected readonly timelineService = inject(TimelineService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;

  protected readonly ownershipFormatOptions = OWNERSHIP_FORMAT_OPTIONS;
  protected readonly physicalStatusOptions = PHYSICAL_STATUS_OPTIONS;
  protected readonly libraryStatusOptions = LIBRARY_STATUS_OPTIONS;
  protected readonly readingStatusOptions = READING_STATUS_OPTIONS;
  protected readonly metadataStatusOptions = METADATA_STATUS_OPTIONS;
  protected readonly bookFormatOptions = BOOK_FORMAT_OPTIONS;
  protected readonly itemTypeOptions = ITEM_TYPE_OPTIONS;

  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);
  readonly showSpoilers = signal(false);
  readonly borrowerName = signal('');
  readonly lending = signal(false);
  readonly lendError = signal<string | null>(null);

  // --- edit mode ---
  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly categorySuggestions = signal<string[]>([]);
  readonly subcategorySuggestions = signal<string[]>([]);
  readonly photoFile = signal<File | null>(null);
  readonly photoPreviewUrl = signal<string | null>(null);

  readonly title = signal('');
  readonly author = signal('');
  readonly itemType = signal<ItemType>('book');
  readonly category = signal('');
  readonly subcategory = signal('');
  readonly language = signal('');
  readonly description = signal('');
  readonly myReview = signal('');
  readonly myNote = signal<number | null>(null);
  readonly recommend = signal(false);
  readonly isFavorite = signal(false);
  readonly locationId = signal('');
  readonly purchaseDate = signal('');
  readonly purchasePrice = signal<number | null>(null);
  readonly ownershipFormat = signal<OwnershipFormat>('physical');
  readonly physicalStatus = signal<PhysicalStatus>('in_collection');
  readonly libraryStatus = signal<LibraryStatus>('owned');
  readonly readingStatus = signal<ReadingStatus>('unread');
  readonly savedList = signal('');
  readonly personalNotes = signal('');
  readonly spoilerNotes = signal('');
  readonly metadataStatus = signal<MetadataStatus>('complete');
  readonly isbn10 = signal('');
  readonly isbn13 = signal('');
  readonly publisher = signal('');
  readonly publicationYear = signal<number | null>(null);
  readonly edition = signal('');
  readonly pageCount = signal<number | null>(null);
  readonly seriesName = signal('');
  readonly seriesNumber = signal('');
  readonly translator = signal('');
  readonly tags = signal('');
  readonly condition = signal('');
  readonly format = signal('');

  protected readonly book = computed<BookRow | undefined>(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.booksService.findById(id) : undefined;
  });

  protected readonly locationName = computed(() => {
    const locationId = this.book()?.locationId;
    if (!locationId) {
      return undefined;
    }
    return this.locationsService.locations().find((location) => location.id === locationId)?.name;
  });

  protected readonly formatLabel = computed(() =>
    this.book() ? ownershipFormatLabel(this.book()!.ownershipFormat) : '',
  );

  protected readonly itemTypeText = computed(() =>
    this.book() ? itemTypeLabel(this.book()!.itemType) : '',
  );

  protected readonly statusLabel = computed(() =>
    this.book() ? libraryStatusLabel(this.book()!.libraryStatus) : '',
  );

  protected readonly readingLabel = computed(() =>
    this.book() ? readingStatusLabel(this.book()!.readingStatus) : '',
  );

  protected readonly physicalStatusText = computed(() =>
    this.book() ? physicalStatusLabel(this.book()!.physicalStatus) : '',
  );

  protected readonly metadataStatusText = computed(() =>
    this.book() ? metadataStatusLabel(this.book()!.metadataStatus) : '',
  );

  protected readonly activeLoan = computed(() => {
    const book = this.book();
    return book ? this.timelineService.activeLoanForBook(book.id) : undefined;
  });

  ngOnInit(): void {
    // Opening this page directly (bookmark, refresh, shared link) shouldn't
    // require pulling the entire library first — fetch just this book if
    // it isn't already cached from the list page.
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !this.booksService.findById(id)) {
      void this.booksService.getOne(id).catch(() => this.error.set('Could not load this book.'));
    }
    if (this.locationsService.locations().length === 0) {
      void this.locationsService.load();
    }
    void this.timelineService.load();
  }

  async deleteBook(): Promise<void> {
    const book = this.book();
    if (!book) {
      return;
    }
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete book',
      message: `Delete "${book.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.error.set(null);
    this.deleting.set(true);
    try {
      await this.booksService.delete(book.id);
      this.router.navigateByUrl('/books');
    } catch {
      this.error.set('Could not delete this book. Please try again.');
    } finally {
      this.deleting.set(false);
    }
  }

  async lendBook(): Promise<void> {
    const book = this.book();
    if (!book || !this.borrowerName().trim()) {
      return;
    }
    this.lendError.set(null);
    this.lending.set(true);
    try {
      await this.timelineService.createLoan({
        bookId: book.id,
        borrowerName: this.borrowerName().trim(),
        borrowedAt: new Date().toISOString(),
      });
      this.borrowerName.set('');
    } catch {
      this.lendError.set('Could not record this loan. Please try again.');
    } finally {
      this.lending.set(false);
    }
  }

  async returnBook(): Promise<void> {
    const loan = this.activeLoan();
    if (!loan) {
      return;
    }
    this.lendError.set(null);
    this.lending.set(true);
    try {
      await this.timelineService.returnLoan(loan.id);
    } catch {
      this.lendError.set('Could not record the return. Please try again.');
    } finally {
      this.lending.set(false);
    }
  }

  startEdit(): void {
    const book = this.book();
    if (!book) {
      return;
    }
    this.title.set(book.title);
    this.author.set(book.author);
    this.itemType.set(book.itemType);
    this.category.set(book.category ?? '');
    this.subcategory.set(book.subcategory ?? '');
    this.language.set(book.language ?? '');
    this.description.set(book.description ?? '');
    this.myReview.set(book.myReview ?? '');
    this.myNote.set(book.myNote);
    this.recommend.set(book.recommend ?? false);
    this.isFavorite.set(book.isFavorite);
    this.locationId.set(book.locationId ?? '');
    this.purchaseDate.set(book.purchaseDate ? book.purchaseDate.slice(0, 10) : '');
    this.purchasePrice.set(book.purchasePrice !== null ? Number(book.purchasePrice) : null);
    this.ownershipFormat.set(book.ownershipFormat);
    this.physicalStatus.set(book.physicalStatus);
    this.libraryStatus.set(book.libraryStatus);
    this.readingStatus.set(book.readingStatus);
    this.savedList.set(book.savedList ?? '');
    this.personalNotes.set(book.personalNotes ?? '');
    this.spoilerNotes.set(book.spoilerNotes ?? '');
    this.metadataStatus.set(book.metadataStatus);
    this.isbn10.set(book.isbn10 ?? '');
    this.isbn13.set(book.isbn13 ?? '');
    this.publisher.set(book.publisher ?? '');
    this.publicationYear.set(book.publicationYear);
    this.edition.set(book.edition ?? '');
    this.pageCount.set(book.pageCount);
    this.seriesName.set(book.seriesName ?? '');
    this.seriesNumber.set(book.seriesNumber ?? '');
    this.translator.set(book.translator ?? '');
    this.tags.set(book.tags.join(', '));
    this.condition.set(book.condition ?? '');
    this.format.set(book.format ?? '');
    this.photoFile.set(null);
    this.setPhotoPreview(null);
    this.error.set(null);
    this.editMode.set(true);

    void this.booksService.categorySuggestions().then((values) => this.categorySuggestions.set(values));
    void this.booksService.subcategorySuggestions().then((values) => this.subcategorySuggestions.set(values));
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.setPhotoPreview(null);
  }

  /** Warns before an in-app route change discards an open edit — the
   * editor previously had no guard at all, so navigating away (e.g. via
   * the nav bar) silently threw away everything typed. */
  async canDeactivate(): Promise<boolean> {
    if (!this.editMode()) {
      return true;
    }
    return this.confirmDialog.confirm({
      title: 'Discard changes?',
      message: 'You have an unsaved edit open. Leaving now will discard it.',
      confirmLabel: 'Discard',
      danger: true,
    });
  }

  /** Warns before a tab close/refresh discards an open edit — canDeactivate
   * only covers in-app navigation, not leaving the page entirely. */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.editMode()) {
      event.preventDefault();
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.photoFile.set(file);
    this.setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  private setPhotoPreview(url: string | null): void {
    const previous = this.photoPreviewUrl();
    if (previous) {
      URL.revokeObjectURL(previous);
    }
    this.photoPreviewUrl.set(url);
  }

  async saveEdit(): Promise<void> {
    const book = this.book();
    if (!book) {
      return;
    }
    this.error.set(null);
    this.saving.set(true);
    try {
      // Every optional field is always appended, even when blank — a blank
      // value means "clear this field," not "leave it unchanged." Only the
      // fields with no representable "blank" state (relations, dates,
      // numbers) skip the append when empty, and the backend transforms
      // interpret an appended empty string as an explicit null/clear.
      const formData = new FormData();
      formData.append('title', this.title());
      formData.append('author', this.author());
      formData.append('itemType', this.itemType());
      formData.append('category', this.category());
      formData.append('subcategory', this.subcategory());
      formData.append('language', this.language());
      formData.append('description', this.description());
      formData.append('myReview', this.myReview());
      formData.append('myNote', this.myNote() !== null ? String(this.myNote()) : '');
      formData.append('recommend', String(this.recommend()));
      formData.append('isFavorite', String(this.isFavorite()));
      formData.append('locationId', this.locationId());
      formData.append('purchaseDate', this.purchaseDate());
      formData.append('purchasePrice', this.purchasePrice() !== null ? String(this.purchasePrice()) : '');
      formData.append('ownershipFormat', this.ownershipFormat());
      formData.append('physicalStatus', this.physicalStatus());
      formData.append('libraryStatus', this.libraryStatus());
      formData.append('readingStatus', this.readingStatus());
      formData.append('savedList', this.savedList());
      formData.append('personalNotes', this.personalNotes());
      formData.append('spoilerNotes', this.spoilerNotes());
      formData.append('metadataStatus', this.metadataStatus());
      formData.append('isbn10', this.isbn10());
      formData.append('isbn13', this.isbn13());
      formData.append('publisher', this.publisher());
      formData.append('publicationYear', this.publicationYear() !== null ? String(this.publicationYear()) : '');
      formData.append('edition', this.edition());
      formData.append('pageCount', this.pageCount() !== null ? String(this.pageCount()) : '');
      formData.append('seriesName', this.seriesName());
      formData.append('seriesNumber', this.seriesNumber());
      formData.append('translator', this.translator());
      formData.append('tags', this.tags());
      formData.append('condition', this.condition());
      formData.append('format', this.format());
      const photo = this.photoFile();
      if (photo) formData.append('photo', photo);

      await this.booksService.update(book.id, formData);
      this.editMode.set(false);
      this.setPhotoPreview(null);
    } catch {
      this.error.set('Could not save these changes. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
