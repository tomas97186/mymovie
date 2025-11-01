import { inject, Injectable, OnInit } from '@angular/core';
import {
  and,
  collection,
  deleteField,
  doc,
  docData,
  Firestore,
  getCountFromServer,
  query,
  where,
  WriteBatch,
  writeBatch
} from '@angular/fire/firestore';
import { filter, first, firstValueFrom, map, Observable, switchMap, tap } from 'rxjs';
import { CollectionEnum } from '../enum/collection.enum';
import { FriendStatusEnum } from '../enum/friend-status.enum';
import { FriendshipModel } from '../models/Friendship.model';
import { UserModel } from '../models/user.model';
import { UserPartialModel } from '../models/user.partial.model';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  private friendsUid?: string[];
  private authService = inject(AuthService);

  get friendsUids() {
    return this.friendsUid;
  }

  constructor() {
    this.authService.currentUser$.pipe(
      filter(u => !!u),
      first(),
      switchMap(u => this.getFriendList()),
    ).subscribe();
  }

  async sendFriendRequest(username: string) {
    const batch = writeBatch(this.firestore);
    const user = await this.userService.userExists(username);

    if (!user) {
      return false;
    }

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${this.userService.currentUser?.uid}/friends/sentRequests`
      ),
      {
        [user.uid]: {
          // user: { username: this.userService.userInfo?.username, uid: this.userService.userInfo?.uid },
          user: {
            uid: user.uid,
            username: username,
          },
          // status: FriendStatusEnum.PENDING,
          createdDate: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${user.uid}/friends/requests`
      ),
      {
        [this.userService.currentUser!.uid]: {
          // user: { username: this.userService.userInfo?.username, uid: this.userService.userInfo?.uid },
          user: {
            uid: this.userService.currentUser?.uid,
            username: this.userService.userInfo?.username,
          },
          // status: FriendStatusEnum.PENDING,
          createdDate: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    await batch.commit();

    return true;
  }

  acceptFriendRequest(user: UserPartialModel) {
    const batch = writeBatch(this.firestore);

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${user.uid}/friends/sentRequests`
      ),
      {
        [this.userService.currentUser!.uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${this.userService.currentUser?.uid}/friends/requests`
      ),
      {
        [user.uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${this.userService.currentUser?.uid}/friends/all`
      ),
      {
        [user.uid]: {
          // user: { username: this.userService.userInfo?.username, uid: this.userService.userInfo?.uid },
          user: user,
          // status: FriendStatusEnum.PENDING,
          createdDate: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(this.firestore, `${CollectionEnum.USERS}/${user.uid}/friends/all`),
      {
        [this.userService.currentUser!.uid]: {
          // user: { username: this.userService.userInfo?.username, uid: this.userService.userInfo?.uid },
          user: {
            uid: this.userService.currentUser?.uid,
            username: this.userService.userInfo?.username,
          },
          // status: FriendStatusEnum.PENDING,
          createdDate: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    return batch.commit();
  }

  declineFriendRequest(uid: string) {
    const batch = writeBatch(this.firestore);

    batch.set(
      doc(this.firestore, `${CollectionEnum.USERS}/${uid}/friends/sentRequests`),
      {
        [this.userService.currentUser!.uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${this.userService.currentUser?.uid}/friends/requests`
      ),
      {
        [uid]: deleteField(),
      },
      { merge: true }
    );

    return batch.commit();
  }

  removeFriend(uid: string) {
    console.log('Removing friend: ', uid);
    const batch = writeBatch(this.firestore);

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${this.userService.currentUser?.uid}/friends/all`
      ),
      {
        [uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(this.firestore, `${CollectionEnum.USERS}/${uid}/friends/all`),
      {
        [this.userService.currentUser!.uid]: deleteField(),
      },
      { merge: true }
    );

    return batch.commit();
  }

  getFriendList() {
    return (this.getFriendMap('all').pipe(
      map((res) =>
        res
          ? Object.values(res).map((f) => ({
            ...f,
            status: FriendStatusEnum.ACCEPTED,
          }))
          : undefined
      )
    ) as Observable<FriendshipModel[]>)
      .pipe(
        tap(res => this.friendsUid = res.map(f => f.user.uid)),
      );
  }

  getRequestsList() {
    return this.getFriendMap('requests').pipe(
      tap(console.log),
      map((res) =>
        res
          ? Object.values(res).map((f) => ({
            ...f!,
            status: FriendStatusEnum.PENDING,
          }))
          : undefined
      )
    ) as Observable<FriendshipModel[]>;
  }

  async setUsername(username: string, batch: WriteBatch) {
    await this.__setUsername(username, FriendStatusEnum.ACCEPTED, batch);
    await this.__setUsername(username, FriendStatusEnum.PENDING, batch);
    await this.__setUsername(username, FriendStatusEnum.SENT, batch);
  }

  private async __setUsername(username: string, friendType: FriendStatusEnum, batch: WriteBatch) {
    let friends;
    let listToUpdate;
    switch (friendType) {
      case FriendStatusEnum.PENDING:
        friends = await firstValueFrom(this.getRequestsList());
        listToUpdate = 'sentRequests';
        break;
      case FriendStatusEnum.SENT:
        friends = await firstValueFrom(this.getSentRequestsList());
        listToUpdate = 'requests';
        break;
      case FriendStatusEnum.ACCEPTED:
        friends = await firstValueFrom(this.getFriendList());
        listToUpdate = 'all';
        break;
    }


    for (const friend of friends!) {
      console.log('Updating friend username for ', friend.user.username);
      batch.update(
        doc(
          this.firestore,
          `${CollectionEnum.USERS}/${friend.user.uid}/friends/${listToUpdate}`
        ),
        {
          [`${this.userService.currentUser!.uid}.user.username`]: username
        }
      );
    }

  }

  getSentRequestsList() {
    return this.getFriendMap('sentRequests').pipe(
      map((res) =>
        res
          ? Object.values(res).map((f) => ({
            ...f,
            status: FriendStatusEnum.PENDING,
          }))
          : undefined
      )
    ) as Observable<FriendshipModel[]>;
  }

  private getFriendMap(friendshipType: string) {
    return docData<{
      [key: string]: { user: UserModel; createdDate: Date };
    }>(
      doc(
        this.firestore,
        `${CollectionEnum.USERS}/${this.userService.currentUser!.uid
        }/friends/${friendshipType}`
      )
    );
  }

  async getFriendStatus(uid: string) {
    const friends = await firstValueFrom(this.getFriendMap('all'));
    if (friends && uid in friends) {
      return FriendStatusEnum.ACCEPTED;
    }

    const requests = await firstValueFrom(this.getFriendMap('requests'));
    if (requests && uid in requests) {
      return FriendStatusEnum.PENDING;
    }

    const sentRequests = await firstValueFrom(
      this.getFriendMap('sentRequests')
    );
    if (sentRequests && uid in sentRequests) {
      return FriendStatusEnum.SENT;
    }

    return undefined;
  }

  countFriendRequests() {
    return getCountFromServer(
      query(
        collection(this.firestore, `${CollectionEnum.USERS}`),
        and(
          where('receiver.uid', '==', this.userService.currentUser?.uid),
          where('status', '==', FriendStatusEnum.PENDING)
        )
      )
    ).then((res) => res.data().count);
  }
}
