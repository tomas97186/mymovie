import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { first, map, tap } from 'rxjs';
import { GenericDialogComponent } from '../../components/generic-dialog/generic-dialog.component';
import { NewListDialogComponent } from '../../components/new-list-dialog/new-list-dialog.component';
import { MovieListService } from '../../services/movie-list.service';
import { NoListPageComponent } from '../no-list-page/no-list-page.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFabMenuComponent } from '../../components/mat-fab-menu/mat-fab-menu.component';
import { JoinListDialogComponent } from '../../components/join-list-dialog/join-list-dialog.component';
import { UserListItemComponent } from "../../components/user-list-item/user-list-item.component";

@Component({
  selector: 'app-user-lists-page',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    NoListPageComponent,
    MatFabMenuComponent,
    UserListItemComponent
],
  templateUrl: './user-lists-page.component.html',
  styleUrl: './user-lists-page.component.scss',
})
export class UserListsPageComponent {
  private listService = inject(MovieListService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
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
            this.snackBar.open('Sei stato aggiunto alla lista.', 'Chiudi', {
              duration: 3000,
            });
          } else {
            this.snackBar.open(
              'La lista non esiste o non puoi unirti.',
              'Chiudi',
              {
                duration: 3000,
              }
            );
          }
        })
        .catch((error) => {
          this.snackBar.open("Errore nell'unirti alla lista.", 'Chiudi', {
            duration: 3000,
          });
        });
    } else {
      console.warn('No list ID provided to join');
    }
  }
  openJoinDialog(): void {
    const dialogRef = this.dialog.open(JoinListDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((result) => {
        if (result !== undefined) {
          this.joinList(result);
        }
      });
  }
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(NewListDialogComponent, {});

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((result) => {
        if (result !== undefined) {
          this.listService
            .createList(result.name, result.private)
            .then(() => {
              this.snackBar.open('Lista creata con successo.', 'Chiudi', {
                duration: 3000,
              });
            })
            .catch((error) => {
              console.error('Error creating the list:', error);
              this.snackBar.open(
                'Errore nella creazione della lista.',
                'Chiudi',
                {
                  duration: 3000,
                }
              );
            });
        }
      });
  }
}
