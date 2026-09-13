import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { BooksService } from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-list',
  imports: [RouterLink, MatButtonModule, MatChipsModule, MatIconModule, MatTableModule],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookListComponent implements OnInit {
  protected readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;
  protected readonly displayedColumns = ['cover', 'title', 'author', 'category', 'myNote', 'ranking', 'recommend', 'location'];

  ngOnInit(): void {
    void this.booksService.load();
    void this.locationsService.load();
  }

  protected locationName(locationId: string | null): string | undefined {
    if (!locationId) {
      return undefined;
    }
    return this.locationsService.locations().find((location) => location.id === locationId)?.name;
  }
}
