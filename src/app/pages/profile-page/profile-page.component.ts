import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSegmentView,
  IonSegmentContent,
  ModalController, IonLabel, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, filter, first, from, map, switchMap, tap } from 'rxjs';
import { MovieListComponent } from 'src/app/components/movie-list/movie-list.component';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { BUTTONS } from 'src/app/variables';
import { fieldValidations } from 'src/environments/fields.validation';
import { AuthService } from '../../services/auth.service';
import { MovieListService } from '../../services/movie-list.service';

@Component({
  selector: 'app-profile-page',
  imports: [IonFabButton, IonFab, IonLabel, 
    IonSegmentButton,
    IonSegment,
    CommonModule,
    TranslateModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonSegmentView,
    IonSegmentContent,
    MovieListComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  private readonly MESSAGE_LABELS = 'pages.profile.messages.';
  private readonly DIALOG_LABELS = 'pages.profile.dialogs.';

  private readonly translate = inject(TranslateService);
  readonly dialog = inject(ModalController);
  readonly alertController = inject(AlertController);
  readonly router = inject(Router);
  private readonly snackBar = inject(ToastService);
  authService = inject(AuthService);
  userService = inject(UserService);
  listService = inject(MovieListService);
  userInfo$ = this.userService.getUserInfo();
  userLikes = this.listService.getUserReviews(undefined, true);
  userDislikes = this.listService.getUserReviews(undefined, false);

  async changeName(uid: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOG_LABELS + 'username.header'),
      inputs: [
        {
          id: 'username',
          label: this.translate.instant('shared.inputs.username'),
          placeholder: this.translate.instant('shared.inputs.username'),
          name: 'username',
          attributes: {
            maxLength: fieldValidations.username.maxLength,
          },
        },
      ],
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
          role: 'confirm',
          handler: (data) => {
            if (data.username.length < fieldValidations.username.minLength) {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'username.errore.minLength',
                  { minLength: fieldValidations.username.minLength }
                ),
                { color: 'danger', duration: 3000 }
              );
              return false;
            }
            // if (!/^[A-Za-z0-9_]+$/.test(data.username)) {
            //   this.snackBar.open(
            //     this.translate.instant(
            //       this.MESSAGE_LABELS + 'username.errore.simbolo'
            //     ),
            //     { color: 'danger', duration: 3000 }
            //   );
            //   return false;
            // }
            //  else {
            return this.__changeUsername(data, uid);
            // }
          },
        },
      ],
    });

    await alert.present();
  }

  scrollToTop() {
    const element = document.querySelector('.container');
    element?.scroll({ top: 0, behavior: 'smooth' });
  }
  
  async changePassword() {
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOG_LABELS + 'password.header'),
      message: this.translate.instant(this.DIALOG_LABELS + 'password.message'),
      inputs: [
        {
          id: 'oldPassword',
          label: this.translate.instant(
            this.DIALOG_LABELS + 'password.inputs.passwordAttuale'
          ),
          placeholder: this.translate.instant(
            this.DIALOG_LABELS + 'password.inputs.passwordAttuale'
          ),
          type: 'password',
          name: 'oldPassword',
        },
        {
          id: 'newPassword',
          type: 'password',
          label: this.translate.instant(
            this.DIALOG_LABELS + 'password.inputs.nuovaPassword'
          ),
          placeholder: this.translate.instant(
            this.DIALOG_LABELS + 'password.inputs.nuovaPassword'
          ),
          name: 'newPassword',
        },
        {
          id: 'repeatPassword',
          type: 'password',
          label: this.translate.instant(
            this.DIALOG_LABELS + 'password.inputs.ripetiPassword'
          ),
          placeholder: this.translate.instant(
            this.DIALOG_LABELS + 'password.inputs.ripetiPassword'
          ),
          name: 'repeatPassword',
        },
      ],
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
          role: 'confirm',
          handler: (data) => {
            if (data.newPassword != data.repeatPassword) {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'password.errore.nonCoincide'
                ),
                {
                  color: 'danger',
                  duration: 3000,
                }
              );
              return false;
            }
            if (data.newPassword.length < fieldValidations.password.minLength) {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'password.errore.minLength',
                  { minLength: fieldValidations.password.minLength }
                ),
                { color: 'danger', duration: 3000 }
              );
              return false;
            }
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(data.newPassword)) {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'password.errore.criteriSicurezza'
                ),
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

  private __changeUsername(data: { username: string }, uid: string) {
    console.log('Change username: ', data.username, ' for user: ', uid);
    if (data.username !== undefined) {
      this.userService
        .setUsername(data.username.trim(), uid)
        .then(() => {
          this.authService.currentUser$.pipe(
            filter((user) => !!user),
            first(),
            tap((user) =>
              updateProfile(user, { displayName: data.username.trim() })
            )
          );
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'username.successo')
          );
        })
        .catch((e) => {
          console.log(e);
          this.snackBar.open(
            this.translate.instant(
              this.MESSAGE_LABELS + 'username.errore.generico'
            ),
            {
              duration: 3000,
            }
          );
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
              this.translate.instant(this.MESSAGE_LABELS + 'password.successo'),
              { duration: 3000 }
            )
          ),
          catchError((err) => {
            console.error('Error updating password:', err);
            this.snackBar.open(
              this.translate.instant(
                this.MESSAGE_LABELS + 'password.errore.generico'
              ),
              { duration: 3000 }
            );
            throw err;
          })
        )
        .subscribe();
    }
  }
}
