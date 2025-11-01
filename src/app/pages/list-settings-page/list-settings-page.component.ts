import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle, IonToggle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembershipEnum } from 'src/app/enum/membership.enum';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { UserDataService } from 'src/app/services/userdata.service';
import { BUTTONS } from 'src/app/variables';
import { InfoListModel } from '../../models/movie-list.model';
import { AuthService } from '../../services/auth.service';
import { MovieListService } from '../../services/movie-list.service';

@Component({
  selector: 'app-list-page-settings',
  imports: [IonNote, IonToggle,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    TranslateModule,
    IonLabel,
    IonItem,
    IonList,
    IonIcon,
    IonButton,
    CommonModule,
    ClipboardModule,
  ],
  templateUrl: './list-settings-page.component.html',
  styleUrl: './list-settings-page.component.scss',
})
export class ListSettingsPageComponent {
  authService = inject(AuthService);
  snackBar = inject(ToastService);
  private translate = inject(TranslateService);
  private dialog = inject(ModalController);
  private alertController = inject(AlertController);
  private readonly MESSAGE_LABELS = 'pages.listDetails.settings.messages.';
  private readonly DIALOGS_LABELS = 'pages.listDetails.settings.dialogs.';
  router = inject(Router);
  listService = inject(MovieListService);
  userService = inject(UserService);
  userDataService = inject(UserDataService);
  details = input.required<InfoListModel>();
  members = computed(() => this.listService.getListMembers(this.details().id));
  inviteUser = input<() => void>();
  shareList = input<() => void>();
  MembershipEnum = MembershipEnum;

  updateListNameFn = output<void>();

  closeSettings() {
    this.dialog.dismiss();
  }

  copyToClipboardNotification() {
    this.snackBar.open(
      this.translate.instant(this.MESSAGE_LABELS + 'copiaCodice'),
      {
        duration: 3000,
      }
    );
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
          text: this.translate.instant('shared.buttons.conferma'),
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
        this.dialog.dismiss();
        this.router.navigate(['/lists'], { queryParamsHandling: 'replace' });
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

  async removeUser(uid: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOGS_LABELS + 'rimuovi.header', {
        username: this.userDataService.getUsername(uid),
      }),
      message: this.translate.instant(this.DIALOGS_LABELS + 'rimuovi.message', {
        username: this.userDataService.getUsername(uid),
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
          handler: () => this.__removeUser(uid),
        },
      ],
    });

    await alert.present();
  }

  private __removeUser(uid: string) {
    this.listService
      .removeUser(this.details().id, uid)
      .then(() =>
        this.snackBar.open(
          this.translate.instant(
            this.MESSAGE_LABELS + 'rimuoviUtente.successo',
            { username: this.userDataService.getUsername(uid) }
          )
        )
      )
      .catch((err) => {
        console.error(
          "Errore! Non è stato possibile rimuovere l'utente " +
          this.userDataService.getUsername(uid) +
          '.'
        );
        this.snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'rimuoviUtente.errore', {
            username: this.userDataService.getUsername(uid),
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
        this.dialog.dismiss();
        this.router.navigate(['/lists'], { queryParamsHandling: 'replace' });
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
