import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { authenticationGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'search',
    component: SearchPageComponent,
    canMatch: [authenticationGuard()],
  },
  {
    path: 'search/:type/:id',
    component: SearchPageComponent,
    canMatch: [authenticationGuard()],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'no-list',
    loadComponent: () =>
      import('./pages/no-list-page/no-list-page.component').then(
        (m) => m.NoListPageComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'lists',
    loadComponent: () => import('./pages/user-lists-page/user-lists-page.component').then(m => m.UserListsPageComponent),
    canMatch: [authenticationGuard()]
  },
  {
    path: 'lists/:listId',
    loadComponent: () =>
      import('./pages/list-details/list-details.component').then(
        (m) => m.ListDetailsComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'collection/:media/:type',
    loadComponent: () =>
      import('./pages/collection-page/collection-page.component').then(
        (m) => m.CollectionPageComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'discovery/:media',
    loadComponent: () =>
      import('./pages/discover-page/discover-page.component').then(
        (m) => m.DiscoverPageComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'movies/:id',
    loadComponent: () =>
      import('./pages/movie-details/movie-details.component').then(
        (m) => m.MovieDetailsComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then(
        (m) => m.LoginPage
      ),
  },
];
