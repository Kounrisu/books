import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CONFIGURABLE_COLUMNS, CONFIGURABLE_FILTERS } from './book-list-settings';

export interface UserSettingsRow {
  visibleColumns: string[] | null;
  visibleFilters: string[] | null;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/settings`;

  private readonly loaded = signal(false);
  // null means "no customization saved yet" — everything is visible by default.
  readonly visibleColumns = signal<string[] | null>(null);
  readonly visibleFilters = signal<string[] | null>(null);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    if (this.loaded()) {
      return;
    }
    try {
      const result = await firstValueFrom(this.http.get<UserSettingsRow>(this.baseUrl));
      this.visibleColumns.set(result.visibleColumns);
      this.visibleFilters.set(result.visibleFilters);
    } catch {
      this.error.set('Could not load your settings. Please try again.');
    } finally {
      this.loaded.set(true);
    }
  }

  isColumnVisible(key: string): boolean {
    const columns = this.visibleColumns();
    return columns === null || columns.includes(key);
  }

  isFilterVisible(key: string): boolean {
    const pairedColumn = CONFIGURABLE_COLUMNS.find((column) => column.filterKey === key);
    if (pairedColumn && !this.isColumnVisible(pairedColumn.key)) {
      return false;
    }
    const filters = this.visibleFilters();
    return filters === null || filters.includes(key);
  }

  async setColumnVisible(key: string, visible: boolean): Promise<void> {
    const all = CONFIGURABLE_COLUMNS.map((column) => column.key);
    const current = this.visibleColumns() ?? all;
    const next = visible ? [...new Set([...current, key])] : current.filter((column) => column !== key);
    this.visibleColumns.set(next);
    await firstValueFrom(this.http.put(this.baseUrl, { visibleColumns: next }));
  }

  async setFilterVisible(key: string, visible: boolean): Promise<void> {
    const all = CONFIGURABLE_FILTERS.map((filter) => filter.key);
    const current = this.visibleFilters() ?? all;
    const next = visible ? [...new Set([...current, key])] : current.filter((filter) => filter !== key);
    this.visibleFilters.set(next);
    await firstValueFrom(this.http.put(this.baseUrl, { visibleFilters: next }));
  }
}
