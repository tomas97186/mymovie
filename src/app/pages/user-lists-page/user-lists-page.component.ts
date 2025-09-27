import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { UserListComponent } from 'src/app/components/user-list/user-list.component';
import { ToastService } from 'src/app/services/toast.service';
import { BUTTONS, INPUTS } from 'src/app/variables';
import { fieldValidations } from 'src/environments/fields.validation';
import { MovieListService } from '../../services/movie-list.service';
import { NoListPageComponent } from '../no-list-page/no-list-page.component';

@Component({
  selector: 'app-user-lists-page',
  imports: [
    TranslateModule,
    IonButtons,
    IonContent,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonButton,
    IonFabList,
    IonIcon,
    IonFabButton,
    IonFab,
    CommonModule,
    RouterModule,
    NoListPageComponent,
    UserListComponent,
  ],
  templateUrl: './user-lists-page.component.html',
  styleUrl: './user-lists-page.component.scss',
})
export class UserListsPageComponent {
  @ViewChild(IonFab) fab?: IonFab;

  private readonly MESSAGE_LABELS = 'pages.userLists.messages.';
  private readonly DIALOG_LABELS = 'pages.userLists.dialogs.';

  private translate = inject(TranslateService);
  private listService = inject(MovieListService);
  private alertController = inject(AlertController);
  private snackBar = inject(ToastService);
  userLists$ = this.listService
    .getUserLists()
    .pipe(
      map((listId) => listId.map((id) => this.listService.getListInfo(id)))
    );
  userInvitations$ = this.listService
    .getListInvitations()
    .pipe(
      map((listId) => listId.map((id) => this.listService.getListInfo(id)))
    );

  async openJoinDialog(currentListsCount: number) {
    if(this.fab) {
      this.fab.close();
    }
    if (!this.__canAddList(currentListsCount)) {
      this.snackBar.open(
        this.translate.instant(this.MESSAGE_LABELS + 'unisciti.errore.maxList', {
          maxLists: fieldValidations.maxListsPerUser,
        }), { color: 'danger', duration: 3000 });
      return;
    }
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOG_LABELS + 'unisciti.header'),
      message: this.translate.instant(this.DIALOG_LABELS + 'unisciti.message'),
      inputs: [
        {
          id: 'code',
          label: this.translate.instant(INPUTS.CODICE),
          placeholder: this.translate.instant(INPUTS.CODICE),
          name: 'code',
          attributes: {
            maxLength: 30,
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
            if (!data.code) {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'errore.obbligatorio'
                ),
                {
                  color: 'danger',
                  duration: 3000,
                }
              );
              return false;
            }
            return this.__joinList(data.code);
          },
        },
      ],
    });

    await alert.present();
  }


  private __joinList(listId: string) {
    if (listId) {
      this.listService
        .joinList(listId)
        .then((res) => {
          if (res) {
            this.snackBar.open(
              this.translate.instant(this.MESSAGE_LABELS + 'unisciti.successo'),
              {
                duration: 3000,
              }
            );
          } else {
            this.snackBar.open(
              this.translate.instant(
                this.MESSAGE_LABELS + 'unisciti.errore.generico'
              ),
              {
                duration: 3000,
              }
            );
          }
        })
        .catch((error) => {
          this.snackBar.open(
            this.translate.instant(
              this.MESSAGE_LABELS + 'unisciti.errore.generico'
            ),
            {
              duration: 3000,
            }
          );
        });
    } else {
      console.warn('No list ID provided to join');
    }
  }

  async openCreateDialog(currentListsCount: number) {
    if(this.fab) {
      this.fab.close();
    }
    if (!this.__canAddList(currentListsCount)) {
      this.snackBar.open(
        this.translate.instant(this.MESSAGE_LABELS + 'crea.errore.maxList', {
          maxLists: fieldValidations.maxListsPerUser,
        }), { color: 'danger', duration: 3000 });
      return;
    }
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOG_LABELS + 'crea.header'),
      inputs: [
        {
          id: 'name',
          label: this.translate.instant(INPUTS.NOME),
          placeholder: this.translate.instant(INPUTS.NOME),
          name: 'name',
          attributes: {
            maxLength: 25,
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
            if (data.name.length < 3) {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'crea.errore.minLength',
                  { minLength: fieldValidations.listName.minLength }
                ),
                { color: 'danger', duration: 3000 }
              );
              return false;
            } else {
              return this.__createList(data);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private __canAddList(currentListsCount: number) {
    return currentListsCount < fieldValidations.maxListsPerUser;
  }

  async __createList(data: { name: string }) {
    if (data && data.name) {
      this.listService
        .createList(data.name, true)
        .then(() => {
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'crea.successo'),
            {
              duration: 3000,
            }
          );
        })
        .catch((error) => {
          console.error('Error creating the list:', error);
          this.snackBar.open(
            this.translate.instant(
              this.MESSAGE_LABELS + 'crea.errore.generico'
            ),

            {
              duration: 3000,
            }
          );
        });
    }
  }
}
