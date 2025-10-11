import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonList, IonItem, IonAvatar, IonLabel, IonButton, IonIcon } from "@ionic/angular/standalone";
import { FriendStatusEnum } from 'src/app/enum/friend-status.enum';
import { FriendshipModel } from 'src/app/models/Friendship.model';
import { FriendsService } from 'src/app/services/friends.service';
import { ToastService } from 'src/app/services/toast.service';
import { UsernameService } from 'src/app/services/username.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss'],
  imports: [CommonModule, RouterModule, IonIcon, IonButton, IonLabel, IonAvatar, IonList, IonItem],
})
export class FriendListComponent implements OnInit {
  private snackbar = inject(ToastService);
  private friendService = inject(FriendsService);
  username = inject(UsernameService);

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
