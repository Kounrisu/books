import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResult {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenSignal = signal<string | null>(localStorage.getItem('accessToken'));

  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  token(): string | null {
    return this.tokenSignal();
  }

  async login(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(this.http.post<AuthResult>(`${this.baseUrl}/login`, { email, password }));
    this.setToken(result.accessToken);
  }

  async register(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(this.http.post<AuthResult>(`${this.baseUrl}/register`, { email, password }));
    this.setToken(result.accessToken);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.tokenSignal.set(null);
  }

  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
    this.tokenSignal.set(token);
  }
}
