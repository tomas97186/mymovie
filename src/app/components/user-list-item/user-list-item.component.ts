import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { InfoListModel } from '../../models/movie-list.model';
import { MatButtonModule } from '@angular/material/button';
import { MovieListService } from '../../services/movie-list.service';
import { ToastService } from 'src/app/services/toast.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { Share } from '@capacitor/share';
import {
  IonIcon,
  IonButton,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-user-list-item',
  imports: [
    IonNote,
    IonButton,
    IonIcon,
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    IonLabel,
    ClipboardModule,
  ],
  templateUrl: './user-list-item.component.html',
  styleUrl: './user-list-item.component.scss',
})
export class UserListItemComponent {
  private listService = inject(MovieListService);
  private snackbar = inject(ToastService);

  list = input.required<InfoListModel>();
  invitation = input<boolean>(false);

  acceptInvitation() {
    this.listService
      .acceptListInvitation(this.list().id)
      .then((res) => {
        this.snackbar.open('Invio alla lista accettato.', {
          duration: 3000,
        });
      })
      .catch((err) => {
        this.snackbar.open(
          "Errore! Impossibile accettare l'invito.",

          { duration: 3000 }
        );
      });
  }

  declineInvitation() {
    this.listService
      .declineListInvitation(this.list().id)
      .then((res) => {
        this.snackbar.open('Invito alla lista declinato.', {
          duration: 3000,
        });
      })
      .catch((err) => {
        this.snackbar.open(
          "Errore! Impossibile declinare l'invito.",

          { duration: 3000 }
        );
      });
  }

  copyToClipboardNotification(event: Event) {
    this.snackbar.open('Codice della lista copiato negli appunti!', {
      duration: 3000,
    });
    event.stopPropagation();
  }

  async shareListCode(event: Event) {
    event?.stopPropagation();

    if ((await Share.canShare()).value) {
      // Share text only
      await Share.share({
        text: 'Codice lista: ' + this.list().id + '\nAccedi a MoviesMates e incolla il codice nella sezione "Unisciti ad una lista" per accedere!',
      });
    } else {
      this.snackbar.open('Impossibile condividere il codice lista.\nAccedere alle impostazioni della lista per copiare il codice.');
    }

  }
}
