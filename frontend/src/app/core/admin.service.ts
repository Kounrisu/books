import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/users`;

  readonly users = signal<AdminUserRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.http.get<AdminUserRow[]>(this.baseUrl));
      this.users.set(result);
    } catch {
      this.error.set('Could not load users. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async setRole(id: string, role: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.baseUrl}/${id}/role`, { role }));
    await this.load();
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.baseUrl}/${id}/active`, { isActive }));
    await this.load();
  }

  async deleteUser(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    await this.load();
  }
}
