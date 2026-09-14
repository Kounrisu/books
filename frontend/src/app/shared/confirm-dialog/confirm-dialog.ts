import { Component, Inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** When set, the confirm button stays disabled until the typed value matches this exactly. */
  requireText?: string;
  requireTextLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  readonly typedText = signal('');

  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) protected readonly data: ConfirmDialogData,
  ) {}

  protected get canConfirm(): boolean {
    if (!this.data.requireText) {
      return true;
    }
    return this.typedText().trim() === this.data.requireText;
  }

  confirm(): void {
    if (this.canConfirm) {
      this.dialogRef.close(true);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
