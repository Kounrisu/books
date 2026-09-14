import { Injectable, computed, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'books-theme-mode';
  private readonly mediaQuery = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  private readonly systemIsDark = signal(this.mediaQuery ? this.mediaQuery.matches : false);
  readonly mode = signal<ThemeMode>(this.getInitialMode());

  readonly isDark = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'dark') return true;
    if (currentMode === 'light') return false;
    return this.systemIsDark();
  });

  constructor() {
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', (e) => {
        this.systemIsDark.set(e.matches);
        if (this.mode() === 'system') {
          this.applyTheme();
        }
      });
    }
    this.applyTheme();
  }

  setMode(newMode: ThemeMode): void {
    this.mode.set(newMode);
    try {
      localStorage.setItem(this.storageKey, newMode);
    } catch {
      // Ignore localStorage access failures (e.g. incognito)
    }
    this.applyTheme();
  }

  private getInitialMode(): ThemeMode {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'system';
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;
    const dark = this.isDark();
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}
