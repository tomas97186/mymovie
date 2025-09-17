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
import { IonButton, IonIcon, ModalController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-profile-page',
  imports: [IonIcon, IonButton, CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  readonly dialog = inject(ModalController);
  readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  movieListService = inject(MovieListService);
  userInfo$ = this.movieListService.getUserInfo();
  userListsCount$ = this.movieListService
    .getUserLists()
    .pipe(map((res) => res.length));

  async changePassword() {
    const dialogRef = await this.dialog.create({ component: PasswordDialogComponent, initialBreakpoint: .5, expandToScroll: false });

    dialogRef.present();
    const { data } = await dialogRef.onWillDismiss();

    if (data && data.newPassword && data.newPassword.trim().length >= 8) {
      this.authService.currentUser$
        .pipe(
          filter((user) => !!user),
          first(),
          switchMap((user) =>
            from(
              reauthenticateWithCredential(
                user!,
                EmailAuthProvider.credential(user!.email!, data.oldPassword)
              )
            ).pipe(map(() => user!))
          ),
          switchMap((user) =>
            updatePassword(user!, data.newPassword.trim())
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
  }

  async changeName(currentUsername: string) {
    const dialogRef = await this.dialog.create({ component: UsernameDialogComponent, componentProps: { currentUsername }, initialBreakpoint: .20, expandToScroll: false });
    dialogRef.present();
    const { data } = await dialogRef.onWillDismiss();
    if (
      data !== undefined &&
      data != currentUsername &&
      data.trim().length > 5
    ) {
      this.movieListService
        .setUsername(data.trim())
        .then(() => {
          this.authService.currentUser$.pipe(
            filter((user) => !!user),
            first(),
            tap((user) => updateProfile(user, { displayName: data.trim() }))
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
  }

  signout() {
    this.authService.signOut().then(() => this.router.navigate(['/']));
  }
}
