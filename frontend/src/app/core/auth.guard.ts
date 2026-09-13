import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  if (authService.isAuthenticated()) {
    return true;
  }
  const router = inject(Router);
  return router.parseUrl('/login');
};
