import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
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
import { MovieListService } from 'src/app/services/movie-list.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserDataService } from 'src/app/services/userdata.service';

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

  private listService = inject(MovieListService);
  private snackBar = inject(ToastService);
  private translate = inject(TranslateService);
  userData = inject(UserDataService);
  listId = input.required<string>();
  members = computed(() =>
    this.listService
      .getListMembers(this.listId())
      .pipe(map((res) => Object.fromEntries(res.map((u) => [u.uid, u.status]))))
  );

  friendList = input.required<FriendshipModel[]>();

  MembershipEnum = MembershipEnum;
  isInList = (uid: string) => uid in this.members;

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

  ngOnInit() {}
}
