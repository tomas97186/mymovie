import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs';
import { FriendListComponent } from 'src/app/components/friend-list/friend-list.component';
import { InviteUserListComponent } from 'src/app/components/invite-user-list/invite-user-list.component';
import { InfoListModel } from 'src/app/models/movie-list.model';
import { FriendsService } from 'src/app/services/friends.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-invite-user-page',
  templateUrl: './invite-user-page.component.html',
  styleUrls: ['./invite-user-page.component.scss'],
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
    InviteUserListComponent,
  ],
})
export class InviteUserPageComponent implements OnInit {
  dialog = inject(ModalController);

  private readonly MESSAGE_LABELS = 'pages.community.messages.';
  private friendService = inject(FriendsService);
  private user = inject(UserService);
  details = input.required<InfoListModel>();

  friendList$ = this.friendService.getFriendList().pipe(
    map((res) =>
      res?.map((f) => ({
        uid: f.user.uid,
        ...f,
      }))
    )
  );

  constructor() {}

  ngOnInit() {}
}
