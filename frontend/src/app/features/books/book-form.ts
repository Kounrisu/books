import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  BooksService,
  ItemType,
  LibraryStatus,
  MetadataStatus,
  OwnershipFormat,
  PhysicalStatus,
  ReadingStatus,
} from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';
import {
  BOOK_FORMAT_OPTIONS,
  ITEM_TYPE_OPTIONS,
  LIBRARY_STATUS_OPTIONS,
  METADATA_STATUS_OPTIONS,
  OWNERSHIP_FORMAT_OPTIONS,
  PHYSICAL_STATUS_OPTIONS,
  READING_STATUS_OPTIONS,
} from '../../core/book-labels';

/**
 * Creation only — editing an existing book happens in place on the detail
 * page (BookDetailComponent's edit-mode toggle) rather than here, so this
 * component doesn't need to load or branch on an existing book.
 */
@Component({
  selector: 'app-book-form',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './book-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './book-form.scss',
})
export class BookFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  private readonly router = inject(Router);

  protected readonly ownershipFormatOptions = OWNERSHIP_FORMAT_OPTIONS;
  protected readonly physicalStatusOptions = PHYSICAL_STATUS_OPTIONS;
  protected readonly libraryStatusOptions = LIBRARY_STATUS_OPTIONS;
  protected readonly readingStatusOptions = READING_STATUS_OPTIONS;
  protected readonly metadataStatusOptions = METADATA_STATUS_OPTIONS;
  protected readonly bookFormatOptions = BOOK_FORMAT_OPTIONS;
  protected readonly itemTypeOptions = ITEM_TYPE_OPTIONS;
  protected readonly categorySuggestions = signal<string[]>([]);
  protected readonly subcategorySuggestions = signal<string[]>([]);

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
  readonly photoFile = signal<File | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.locationsService.load().then(() => {
      const id = this.route.snapshot.queryParamMap.get('locationId');
      if (id && this.locationsService.findById(id)) this.locationId.set(id);
    });
    void this.booksService.categorySuggestions().then((values) => this.categorySuggestions.set(values));
    void this.booksService.subcategorySuggestions().then((values) => this.subcategorySuggestions.set(values));
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFile.set(input.files?.[0] ?? null);
  }

  protected photoFileName(): string | undefined {
    return this.photoFile()?.name;
  }

  async submit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);
    try {
      const formData = new FormData();
      formData.append('title', this.title());
      formData.append('author', this.author());
      formData.append('itemType', this.itemType());
      if (this.category()) formData.append('category', this.category());
      if (this.subcategory()) formData.append('subcategory', this.subcategory());
      if (this.language()) formData.append('language', this.language());
      if (this.description()) formData.append('description', this.description());
      if (this.myReview()) formData.append('myReview', this.myReview());
      if (this.myNote() !== null) formData.append('myNote', String(this.myNote()));
      formData.append('recommend', String(this.recommend()));
      formData.append('isFavorite', String(this.isFavorite()));
      if (this.locationId()) formData.append('locationId', this.locationId());
      if (this.purchaseDate()) formData.append('purchaseDate', this.purchaseDate());
      if (this.purchasePrice() !== null) formData.append('purchasePrice', String(this.purchasePrice()));
      formData.append('ownershipFormat', this.ownershipFormat());
      formData.append('physicalStatus', this.physicalStatus());
      formData.append('libraryStatus', this.libraryStatus());
      formData.append('readingStatus', this.readingStatus());
      if (this.savedList()) formData.append('savedList', this.savedList());
      if (this.personalNotes()) formData.append('personalNotes', this.personalNotes());
      if (this.spoilerNotes()) formData.append('spoilerNotes', this.spoilerNotes());
      formData.append('metadataStatus', this.metadataStatus());
      if (this.isbn10()) formData.append('isbn10', this.isbn10());
      if (this.isbn13()) formData.append('isbn13', this.isbn13());
      if (this.publisher()) formData.append('publisher', this.publisher());
      if (this.publicationYear() !== null) formData.append('publicationYear', String(this.publicationYear()));
      if (this.edition()) formData.append('edition', this.edition());
      if (this.pageCount() !== null) formData.append('pageCount', String(this.pageCount()));
      if (this.seriesName()) formData.append('seriesName', this.seriesName());
      if (this.seriesNumber()) formData.append('seriesNumber', this.seriesNumber());
      if (this.translator()) formData.append('translator', this.translator());
      formData.append('tags', this.tags());
      if (this.condition()) formData.append('condition', this.condition());
      if (this.format()) formData.append('format', this.format());
      const photo = this.photoFile();
      if (photo) formData.append('photo', photo);

      await this.booksService.create(formData);
      this.router.navigateByUrl('/books');
    } catch {
      this.error.set('Could not save this book. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
