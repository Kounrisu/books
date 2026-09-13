import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResult {
  accessToken: string;
}

export interface CurrentUserProfile {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  isDemo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenSignal = signal<string | null>(localStorage.getItem('accessToken'));
  private readonly profileSignal = signal<CurrentUserProfile | null>(null);

  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly profile = this.profileSignal.asReadonly();
  readonly isAdmin = computed(() => this.profileSignal()?.role === 'admin');
  readonly isDemo = computed(() => this.profileSignal()?.isDemo === true);

  token(): string | null {
    return this.tokenSignal();
  }

  async login(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(this.http.post<AuthResult>(`${this.baseUrl}/login`, { email, password }));
    this.setToken(result.accessToken);
    await this.loadProfile();
  }

  async register(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(this.http.post<AuthResult>(`${this.baseUrl}/register`, { email, password }));
    this.setToken(result.accessToken);
    await this.loadProfile();
  }

  async loginAsDemo(): Promise<void> {
    const result = await firstValueFrom(this.http.post<AuthResult>(`${this.baseUrl}/demo`, {}));
    this.setToken(result.accessToken);
    await this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    if (!this.isAuthenticated()) {
      return;
    }
    try {
      const profile = await firstValueFrom(
        this.http.get<CurrentUserProfile>(`${this.baseUrl}/me`),
      );
      this.profileSignal.set(profile);
    } catch {
      this.profileSignal.set(null);
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.tokenSignal.set(null);
    this.profileSignal.set(null);
  }

  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
    this.tokenSignal.set(token);
  }
}
