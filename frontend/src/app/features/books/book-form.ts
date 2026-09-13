import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BooksService } from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';

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
  ],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookFormComponent implements OnInit {
  private readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  private readonly router = inject(Router);

  readonly title = signal('');
  readonly author = signal('');
  readonly category = signal('');
  readonly language = signal('');
  readonly description = signal('');
  readonly myReview = signal('');
  readonly myNote = signal<number | null>(null);
  readonly recommend = signal(false);
  readonly locationId = signal('');
  readonly purchaseDate = signal('');
  // Entered by the user as a number via the numeric input; the API's read-back
  // value (BookRow.purchasePrice) is a string (Prisma Decimal serialization),
  // but that doesn't affect this form, which only ever writes a new value.
  readonly purchasePrice = signal<number | null>(null);
  readonly photoFile = signal<File | null>(null);

  ngOnInit(): void {
    void this.locationsService.load();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFile.set(input.files?.[0] ?? null);
  }

  protected photoFileName(): string | undefined {
    return this.photoFile()?.name;
  }

  async submit(): Promise<void> {
    const formData = new FormData();
    formData.append('title', this.title());
    formData.append('author', this.author());
    if (this.category()) formData.append('category', this.category());
    if (this.language()) formData.append('language', this.language());
    if (this.description()) formData.append('description', this.description());
    if (this.myReview()) formData.append('myReview', this.myReview());
    if (this.myNote() !== null) formData.append('myNote', String(this.myNote()));
    formData.append('recommend', String(this.recommend()));
    if (this.locationId()) formData.append('locationId', this.locationId());
    if (this.purchaseDate()) formData.append('purchaseDate', this.purchaseDate());
    if (this.purchasePrice() !== null) formData.append('purchasePrice', String(this.purchasePrice()));
    const photo = this.photoFile();
    if (photo) formData.append('photo', photo);

    await this.booksService.create(formData);
    this.router.navigateByUrl('/books');
  }
}
