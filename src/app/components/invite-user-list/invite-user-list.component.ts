import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import {
  AlertController,
  IonAvatar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { InvitationResponseEnum } from 'src/app/enum/invitation.response.enum';
import { MembershipEnum } from 'src/app/enum/membership.enum';
import { FriendshipModel } from 'src/app/models/Friendship.model';
import { UserPartialModel } from 'src/app/models/user.partial.model';
import { MovieListService } from 'src/app/services/movie-list.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserDataService } from 'src/app/services/userdata.service';
import { BUTTONS } from 'src/app/variables';

@Component({
  selector: 'app-invite-user-list',
  templateUrl: './invite-user-list.component.html',
  styleUrls: ['./invite-user-list.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    IonIcon,
    IonButton,
    IonLabel,
    IonAvatar,
    IonList,
    IonItem,
  ],
})
export class InviteUserListComponent implements OnInit {
  private readonly MESSAGE_LABELS = 'pages.community.messages.';
  private readonly DIALOGS_LABELS = 'pages.listDetails.settings.dialogs.';

  private listService = inject(MovieListService);
  private snackBar = inject(ToastService);
  private translate = inject(TranslateService);
  private alertController = inject(AlertController);
  userData = inject(UserDataService);
  listId = input.required<string>();
  members = rxResource({
    request: () => this.listId(),
    loader: ({ request }) => {
      console.log('Loading members for list:', request);
      return this.listService
        .getListMembers(request)
        .pipe(map((res) => Object.fromEntries(res.map((u) => [u.uid, u.status]))))
    }
  }
  );

  friendList = input.required<FriendshipModel[]>();

  MembershipEnum = MembershipEnum;

  isInList(uid: string) {
    return this.members.hasValue() && uid in this.members.value();
  }

  inviteUser(uid: string) {
    const username = this.userData.getUsername(uid);
    if (username) {
      this.listService
        .inviteToList(this.listId()!, username)
        .then((res) => {
          switch (res) {
            case InvitationResponseEnum.USERNAME_NOT_EXISTS: {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'invito.nonEsiste',
                  {
                    username: username,
                  }
                ),
                {
                  duration: 3000,
                }
              );
              break;
            }
            case InvitationResponseEnum.USER_IN_LIST: {
              this.snackBar.open(
                this.translate.instant(
                  this.MESSAGE_LABELS + 'invito.utenteInList',
                  {
                    username: username,
                  }
                ),
                {
                  duration: 3000,
                }
              );
              break;
            }
            default: {
              this.snackBar.open(
                this.translate.instant(this.MESSAGE_LABELS + 'invito.successo'),
                {
                  duration: 3000,
                }
              );
            }
          }
        })
        .catch((error) => {
          console.error('Error invite:', error);
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'errore'),
            {
              duration: 3000,
            }
          );
        });
    }
  }

  async removeUser(user: UserPartialModel, invited = false) {
    const alert = await this.alertController.create({
      header: this.translate.instant(this.DIALOGS_LABELS + 'rimuovi.header', {
        username: user.username,
      }),
      message: this.translate.instant(this.DIALOGS_LABELS + 'rimuovi.message', {
        username: user.username,
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
          handler: () => this.__removeUser(user, invited),
        },
      ],
    });

    await alert.present();
  }


  private __removeUser(user: UserPartialModel, invited: boolean) {
    this.listService
      .removeUser(this.listId(), user.uid, invited)
      .then(() =>
        this.snackBar.open(
          this.translate.instant(
            this.MESSAGE_LABELS + 'rimuoviUtente.successo',
            { username: user.username }
          )
        )
      )
      .catch((err) => {
        console.error(
          "Errore! Non è stato possibile rimuovere l'utente " +
          user.username +
          '.'
        );
        this.snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'rimuoviUtente.errore', {
            username: user.username,
          })
        );
      });
  }

  ngOnInit() { }
}
