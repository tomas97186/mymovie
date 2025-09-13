import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { InfoListModel } from '../../models/movie-list.model';
import { MatButtonModule } from '@angular/material/button';
import { MovieListService } from '../../services/movie-list.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-list-item',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './user-list-item.component.html',
  styleUrl: './user-list-item.component.scss',
})
export class UserListItemComponent {
  private listService = inject(MovieListService);
  private snackbar = inject(MatSnackBar);

  list = input.required<InfoListModel>();
  invitation = input<boolean>(false);

  acceptInvitation() {
    this.listService
      .acceptListInvitation(this.list().id)
      .then((res) => {
        this.snackbar.open('Invio alla lista accettato.', 'Chiudi', {
          duration: 3000,
        });
      })
      .catch((err) => {
        this.snackbar.open(
          "Errore! Impossibile accettare l'invito.",
          'Chiudi',
          { duration: 3000 }
        );
      });
  }

  declineInvitation() {
    this.listService
      .declineListInvitation(this.list().id)
      .then((res) => {
        this.snackbar.open('Invito alla lista declinato.', 'Chiudi', {
          duration: 3000,
        });
      })
      .catch((err) => {
        this.snackbar.open(
          "Errore! Impossibile declinare l'invito.",
          'Chiudi',
          { duration: 3000 }
        );
      });
  }
}
