import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LocationListComponent } from './features/locations/location-list';
import { LocationFormComponent } from './features/locations/location-form';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'locations', component: LocationListComponent },
  { path: 'locations/new', component: LocationFormComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
