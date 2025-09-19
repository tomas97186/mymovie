import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
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
  IonList,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { map } from 'rxjs';
import { UserListComponent } from 'src/app/components/user-list/user-list.component';
import { ToastService } from 'src/app/services/toast.service';
import { NewListDialogComponent } from '../../components/new-list-dialog/new-list-dialog.component';
import { UserListItemComponent } from '../../components/user-list-item/user-list-item.component';
import { MovieListService } from '../../services/movie-list.service';
import { NoListPageComponent } from '../no-list-page/no-list-page.component';

@Component({
  selector: 'app-user-lists-page',
  imports: [
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
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    NoListPageComponent,
    UserListItemComponent,
    IonList,
    UserListComponent,
    MatInputModule,
  ],
  templateUrl: './user-lists-page.component.html',
  styleUrl: './user-lists-page.component.scss',
})
export class UserListsPageComponent {
  private listService = inject(MovieListService);
  private dialog = inject(ModalController);
  private alertController = inject(AlertController);
  private snackBar = inject(ToastService);
  private router = inject(Router);
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

  joinList(listId: string) {
    if (listId) {
      this.listService
        .joinList(listId)
        .then((res) => {
          if (res) {
            this.snackBar.open('Sei stato aggiunto alla lista.', {
              duration: 3000,
            });
          } else {
            this.snackBar.open(
              'La lista non esiste o non puoi unirti.',

              {
                duration: 3000,
              }
            );
          }
        })
        .catch((error) => {
          this.snackBar.open("Errore nell'unirti alla lista.", {
            duration: 3000,
          });
        });
    } else {
      console.warn('No list ID provided to join');
    }
  }
  async openJoinDialog() {
    const alert = await this.alertController.create({
      header: 'Unisciti ad una lista',
      message: 'Inserisci il codice lista per accedere!',
      inputs: [
        {
          id: 'code',
          label: 'Codice Lista',
          placeholder: 'Codice Lista',
          name: 'code',
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
            if (!data.code) {
              this.snackBar.open('Inserisci il codice della lista.', {
                color: 'danger',
                duration: 3000,
              });
              return false;
            }
            return this.joinList(data.code);
          },
        },
      ],
    });

    await alert.present();
  }

  async openCreateDialog() {
    const alert = await this.alertController.create({
      header: 'Nuova Lista',
      inputs: [
        {
          id: 'name',
          label: 'Nome',
          placeholder: 'Nome',
          name: 'name',
          attributes: {
            maxLength: 25,
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
            if (data.name.length < 3) {
              this.snackBar.open(
                'Il nome della lista deve essere di almeno 3 caratteri.',
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

  async __createList(data: { name: string }) {
    if (data && data.name) {
      this.listService
        .createList(data.name, true)
        .then(() => {
          this.snackBar.open('Lista creata con successo.', {
            duration: 3000,
          });
        })
        .catch((error) => {
          console.error('Error creating the list:', error);
          this.snackBar.open(
            'Errore nella creazione della lista.',

            {
              duration: 3000,
            }
          );
        });
    }
  }
  async OLDopenCreateDialog() {
    const dialogRef = await this.dialog.create({
      component: NewListDialogComponent,
      initialBreakpoint: 0.25,
    });
    dialogRef.present();
    const { data } = await dialogRef.onWillDismiss();

    if (data) {
      this.listService
        .createList(data.name, true)
        .then(() => {
          this.snackBar.open('Lista creata con successo.', {
            duration: 3000,
          });
        })
        .catch((error) => {
          console.error('Error creating the list:', error);
          this.snackBar.open(
            'Errore nella creazione della lista.',

            {
              duration: 3000,
            }
          );
        });
    }
  }
}
