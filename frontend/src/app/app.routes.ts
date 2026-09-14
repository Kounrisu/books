import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { unsavedChangesGuard } from './core/unsaved-changes.guard';

// Every feature page is its own lazy chunk — nothing beyond the shell and
// the router loads eagerly. Login is the one route a fresh (unauthenticated)
// visit always needs, so it's the only feature kept in the eager bundle.
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'locations',
    loadComponent: () => import('./features/locations/location-list').then((m) => m.LocationListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'locations/new',
    loadComponent: () => import('./features/locations/location-form').then((m) => m.LocationFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'locations/:id/edit',
    loadComponent: () => import('./features/locations/location-form').then((m) => m.LocationFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'locations/:id',
    loadComponent: () => import('./features/locations/location-list').then((m) => m.LocationListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'books',
    loadComponent: () => import('./features/books/book-list').then((m) => m.BookListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'books/new',
    loadComponent: () => import('./features/books/book-form').then((m) => m.BookFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'books/import',
    loadComponent: () => import('./features/books/book-bulk-import').then((m) => m.BookBulkImportComponent),
    canActivate: [authGuard],
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./features/books/book-detail').then((m) => m.BookDetailComponent),
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'timeline',
    loadComponent: () => import('./features/timeline/timeline-list').then((m) => m.TimelineListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'areas',
    loadComponent: () => import('./features/areas/area-list').then((m) => m.AreaListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'areas/new',
    loadComponent: () => import('./features/areas/area-form').then((m) => m.AreaFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'areas/:id/edit',
    loadComponent: () => import('./features/areas/area-form').then((m) => m.AreaFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'areas/:id',
    loadComponent: () => import('./features/areas/area-detail').then((m) => m.AreaDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-users').then((m) => m.AdminUsersComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings-page').then((m) => m.SettingsPageComponent),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'books', pathMatch: 'full' },
];
