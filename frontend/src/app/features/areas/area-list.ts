import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AreasService, CollectionAreaRow } from '../../core/areas.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-area-list',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './area-list.html',
  styleUrl: './area-list.scss',
})
export class AreaListComponent implements OnInit {
  protected readonly areasService = inject(AreasService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly deletingId = signal<string | null>(null);

  ngOnInit(): void {
    void this.areasService.load();
  }

  async deleteArea(area: CollectionAreaRow): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete collection area',
      message: `Delete "${area.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.deletingId.set(area.id);
    try {
      await this.areasService.delete(area.id);
    } finally {
      this.deletingId.set(null);
    }
  }
}
