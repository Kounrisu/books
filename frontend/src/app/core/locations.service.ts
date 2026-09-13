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
}

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/locations`;

  readonly locations = signal<LocationRow[]>([]);

  async load(): Promise<void> {
    const result = await firstValueFrom(this.http.get<LocationRow[]>(this.baseUrl));
    this.locations.set(result);
  }

  async create(formData: FormData): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, formData));
    await this.load();
  }
}
