import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LocationListComponent } from './features/locations/location-list';
import { LocationFormComponent } from './features/locations/location-form';
import { BookListComponent } from './features/books/book-list';
import { BookFormComponent } from './features/books/book-form';
import { BookDetailComponent } from './features/books/book-detail';
import { BookBulkImportComponent } from './features/books/book-bulk-import';
import { TimelineListComponent } from './features/timeline/timeline-list';
import { AreaListComponent } from './features/areas/area-list';
import { AreaFormComponent } from './features/areas/area-form';
import { AreaDetailComponent } from './features/areas/area-detail';
import { AdminUsersComponent } from './features/admin/admin-users';
import { SettingsPageComponent } from './features/settings/settings-page';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'locations', component: LocationListComponent, canActivate: [authGuard] },
  { path: 'locations/new', component: LocationFormComponent, canActivate: [authGuard] },
  { path: 'locations/:id/edit', component: LocationFormComponent, canActivate: [authGuard] },
  { path: 'books', component: BookListComponent, canActivate: [authGuard] },
  { path: 'books/new', component: BookFormComponent, canActivate: [authGuard] },
  { path: 'books/import', component: BookBulkImportComponent, canActivate: [authGuard] },
  { path: 'books/:id', component: BookDetailComponent, canActivate: [authGuard] },
  { path: 'timeline', component: TimelineListComponent, canActivate: [authGuard] },
  { path: 'areas', component: AreaListComponent, canActivate: [authGuard] },
  { path: 'areas/new', component: AreaFormComponent, canActivate: [authGuard] },
  { path: 'areas/:id/edit', component: AreaFormComponent, canActivate: [authGuard] },
  { path: 'areas/:id', component: AreaDetailComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminUsersComponent, canActivate: [authGuard, adminGuard] },
  { path: 'settings', component: SettingsPageComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'books', pathMatch: 'full' },
];
