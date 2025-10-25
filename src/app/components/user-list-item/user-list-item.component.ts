import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Share } from '@capacitor/share';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembershipModel } from 'src/app/models/membership.model';
import { ToastService } from 'src/app/services/toast.service';
import { MovieListService } from '../../services/movie-list.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-user-list-item',
  imports: [TranslateModule, IonButton, IonIcon, CommonModule, RouterModule, ClipboardModule],
  templateUrl: './user-list-item.component.html',
  styleUrl: './user-list-item.component.scss',
})
export class UserListItemComponent {
  private readonly MESSAGE_LABELS = 'pages.userLists.messages.';
  
  userDataService = inject(UserDataService);
  
  private listService = inject(MovieListService);
  private snackbar = inject(ToastService);
  private translate = inject(TranslateService);

  membership = input.required<MembershipModel>();
  list = rxResource({
    request: () => this.membership(),
    loader: ({ request }) => this.listService.getListInfo(request.list.id)
  });
  invitation = input<boolean>(false);

  acceptInvitation() {
    this.listService
      .acceptListInvitation(this.membership())
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
      .declineListInvitation(this.membership().id)
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
          this.MESSAGE_LABELS + 'condividi.messaggio',
          { listId: this.membership().list.id }
        ),
      });
    } else {
      this.snackbar.open(
        this.translate.instant(this.MESSAGE_LABELS + 'condividi.errore', {
          listId: this.membership().id,
        })
      );
    }
  }
}
