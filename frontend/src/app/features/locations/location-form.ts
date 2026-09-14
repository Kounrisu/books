import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LocationRow, LocationsService } from '../../core/locations.service';

@Component({
  selector: 'app-location-form',
  imports: [FormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './location-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './location-form.scss',
})
export class LocationFormComponent implements OnInit {
  protected readonly locationsService = inject(LocationsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly locationId = signal<string | null>(null);

  readonly name = signal('');
  readonly parentLocationId = signal<string>('');
  readonly photoFile = signal<File | null>(null);
  readonly existingPhotoPath = signal<string | null>(null);
  readonly coordinates = signal<{ lat: number; lng: number } | null>(null);
  readonly geolocationError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly returnLocationId = signal<string | null>(null);

  /** Candidate parents: every other location except this one and its own descendants (avoids a cycle). */
  protected readonly parentOptions = computed<LocationRow[]>(() => {
    const id = this.locationId();
    const all = this.locationsService.locations();
    if (!id) {
      return all;
    }
    const excluded = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const location of all) {
        if (location.parentLocationId && excluded.has(location.parentLocationId) && !excluded.has(location.id)) {
          excluded.add(location.id);
          changed = true;
        }
      }
    }
    return all.filter((location) => !excluded.has(location.id));
  });

  async ngOnInit(): Promise<void> {
    if (this.locationsService.locations().length === 0) {
      await this.locationsService.load();
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      const parentId = this.route.snapshot.queryParamMap.get('parentLocationId');
      if (parentId && this.locationsService.findById(parentId)) {
        this.parentLocationId.set(parentId);
        this.returnLocationId.set(parentId);
      }
      return;
    }
    this.locationId.set(id);
    this.returnLocationId.set(id);

    const location = this.locationsService.findById(id);
    if (!location) {
      this.error.set('This location could not be found.');
      return;
    }
    this.parentLocationId.set(location.parentLocationId ?? '');
    this.name.set(location.name);
    this.existingPhotoPath.set(location.photoPath);
    if (location.latitude !== null && location.longitude !== null) {
      this.coordinates.set({ lat: location.latitude, lng: location.longitude });
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFile.set(input.files?.[0] ?? null);
  }

  protected photoFileName(): string | undefined {
    return this.photoFile()?.name;
  }

  protected isEditing(): boolean {
    return this.locationId() !== null;
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
    this.error.set(null);
    this.submitting.set(true);
    try {
      const formData = new FormData();
      formData.append('name', this.name());
      formData.append('parentLocationId', this.parentLocationId());
      const photo = this.photoFile();
      if (photo) {
        formData.append('photo', photo);
      }
      const coords = this.coordinates();
      if (coords) {
        formData.append('latitude', String(coords.lat));
        formData.append('longitude', String(coords.lng));
      }

      const id = this.locationId();
      if (id) {
        await this.locationsService.update(id, formData);
      } else {
        await this.locationsService.create(formData);
      }
      const destination = id ?? (this.parentLocationId() || null);
      await this.router.navigate(destination ? ['/locations', destination] : ['/locations']);
    } catch {
      this.error.set('Could not save this location. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
