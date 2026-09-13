import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocationRow, LocationsService } from '../../core/locations.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-location-list',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './location-list.html',
  styleUrl: './location-list.scss',
})
export class LocationListComponent implements OnInit {
  protected readonly locationsService = inject(LocationsService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly deletingId = signal<string | null>(null);

  ngOnInit(): void {
    void this.locationsService.load();
  }

  async deleteLocation(location: LocationRow): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete location',
      message: `Delete "${location.name}"? Books assigned to it will keep their other details but lose this location.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.deletingId.set(location.id);
    try {
      await this.locationsService.delete(location.id);
    } finally {
      this.deletingId.set(null);
    }
  }
}
