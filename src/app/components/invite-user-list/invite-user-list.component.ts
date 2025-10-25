import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonList, IonItem, IonAvatar, IonLabel, IonButton, IonIcon } from "@ionic/angular/standalone";
import { FriendStatusEnum } from 'src/app/enum/friend-status.enum';
import { FriendshipModel } from 'src/app/models/Friendship.model';
import { FriendsService } from 'src/app/services/friends.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-invite-user-list',
  templateUrl: './invite-user-list.component.html',
  styleUrls: ['./invite-user-list.component.scss'],
  imports: [CommonModule, RouterModule, IonIcon, IonButton, IonLabel, IonAvatar, IonList, IonItem],
})
export class InviteUserListComponent implements OnInit {
  private snackbar = inject(ToastService);
  private friendService = inject(FriendsService);
  userData = inject(UserDataService);

  friendList = input.required<FriendshipModel[]>()

  FriendStatusEnum = FriendStatusEnum;

  acceptFriendRequest(event: Event, request: FriendshipModel) {
    event.stopPropagation();
    this.friendService.acceptFriendRequest(request).then(
      res => {
        this.snackbar.open('pages.community.messages.acceptFriend.success')
      }
    ).catch(
      err => {
        console.error(err);
        this.snackbar.open('pages.community.messages.acceptFriend.error')
      }
    )
  }

  declineFriendRequest(event: Event, request: FriendshipModel) {
    event.stopPropagation();
    this.friendService.declineFriendRequest(request).then(
      res => {
        this.snackbar.open('pages.community.messages.acceptFriend.success')
      }
    ).catch(
      err => {
        console.error(err);
        this.snackbar.open('pages.community.messages.acceptFriend.error')
      }
    )
  }

  constructor() { }

  ngOnInit() { }

}
