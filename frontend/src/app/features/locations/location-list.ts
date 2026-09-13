import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { LocationsService } from '../../core/locations.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-location-list',
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './location-list.html',
})
export class LocationListComponent implements OnInit {
  protected readonly locationsService = inject(LocationsService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    void this.locationsService.load();
  }
}
