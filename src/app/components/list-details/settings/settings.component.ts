import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonNote, ModalController } from "@ionic/angular/standalone";
import { Observable } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { InfoListModel } from '../../../models/movie-list.model';
import { UserModel } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { MovieListService } from '../../../services/movie-list.service';
import { InviteUserDialogComponent } from '../../invite-user-dialog/invite-user-dialog.component';

@Component({
  selector: 'app-list-page-settings',
  imports: [IonNote, IonLabel, IonItem, IonList, IonIcon, IonButton,
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    ClipboardModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  authService = inject(AuthService);
  snackBar = inject(ToastService);
  private dialog = inject(ModalController)
  router = inject(Router);
  listService = inject(MovieListService);
  details = input.required<InfoListModel>();
  members = input.required<Observable<UserModel | undefined>[]>();

  exitListFn = output<void>();
  updateListNameFn = output<void>();

  copyToClipboardNotification() {
    this.snackBar.open('Codice della lista copiato negli appunti!', {
      duration: 3000,
    });
  }

  async openInviteUserDialog() {
    const dialogRef = await this.dialog.create({ component: InviteUserDialogComponent, initialBreakpoint: .20, expandToScroll: false });
    dialogRef.present();
    const { data } = await dialogRef.onWillDismiss();
    if (data !== undefined) {
      this.listService
        .inviteToList(this.details().id!, data)
        .then((res) => {
          if (!res) {
            this.snackBar.open(`L'utente ${data} non  esiste oppure è già in lista.`, {
              duration: 3000,
            })
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

  deleteList() {
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   data: {
    //     title: 'Conferma Eliminazione',
    //     body: "Sei sicuro di voler eliminare la lista?\nNessun membro potrà più accedervi dopo l'eliminazione",
    //   },
    // });

    // dialogRef
    //   .afterClosed()
    //   .pipe(first())
    //   .subscribe((result) => {
    //     if (result) {
    //       this.listService
    //         .deleteList(this.details().id)
    //         .then(() => {
    //           this.snackBar.open(' Lista eliminata con successo.', {
    //             duration: 3000,
    //           });
    //           this.router.navigate(['/lists']);
    //         })
    //         .catch((error) => {
    //           console.error('Error delete list:', error);
    //           this.snackBar.open(
    //             "Errore nell'eliminazione della lista.",
    //            
    //             {
    //               duration: 3000,
    //             }
    //           );
    //         });
    //     }
    //   });
  }
}
