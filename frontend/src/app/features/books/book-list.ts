import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { BooksService } from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-list',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatChipsModule],
  templateUrl: './book-list.html',
})
export class BookListComponent implements OnInit {
  protected readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;

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
