import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { FriendStatusEnum } from 'src/app/enum/friend-status.enum';
import { FriendsService } from 'src/app/services/friends.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { BUTTONS } from 'src/app/variables';
import { FriendListComponent } from 'src/app/components/friend-list/friend-list.component';

@Component({
  selector: 'app-community-page',
  templateUrl: './community-page.component.html',
  styleUrls: ['./community-page.component.scss'],
  imports: [
    IonAvatar,
    IonLabel,
    IonItem,
    IonList,
    IonContent,
    ReactiveFormsModule,
    IonInput,
    IonIcon,
    IonButton,
    IonButtons,
    CommonModule,
    TranslateModule,
    IonTitle,
    IonToolbar,
    IonHeader,
    FriendListComponent,
  ],
})
export class CommunityPageComponent implements OnInit {
  private readonly MESSAGE_LABELS = 'pages.community.messages.';
  private alertController = inject(AlertController);
  private translate = inject(TranslateService);
  private friendService = inject(FriendsService);
  private snackBar = inject(ToastService);
  private user = inject(UserService);

  friendList$ = this.friendService
    .getFriendList()
    .pipe(map((res) => res.map((f) => ({ uid: f.user.uid, ...f }))));

  requestList$ = this.friendService
    .getRequestsList()
    .pipe(map((res) => res.filter((f) => ({ uid: f.user.uid, ...f }))));
  queryForm = new FormGroup({ query: new FormControl('') });

  constructor() {}

  ngOnInit() {}

  async openAddFriendDialog() {
    const alert = await this.alertController.create({
      header: this.translate.instant(
        'pages.community.dialogs.addFriend.header'
      ),
      inputs: [
        {
          id: 'username',
          label: 'Username',
          placeholder: 'Username',
          name: 'username',
          attributes: {
            maxLength: 15,
            minLength: 5,
          },
        },
      ],
      buttons: [
        {
          text: this.translate.instant(BUTTONS.ANNULLA),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant(BUTTONS.CONFERMA),
          role: 'confirm',
          handler: this.__addFriend.bind(this),
        },
      ],
    });

    await alert.present();
  }

  private __addFriend(data: { username: string }) {
    if (data && data.username) {
      this.friendService
        .sendFriendRequest(data.username)
        .then((res) => {
          if (!res) {
            this.snackBar.open(
              this.translate.instant(
                this.MESSAGE_LABELS + 'addFriend.nonEsiste',
                {
                  username: data.username,
                }
              ),
              {
                duration: 3000,
              }
            );
          } else {
            this.snackBar.open(
              this.translate.instant(
                this.MESSAGE_LABELS + 'addFriend.successo'
              ),
              {
                duration: 3000,
              }
            );
          }
        })
        .catch((error) => {
          console.error('Error add friend:', error);
          this.snackBar.open(
            this.translate.instant(this.MESSAGE_LABELS + 'addFriend.errore'),
            {
              color: 'danger',
              duration: 3000,
            }
          );
        });
    }
  }
}
