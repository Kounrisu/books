import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SettingsService } from '../../core/settings.service';
import { CONFIGURABLE_COLUMNS, CONFIGURABLE_FILTERS } from '../../core/book-list-settings';

@Component({
  selector: 'app-settings-page',
  imports: [MatCardModule, MatCheckboxModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPageComponent implements OnInit {
  protected readonly settingsService = inject(SettingsService);
  protected readonly columns = CONFIGURABLE_COLUMNS;
  protected readonly filters = CONFIGURABLE_FILTERS;

  ngOnInit(): void {
    void this.settingsService.load();
  }

  toggleColumn(key: string, visible: boolean): void {
    void this.settingsService.setColumnVisible(key, visible);
  }

  toggleFilter(key: string, visible: boolean): void {
    void this.settingsService.setFilterVisible(key, visible);
  }

  protected filterDisabledReason(filterKey: string): string | null {
    const column = this.columns.find((c) => c.filterKey === filterKey);
    if (column && !this.settingsService.isColumnVisible(column.key)) {
      return `Hidden because the "${column.label}" column is off`;
    }
    return null;
  }
}
