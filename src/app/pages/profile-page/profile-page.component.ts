import { Component, DestroyRef, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import {
  AuthCredential,
  EmailAuthCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from '@angular/fire/auth';
import { catchError, filter, first, from, map, switchMap, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../components/generic-dialog/generic-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PasswordDialogComponent } from '../../components/password-dialog/password-dialog.component';
import { Router } from '@angular/router';
import { MovieListService } from '../../services/movie-list.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators } from '@angular/forms';
import { UsernameDialogComponent } from '../../components/username-dialog/username-dialog.component';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  movieListService = inject(MovieListService);
  userInfo$ = this.movieListService.getUserInfo();
  userListsCount$ = this.movieListService
    .getUserLists()
    .pipe(map((res) => res.length));

  changePassword(): void {
    const dialogRef = this.dialog.open(PasswordDialogComponent, {});
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((res) => {
        if (res && res.newPassword && res.newPassword.trim().length >= 8) {
          this.authService.currentUser$
            .pipe(
              filter((user) => !!user),
              first(),
              switchMap((user) =>
                from(
                  reauthenticateWithCredential(
                    user!,
                    EmailAuthProvider.credential(user!.email!, res.oldPassword)
                  )
                ).pipe(map(() => user!))
              ),
              switchMap((user) =>
                updatePassword(user!, res.newPassword.trim())
              ),
              tap(() =>
                this.snackBar.open(
                  'Password aggiornata con successo',
                  'Chiudi',
                  { duration: 3000 }
                )
              ),
              catchError((err) => {
                console.error('Error updating password:', err);
                this.snackBar.open(
                  "Errore nell'aggiornamento della password",
                  'Chiudi',
                  { duration: 3000 }
                );
                throw err;
              })
            )
            .subscribe();
        }
      });
  }

  changeName(currentUsername: string): void {
    const dialogRef = this.dialog.open(UsernameDialogComponent, {
      data: {
        value: currentUsername,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((name) => {
        if (
          name !== undefined &&
          name != currentUsername &&
          name.trim().length > 5
        ) {
          this.movieListService
            .setUsername(name.trim())
            .then(() => {
              this.authService.currentUser$.pipe(
                filter((user) => !!user),
                first(),
                tap((user) => updateProfile(user, { displayName: name.trim() }))
              );
              this.snackBar.open('Username modificato.', 'Chiudi');
            })
            .catch((e) => {
              console.log(e);
              this.snackBar.open('Username già esistente.', 'Chiudi', {
                duration: 3000,
              });
            });
        }
      });
  }

  signout() {
    this.authService.signOut().then(() => this.router.navigate(['/']));
  }
}
