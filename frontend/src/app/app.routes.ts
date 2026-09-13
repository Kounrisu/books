import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LocationListComponent } from './features/locations/location-list';
import { LocationFormComponent } from './features/locations/location-form';
import { BookListComponent } from './features/books/book-list';
import { BookFormComponent } from './features/books/book-form';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'locations', component: LocationListComponent, canActivate: [authGuard] },
  { path: 'locations/new', component: LocationFormComponent, canActivate: [authGuard] },
  { path: 'books', component: BookListComponent, canActivate: [authGuard] },
  { path: 'books/new', component: BookFormComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'books', pathMatch: 'full' },
];
