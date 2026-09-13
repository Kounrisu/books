import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LocationRow {
  id: string;
  name: string;
  photoPath: string | null;
  latitude: number | null;
  longitude: number | null;
  parentLocationId: string | null;
}

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/locations`;

  readonly locations = signal<LocationRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.http.get<LocationRow[]>(this.baseUrl));
      this.locations.set(result);
    } catch {
      this.error.set('Could not load your locations. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(formData: FormData): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, formData));
    await this.load();
  }

  async update(id: string, formData: FormData): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.baseUrl}/${id}`, formData));
    await this.load();
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    await this.load();
  }

  findById(id: string): LocationRow | undefined {
    return this.locations().find((location) => location.id === id);
  }

  /** Full "Home / Garage / Cardbox #3" style path, walking up parents. */
  pathName(id: string | null | undefined): string {
    if (!id) {
      return '';
    }
    const segments: string[] = [];
    let current = this.findById(id);
    const seen = new Set<string>();
    while (current && !seen.has(current.id)) {
      segments.unshift(current.name);
      seen.add(current.id);
      current = current.parentLocationId ? this.findById(current.parentLocationId) : undefined;
    }
    return segments.join(' / ');
  }
}
