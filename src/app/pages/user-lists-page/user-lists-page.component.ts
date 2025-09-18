import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { ToastService } from 'src/app/services/toast.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { first, map } from 'rxjs';
import { JoinListDialogComponent } from '../../components/join-list-dialog/join-list-dialog.component';
import { NewListDialogComponent } from '../../components/new-list-dialog/new-list-dialog.component';
import { UserListItemComponent } from "../../components/user-list-item/user-list-item.component";
import { MovieListService } from '../../services/movie-list.service';
import { NoListPageComponent } from '../no-list-page/no-list-page.component';
import { ModalController, IonFab, IonFabButton, IonIcon, IonFabList, IonButton, IonTitle, IonHeader, IonToolbar, IonContent, IonList } from "@ionic/angular/standalone";
import { UserListComponent } from "src/app/components/user-list/user-list.component";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-user-lists-page',
  imports: [IonContent, IonToolbar, IonHeader, IonTitle, IonButton, IonFabList, IonIcon, IonFabButton, IonFab,
    CommonModule,
    RouterModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    NoListPageComponent,
    UserListItemComponent, IonList, UserListComponent, MatInputModule],
  templateUrl: './user-lists-page.component.html',
  styleUrl: './user-lists-page.component.scss',
})
export class UserListsPageComponent {
  private listService = inject(MovieListService);
  private dialog = inject(ModalController);
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
    const dialogRef = await this.dialog.create({ component: JoinListDialogComponent, initialBreakpoint: .25 });
    dialogRef.present();
    const { data } = await dialogRef.onWillDismiss();

    if (data && data.username) {
      this.joinList(data.username);
    }
  }

  async openCreateDialog() {
    const dialogRef = await this.dialog.create({ component: NewListDialogComponent, initialBreakpoint: .25 });
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
