import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly mode = signal<'login' | 'register'>('login');

  toggleMode(): void {
    this.error.set(null);
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
  }

  async submit(): Promise<void> {
    this.error.set(null);
    try {
      if (this.mode() === 'register') {
        await this.auth.register(this.email(), this.password());
      } else {
        await this.auth.login(this.email(), this.password());
      }
      this.router.navigateByUrl('/books');
    } catch {
      this.error.set(this.mode() === 'register' ? 'Could not register with those details.' : 'Invalid email or password.');
    }
  }
}
