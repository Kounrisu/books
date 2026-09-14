import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AdminService, AdminUserRow } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-admin-users',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './admin-users.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-users.scss',
})
export class AdminUsersComponent implements OnInit {
  protected readonly adminService = inject(AdminService);
  protected readonly authService = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly displayedColumns = ['email', 'role', 'status', 'created', 'actions'];
  readonly actionError = signal<string | null>(null);
  readonly busyUserId = signal<string | null>(null);

  ngOnInit(): void {
    void this.adminService.load();
  }

  protected isSelf(user: AdminUserRow): boolean {
    return user.email === this.authService.profile()?.email;
  }

  async changeRole(user: AdminUserRow, role: string): Promise<void> {
    this.actionError.set(null);
    this.busyUserId.set(user.id);
    try {
      await this.adminService.setRole(user.id, role);
    } catch {
      this.actionError.set(`Could not change role for ${user.email}.`);
    } finally {
      this.busyUserId.set(null);
    }
  }

  async toggleActive(user: AdminUserRow): Promise<void> {
    this.actionError.set(null);
    this.busyUserId.set(user.id);
    try {
      await this.adminService.setActive(user.id, !user.isActive);
    } catch {
      this.actionError.set(`Could not update status for ${user.email}.`);
    } finally {
      this.busyUserId.set(null);
    }
  }

  async deleteUser(user: AdminUserRow): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete user',
      message: `This permanently deletes ${user.email} and everything they own — books, locations, loans, timeline events, and collection areas. This cannot be undone.`,
      confirmLabel: 'Delete user',
      danger: true,
      requireText: user.email,
      requireTextLabel: `Type "${user.email}" to confirm`,
    });
    if (!confirmed) {
      return;
    }
    this.actionError.set(null);
    this.busyUserId.set(user.id);
    try {
      await this.adminService.deleteUser(user.id);
    } catch {
      this.actionError.set(`Could not delete ${user.email}.`);
    } finally {
      this.busyUserId.set(null);
    }
  }
}
