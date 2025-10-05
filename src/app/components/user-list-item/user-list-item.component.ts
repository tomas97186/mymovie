import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Share } from '@capacitor/share';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { ToastService } from 'src/app/services/toast.service';
import { InfoListModel } from '../../models/movie-list.model';
import { MovieListService } from '../../services/movie-list.service';
import { TranslateService } from '@ngx-translate/core';
import { ListPartialModel } from 'src/app/models/list.partial.model';

@Component({
  selector: 'app-user-list-item',
  imports: [IonButton, IonIcon, CommonModule, RouterModule, ClipboardModule],
  templateUrl: './user-list-item.component.html',
  styleUrl: './user-list-item.component.scss',
})
export class UserListItemComponent {
  private readonly MESSAGE_LABELS = 'pages.userLists.messages.';

  private listService = inject(MovieListService);
  private snackbar = inject(ToastService);
  private translate = inject(TranslateService);

  list = input.required<ListPartialModel>();
  invitation = input<boolean>(false);

  acceptInvitation() {
    this.listService
      .acceptListInvitation(this.list().id)
      .then((res) => {
        this.snackbar.open(
          this.translate.instant(
            this.MESSAGE_LABELS + 'invito.accetta.successo'
          ),
          {
            duration: 3000,
          }
        );
      })
      .catch((err) => {
        this.snackbar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'invito.accetta.errore'),
          {
            duration: 3000,
          }
        );
      });
  }

  declineInvitation() {
    this.listService
      .declineListInvitation(this.list().id)
      .then((res) => {
        this.snackbar.open(
          this.translate.instant(
            this.MESSAGE_LABELS + 'invito.rifiuta.successo'
          ),
          {
            duration: 3000,
          }
        );
      })
      .catch((err) => {
        this.snackbar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'invito.rifiuta.errore'),
          { duration: 3000 }
        );
      });
  }

  async shareListCode(event: Event) {
    event?.stopPropagation();

    if ((await Share.canShare()).value) {
      // Share text only
      await Share.share({
        text: this.translate.instant(
          this.MESSAGE_LABELS + 'condividi.messaggio', { listId: this.list().id }
        ),
      });
    } else {
      this.snackbar.open(
        this.translate.instant(this.MESSAGE_LABELS + 'condividi.errore', {
          listId: this.list().id,
        })
      );
    }
  }
}
