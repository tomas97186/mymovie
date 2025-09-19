import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile
} from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { catchError, filter, first, from, map, switchMap, tap } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { PasswordDialogComponent } from '../../components/password-dialog/password-dialog.component';
import { UsernameDialogComponent } from '../../components/username-dialog/username-dialog.component';
import { AuthService } from '../../services/auth.service';
import { MovieListService } from '../../services/movie-list.service';

@Component({
  selector: 'app-profile-page',
  imports: [
    IonLabel,
    IonItem,
    IonList,
    IonButtons,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonIcon,
    IonButton,
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  readonly dialog = inject(ModalController);
  readonly alertController = inject(AlertController);
  readonly router = inject(Router);
  private readonly snackBar = inject(ToastService);
  authService = inject(AuthService);
  movieListService = inject(MovieListService);
  userInfo$ = this.movieListService.getUserInfo();
  userListsCount$ = this.movieListService
    .getUserLists()
    .pipe(map((res) => res.length));

  async changeName(oldUsername: string) {
    const alert = await this.alertController.create({
      header: 'Modifica username',
      inputs: [
        {
          id: 'username',
          label: 'Username',
          placeholder: 'Username',
          name: 'username',
          attributes: {
            maxLength: 15,
            minLength: 5,
          },
        },
      ],
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Conferma',
          role: 'confirm',
          handler: (data) => {
            if (data.username.length < 3) {
              this.snackBar.open(
                'Lo username deve essere di almeno 3 caratteri.',
                { color: 'danger', duration: 3000 }
              );
              return false;
            }
            if (!/^[A-Za-z0-9_]+$/.test(data.username)) {
              this.snackBar.open(
                'Lo username può contenere solo il simbolo _',
                { color: 'danger', duration: 3000 }
              );
              return false;
            } else {
              return this.__changeUsername(data);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Modifica password',
      message:
        'La password deve contenere almeno:\nUna lettera minuscola.\nUna lettera maiuscola\nUn numero\nUn simbolo (es. ! &#64; # $ % ^ & *)',
      inputs: [
        {
          id: 'oldPassword',
          label: 'Password Attuale',
          placeholder: 'Password Attuale',
          type: 'password',
          name: 'oldPassword',
        },
        {
          id: 'newPassword',
          type: 'password',
          label: 'Nuova Password',
          placeholder: 'Nuova Password',
          name: 'newPassword',
        },
        {
          id: 'repeatPassword',
          type: 'password',
          label: 'Ripeti la Password',
          placeholder: 'Ripeti la Password',
          name: 'repeatPassword',
        },
      ],
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Conferma',
          role: 'confirm',
          handler: (data) => {
            if (data.newPassword != data.repeatPassword) {
              this.snackBar.open('Le password inserite non coincidono.', {
                color: 'danger',
                duration: 3000,
              });
              return false;
            }
            if (data.newPassword.length < 8) {
              this.snackBar.open(
                'La password deve contenere almeno 8 caratteri.',
                { color: 'danger', duration: 3000 }
              );
              return false;
            }
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(data.newPassword)) {
              this.snackBar.open(
                'La nuova password non rispetta i criteri di sicurezza.',
                { color: 'danger', duration: 3000 }
              );
              return false;
            } else {
              return this.__changePassword(data);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async oldChangePassword() {
    const dialogRef = await this.dialog.create({
      component: PasswordDialogComponent,
      initialBreakpoint: 0.5,
      expandToScroll: false,
    });

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
          switchMap((user) => updatePassword(user!, data.newPassword.trim())),
          tap(() =>
            this.snackBar.open(
              'Password aggiornata con successo',

              { duration: 3000 }
            )
          ),
          catchError((err) => {
            console.error('Error updating password:', err);
            this.snackBar.open(
              "Errore nell'aggiornamento della password",

              { duration: 3000 }
            );
            throw err;
          })
        )
        .subscribe();
    }
  }

  async oldChangeName(currentUsername: string) {
    const dialogRef = await this.dialog.create({
      component: UsernameDialogComponent,
      componentProps: { currentUsername },
      initialBreakpoint: 0.2,
      expandToScroll: false,
    });
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
          this.snackBar.open('Username modificato.');
        })
        .catch((e) => {
          console.log(e);
          this.snackBar.open('Username già esistente.', {
            duration: 3000,
          });
        });
    }
  }

  private __changeUsername(data: { username: string }) {
    console.log('Change username');
    if (data.username !== undefined) {
      this.movieListService
        .setUsername(data.username.trim())
        .then(() => {
          this.authService.currentUser$.pipe(
            filter((user) => !!user),
            first(),
            tap((user) =>
              updateProfile(user, { displayName: data.username.trim() })
            )
          );
          this.snackBar.open('Username modificato.');
        })
        .catch((e) => {
          console.log(e);
          this.snackBar.open('Username già esistente.', {
            duration: 3000,
          });
        });
    }
  }
  private __changePassword(data: { oldPassword: string; newPassword: string }) {
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
          switchMap((user) => updatePassword(user!, data.newPassword.trim())),
          tap(() =>
            this.snackBar.open(
              'Password aggiornata con successo',

              { duration: 3000 }
            )
          ),
          catchError((err) => {
            console.error('Error updating password:', err);
            this.snackBar.open(
              "Errore nell'aggiornamento della password",

              { duration: 3000 }
            );
            throw err;
          })
        )
        .subscribe();
    }
  }

  signout() {
    this.authService.signOut().then(() => this.router.navigate(['/']));
  }
}
