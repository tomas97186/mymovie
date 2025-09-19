import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonAlert,
  IonAvatar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  ModalController,
} from '@ionic/angular/standalone';
import { map } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { InfoListModel } from '../../../models/movie-list.model';
import { AuthService } from '../../../services/auth.service';
import { MovieListService } from '../../../services/movie-list.service';
import { InviteUserDialogComponent } from '../../invite-user-dialog/invite-user-dialog.component';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'app-list-page-settings',
  imports: [
    IonAlert,
    IonAvatar,
    IonNote,
    IonLabel,
    IonItem,
    IonList,
    IonIcon,
    IonButton,
    CommonModule,
    ClipboardModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  authService = inject(AuthService);
  snackBar = inject(ToastService);
  private dialog = inject(ModalController);
  private alertController = inject(AlertController);
  router = inject(Router);
  listService = inject(MovieListService);
  details = input.required<InfoListModel>();
  _members = input.required<{ [key: string]: boolean }>({ alias: 'members' });
  members = computed(() => {
    const membersMap = this._members();
    return !membersMap
      ? undefined
      : Object.keys(membersMap).map((key) =>
          this.listService
            .getUserInfo(key)
            .pipe(map((res) => ({ ...res, invited: !membersMap[key] })))
        );
  });

  exitListFn = output<void>();
  updateListNameFn = output<void>();

  copyToClipboardNotification() {
    this.snackBar.open('Codice della lista copiato negli appunti!', {
      duration: 3000,
    });
  }

  async openInviteUserDialog() {
    const alert = await this.alertController.create({
      header: 'Invita utente',
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
          handler: this.__inviteUser.bind(this),
        },
      ],
    });

    await alert.present();
  }

  async OLDopenInviteUserDialog() {
    const dialogRef = await this.dialog.create({
      component: InviteUserDialogComponent,
      initialBreakpoint: 0.2,
      expandToScroll: false,
    });
    dialogRef.present();
    const { data } = await dialogRef.onWillDismiss();
    if (data !== undefined) {
      this.listService
        .inviteToList(this.details().id!, data)
        .then((res) => {
          if (!res) {
            this.snackBar.open(
              `L'utente ${data} non  esiste oppure è già in lista.`,
              {
                duration: 3000,
              }
            );
          } else {
            this.snackBar.open('Invito inviato con successo.', {
              duration: 3000,
            });
          }
        })
        .catch((error) => {
          console.error('Error invite:', error);
          this.snackBar.open("Errore nell'invio dell'invito.", {
            duration: 3000,
          });
        });
    }
  }

  private __inviteUser(data: { username: string }) {
    if (data && data.username) {
      this.listService
        .inviteToList(this.details().id!, data.username)
        .then((res) => {
          if (!res) {
            this.snackBar.open(
              `L'utente ${data} non  esiste oppure è già in lista.`,
              {
                duration: 3000,
              }
            );
          } else {
            this.snackBar.open('Invito inviato con successo.', {
              duration: 3000,
            });
          }
        })
        .catch((error) => {
          console.error('Error invite:', error);
          this.snackBar.open("Errore nell'invio dell'invito.", {
            duration: 3000,
          });
        });
    }
  }

  async removeUser(uid: string, username: string) {
    const alert = await this.alertController.create({
      header: 'Rimuovi ' + username,
      message:
        'Confermi di voler rimuovere ' +
        username +
        " dalla lista?\nL'utente non potrà visualizzare e modificare la lista di film.",
      buttons: [
        'Annulla',
        {
          text: 'Conferma',
          role: 'confirm',
          handler: () => this.__removeUser(username, uid),
        },
      ],
    });

    await alert.present();
  }

  private __removeUser(username: string, uid: string) {
    this.listService
      .removeUser(this.details().id, uid)
      .then(() =>
        this.snackBar.open('Utente ' + username + ' rimosso dalla lista.')
      )
      .catch((err) => {
        console.error(
          "Errore! Non è stato possibile rimuovere l'utente " + username + '.'
        );
        this.snackBar.open(
          "Errore! Non è stato possibile rimuovere l'utente " + username + '.'
        );
      });
  }

  async deleteList() {
    const alert = await this.alertController.create({
      header: 'Conferma Eliminazione',
      message:
        "Sei sicuro di voler eliminare la lista?\nNessun membro potrà più accedervi dopo l'eliminazione",
      buttons: [
        'Annulla',
        {
          text: 'Conferma',
          role: 'confirm',
          handler: () => this.__deleteList(),
        },
      ],
    });

    await alert.present();
  }

  private __deleteList() {
    this.listService
      .deleteList(this.details().id)
      .then(() => {
        this.snackBar.open(' Lista eliminata con successo.', {
          duration: 3000,
        });
        this.router.navigate(['/lists']);
      })
      .catch((error) => {
        console.error('Error delete list:', error);
        this.snackBar.open(
          "Errore nell'eliminazione della lista.",

          {
            duration: 3000,
          }
        );
      });
  }
}
