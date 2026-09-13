import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  BooksService,
  BulkImportResult,
  ImportResult,
  OwnershipFormat,
} from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';
import { OWNERSHIP_FORMAT_OPTIONS } from '../../core/book-labels';

@Component({
  selector: 'app-book-bulk-import',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './book-bulk-import.html',
  styleUrl: './book-bulk-import.scss',
})
export class BookBulkImportComponent {
  protected readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  protected readonly ownershipFormatOptions = OWNERSHIP_FORMAT_OPTIONS;

  readonly photoFiles = signal<File[]>([]);
  readonly ownershipFormat = signal<OwnershipFormat | ''>('');
  readonly locationId = signal('');
  readonly category = signal('');
  readonly language = signal('');
  readonly submitting = signal(false);
  readonly bulkResult = signal<BulkImportResult | null>(null);
  readonly bulkError = signal<string | null>(null);

  readonly onlyIncomplete = signal(true);
  readonly exporting = signal(false);
  readonly exportError = signal<string | null>(null);

  readonly importFile = signal<File | null>(null);
  readonly importing = signal(false);
  readonly importResult = signal<ImportResult | null>(null);
  readonly importError = signal<string | null>(null);

  readonly zipExporting = signal(false);
  readonly zipExportError = signal<string | null>(null);
  readonly zipFile = signal<File | null>(null);
  readonly zipImporting = signal(false);
  readonly zipImportResult = signal<ImportResult | null>(null);
  readonly zipImportError = signal<string | null>(null);

  constructor() {
    void this.locationsService.load();
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFiles.set(input.files ? Array.from(input.files) : []);
  }

  async submitBulkImport(): Promise<void> {
    if (this.photoFiles().length === 0) {
      return;
    }
    this.bulkError.set(null);
    this.bulkResult.set(null);
    this.submitting.set(true);
    try {
      const formData = new FormData();
      for (const file of this.photoFiles()) {
        formData.append('photos', file);
      }
      if (this.ownershipFormat()) formData.append('ownershipFormat', this.ownershipFormat());
      if (this.locationId()) formData.append('locationId', this.locationId());
      if (this.category()) formData.append('category', this.category());
      if (this.language()) formData.append('language', this.language());

      const result = await this.booksService.bulkImportPhotos(formData);
      this.bulkResult.set(result);
      this.photoFiles.set([]);
    } catch {
      this.bulkError.set('Could not import these photos. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async downloadExport(format: 'json' | 'csv'): Promise<void> {
    this.exportError.set(null);
    this.exporting.set(true);
    try {
      const blob = await this.booksService.exportBlob(format, this.onlyIncomplete());
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `books-export.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      this.exportError.set('Could not export books. Please try again.');
    } finally {
      this.exporting.set(false);
    }
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile.set(input.files?.[0] ?? null);
  }

  async submitImport(): Promise<void> {
    const file = this.importFile();
    if (!file) {
      return;
    }
    this.importError.set(null);
    this.importResult.set(null);
    this.importing.set(true);
    try {
      const text = await file.text();
      const rows = JSON.parse(text);
      if (!Array.isArray(rows)) {
        throw new Error('Expected a JSON array of book rows');
      }
      const result = await this.booksService.importRows(rows);
      this.importResult.set(result);
      this.importFile.set(null);
    } catch {
      this.importError.set('Could not import this file. Make sure it is a JSON array exported from this app.');
    } finally {
      this.importing.set(false);
    }
  }

  async downloadZipBackup(): Promise<void> {
    this.zipExportError.set(null);
    this.zipExporting.set(true);
    try {
      const blob = await this.booksService.exportBlob('zip', this.onlyIncomplete());
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'books-export.zip';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      this.zipExportError.set('Could not build the backup. Please try again.');
    } finally {
      this.zipExporting.set(false);
    }
  }

  onZipFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.zipFile.set(input.files?.[0] ?? null);
  }

  async submitZipImport(): Promise<void> {
    const file = this.zipFile();
    if (!file) {
      return;
    }
    this.zipImportError.set(null);
    this.zipImportResult.set(null);
    this.zipImporting.set(true);
    try {
      const result = await this.booksService.importZip(file);
      this.zipImportResult.set(result);
      this.zipFile.set(null);
    } catch {
      this.zipImportError.set('Could not import this backup. Make sure it is a .zip file exported from this app.');
    } finally {
      this.zipImporting.set(false);
    }
  }
}
