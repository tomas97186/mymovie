import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { Share } from '@capacitor/share';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BUTTONS } from 'src/app/variables';

@Component({
  selector: 'app-list-page-settings',
  imports: [
    TranslateModule,
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
  private translate = inject(TranslateService);
  private dialog = inject(ModalController);
  private alertController = inject(AlertController);
  private readonly MESSAGE_LABELS = 'pages.listDetails.settings.messages.';
  private readonly DIALOGS_LABELS = 'pages.listDetails.settings.dialogs.';
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

  updateListNameFn = output<void>();

  copyToClipboardNotification() {
    this.snackBar.open(
      this.translate.instant(this.MESSAGE_LABELS + 'copiaCodice'),
      {
        duration: 3000,
      }
    );
  }

  async shareListCode(listId: string) {
    if ((await Share.canShare()).value) {
      // Share text only
      await Share.share({
        text: this.translate.instant(
          this.MESSAGE_LABELS + 'condividi.messaggio',
          {
            listId,
          }
        ),
      });
    } else {
      this.snackBar.open(
        this.translate.instant(this.MESSAGE_LABELS + 'condivi.errore')
      );
    }
  }

  async exitList() {
    const alert = await this.alertController.create({
      header: this.translate.instant(
        this.DIALOGS_LABELS + 'lasciaLista.header'
      ),
      message: this.translate.instant(
        this.DIALOGS_LABELS + 'lasciaLista.message'
      ),
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant('shared.button.conferma'),
          role: 'confirm',
          handler: () => this.__exitList(),
        },
      ],
    });

    await alert.present();
  }

  private __exitList() {
    const listId = this.details().id;
    if (listId) {
      this.listService.exitList(listId).then(() => {
        this.router.navigate(['/lists']);
        this.snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'exitList'),
          {
            duration: 3000,
          }
        );
      });
    } else {
      console.error('No list ID found in the route parameters');
    }
  }

  async openInviteUserDialog() {
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOGS_LABELS + 'invita.header'),
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
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
          role: 'confirm',
          handler: this.__inviteUser.bind(this),
        },
      ],
    });

    await alert.present();
  }

  private __inviteUser(data: { username: string }) {
    if (data && data.username) {
      this.listService
        .inviteToList(this.details().id!, data.username)
        .then((res) => {
          if (!res) {
            this.snackBar.open(
              this.translate.instant(this.MESSAGE_LABELS + 'invito.nonEsiste', {
                username: data.username,
              }),
              {
                duration: 3000,
              }
            );
          } else {
            this.snackBar.open(
              this.translate.instant(this.MESSAGE_LABELS + 'invito.successo'),
              {
                duration: 3000,
              }
            );
          }
        })
        .catch((error) => {
          console.error('Error invite:', error);
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'errore'),
            {
              duration: 3000,
            }
          );
        });
    }
  }

  async removeUser(uid: string, username: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOGS_LABELS + 'rimuovi.header', {
        username,
      }),
      message: this.translate.instant(this.DIALOGS_LABELS + 'rimuovi.message', {
        username,
      }),
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
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
        this.snackBar.open(
          this.translate.instant(
            this.MESSAGE_LABELS + 'rimuoviUtente.successo',
            { username }
          )
        )
      )
      .catch((err) => {
        console.error(
          "Errore! Non è stato possibile rimuovere l'utente " + username + '.'
        );
        this.snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'rimuoviUtente.errore', {
            username,
          })
        );
      });
  }

  async deleteList() {
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOGS_LABELS + 'elimina.header'),
      message: this.translate.instant(this.DIALOGS_LABELS + 'elimina.message'),
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
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
        this.snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'eliminaLista.successo'),
          {
            duration: 3000,
          }
        );
        this.router.navigate(['/lists']);
      })
      .catch((error) => {
        console.error('Error delete list:', error);
        this.snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'eliminaLista.errore'),
          {
            duration: 3000,
          }
        );
      });
  }
}
