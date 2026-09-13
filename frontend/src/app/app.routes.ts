import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LocationListComponent } from './features/locations/location-list';
import { LocationFormComponent } from './features/locations/location-form';
import { BookListComponent } from './features/books/book-list';
import { BookFormComponent } from './features/books/book-form';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'locations', component: LocationListComponent },
  { path: 'locations/new', component: LocationFormComponent },
  { path: 'books', component: BookListComponent },
  { path: 'books/new', component: BookFormComponent },
  { path: '', redirectTo: 'books', pathMatch: 'full' },
];
