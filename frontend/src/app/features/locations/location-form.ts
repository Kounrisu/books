import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocationsService } from '../../core/locations.service';

@Component({
  selector: 'app-location-form',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './location-form.html',
})
export class LocationFormComponent {
  private readonly locationsService = inject(LocationsService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly photoFile = signal<File | null>(null);
  readonly coordinates = signal<{ lat: number; lng: number } | null>(null);
  readonly geolocationError = signal<string | null>(null);

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFile.set(input.files?.[0] ?? null);
  }

  captureLocation(): void {
    this.geolocationError.set(null);
    if (!navigator.geolocation) {
      this.geolocationError.set('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => this.coordinates.set({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => this.geolocationError.set('Location permission denied.'),
    );
  }

  async submit(): Promise<void> {
    const formData = new FormData();
    formData.append('name', this.name());
    const photo = this.photoFile();
    if (photo) {
      formData.append('photo', photo);
    }
    const coords = this.coordinates();
    if (coords) {
      formData.append('latitude', String(coords.lat));
      formData.append('longitude', String(coords.lng));
    }
    await this.locationsService.create(formData);
    this.router.navigateByUrl('/locations');
  }
}
