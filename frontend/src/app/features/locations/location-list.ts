import { Component, OnInit, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LocationRow, LocationsService } from '../../core/locations.service';
import { BooksService } from '../../core/books.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { environment } from '../../../environments/environment';
import { SecureImageDirective } from '../../core/secure-image.directive';

@Component({
  selector: 'app-location-list',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SecureImageDirective,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './location-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './location-list.scss',
})
export class LocationListComponent implements OnInit {
  protected readonly locationsService = inject(LocationsService);
  protected readonly booksService = inject(BooksService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly deletingId = signal<string | null>(null);
  readonly mutationError = signal<string | null>(null);
  readonly search = signal('');
  readonly includeChildren = signal(true);
  protected readonly locationId = computed(() => this.params().get('id'));
  protected readonly currentLocation = computed(() => {
    const id = this.locationId();
    return id ? this.locationsService.findById(id) : undefined;
  });
  protected readonly breadcrumbLocations = computed(() => {
    const id = this.locationId();
    return id ? this.locationsService.breadcrumbs(id) : [];
  });
  protected readonly childLocations = computed(() => this.locationsService.childrenOf(this.locationId()));
  protected readonly bookCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const book of this.booksService.books()) {
      if (!book.locationId) continue;
      for (const location of this.locationsService.breadcrumbs(book.locationId)) {
        counts.set(location.id, (counts.get(location.id) ?? 0) + 1);
      }
    }
    return counts;
  });
  protected readonly scopedBooks = computed(() => {
    const id = this.locationId();
    if (!id) return [];
    const ids = this.includeChildren() ? this.locationsService.subtreeIds(id) : new Set([id]);
    return this.booksService.books().filter((book) => book.locationId && ids.has(book.locationId));
  });
  protected readonly visibleBooks = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return this.scopedBooks().filter((book) => !query || [
      book.title, book.author, book.isbn10, book.isbn13, book.seriesName, ...(book.tags ?? []),
    ].some((value) => value?.toLocaleLowerCase().includes(query)))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  });

  constructor() {
    effect(() => {
      this.locationId();
      this.search.set('');
      this.includeChildren.set(true);
      this.mutationError.set(null);
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    void this.locationsService.load();
    // The book cache may contain only one directly opened book, so always refresh.
    void this.booksService.load();
  }

  async deleteLocation(location: LocationRow): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete location',
      message: `Delete "${location.name}"? Books assigned to it will keep their other details but lose this location, and any sub-locations inside it will move to the top level.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.deletingId.set(location.id);
    this.mutationError.set(null);
    try {
      await this.locationsService.delete(location.id);
      await this.booksService.load();
    } catch {
      this.mutationError.set(`Could not delete "${location.name}". Please try again.`);
    } finally {
      this.deletingId.set(null);
    }
  }
}
