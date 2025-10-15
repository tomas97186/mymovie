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
  // {
  //   path: 'profile',
  //   loadComponent: () =>
  //     import('./pages/profile-page/profile-page.component').then(
  //       (m) => m.ProfilePageComponent
  //     ),
  //   canMatch: [authenticationGuard()],
  // },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/select-avatar-dialog/select-avatar-dialog.component').then(
        (m) => m.SelectAvatarDialogComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'community/:id',
    loadComponent: () =>
      import('./pages/profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings-page/settings-page.component').then(
        (m) => m.SettingsPageComponent
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
    loadComponent: () =>
      import('./pages/user-lists-page/user-lists-page.component').then(
        (m) => m.UserListsPageComponent
      ),
    canMatch: [authenticationGuard()],
  },
  {
    path: 'lists/:listId',
    loadComponent: () =>
      import('./pages/new-list-details/new-list-details.component').then(
        (m) => m.NewListDetailsComponent
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
    path: 'community',
    loadComponent: () => import('./pages/community-page/community-page.component').then(
      m => m.CommunityPageComponent
    )
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then(
        (m) => m.LoginPage
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup-page/signup-page.component').then(
        (m) => m.SignupPage
      ),
  },
  {
    path: 'password-reset',
    loadComponent: () =>
      import('./pages/password-reset-page/password-reset-page.component').then(
        (m) => m.PasswordResetPage
      ),
  },
  {
    path: 'email-verification',
    loadComponent: () =>
      import(
        './pages/email-verification-page/email-verification-page.component'
      ).then((m) => m.EmailVerificationPage),
  },
];
