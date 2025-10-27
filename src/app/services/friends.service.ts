import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  and,
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  deleteDoc,
  deleteField,
  doc,
  docData,
  Firestore,
  getCountFromServer,
  or,
  query,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { firstValueFrom, map, Observable } from 'rxjs';
import { CollectionEnum } from '../enum/collection.enum';
import { FriendStatusEnum } from '../enum/friend-status.enum';
import { FriendshipModel } from '../models/Friendship.model';
import { UserService } from './user.service';
import { UserModel } from '../models/user.model';
import { UserPartialModel } from '../models/user.partial.model';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);

  async sendFriendRequest(username: string) {
    const batch = writeBatch(this.firestore);
    const user = await this.userService.userExists(username);

    if (!user) {
      return false;
    }

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.FRIEDS}/${this.userService.currentUser?.uid}/sentFriendRequests`
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
        `${CollectionEnum.FRIEDS}/${user.uid}/friendRequests`
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
        `${CollectionEnum.FRIEDS}/${user.uid}/sentFriendRequests`
      ),
      {
        [this.userService.currentUser!.uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.FRIEDS}/${this.userService.currentUser?.uid}/friendRequests`
      ),
      {
        [user.uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.FRIEDS}/${this.userService.currentUser?.uid}/friends`
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
      doc(this.firestore, `${CollectionEnum.FRIEDS}/${user.uid}/friends`),
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
      doc(this.firestore, `${CollectionEnum.FRIEDS}/${uid}/sentFriendRequests`),
      {
        [this.userService.currentUser!.uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.FRIEDS}/${this.userService.currentUser?.uid}/friendRequests`
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
        `${CollectionEnum.FRIEDS}/${this.userService.currentUser?.uid}/friends`
      ),
      {
        [uid]: deleteField(),
      },
      { merge: true }
    );

    batch.set(
      doc(this.firestore, `${CollectionEnum.FRIEDS}/${uid}/friends`),
      {
        [this.userService.currentUser!.uid]: deleteField(),
      },
      { merge: true }
    );

    return batch.commit();
  }

  getFriendList() {
    return this.getFriendMap('friends').pipe(
      map((res) =>
        res
          ? Object.values(res).map((f) => ({
              ...f,
              status: FriendStatusEnum.ACCEPTED,
            }))
          : undefined
      )
    ) as Observable<FriendshipModel[]>;
  }

  getRequestsList() {
    return this.getFriendMap('friendRequests').pipe(
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

  getSentRequestsList() {
    return this.getFriendMap('sentFriendRequests').pipe(
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
        `${CollectionEnum.FRIEDS}/${
          this.userService.currentUser!.uid
        }/${friendshipType}`
      )
    );
  }

  async getFriendStatus(uid: string) {
    const friends = await firstValueFrom(this.getFriendMap('friends'));
    if (friends && uid in friends) {
      return FriendStatusEnum.ACCEPTED;
    }

    const requests = await firstValueFrom(this.getFriendMap('friendRequests'));
    if (requests && uid in requests) {
      return FriendStatusEnum.PENDING;
    }

    const sentRequests = await firstValueFrom(
      this.getFriendMap('sentFriendRequests')
    );
    if (sentRequests && uid in sentRequests) {
      return FriendStatusEnum.SENT;
    }

    return undefined;
  }

  countFriendRequests() {
    return getCountFromServer(
      query(
        collection(this.firestore, `${CollectionEnum.FRIEDS}`),
        and(
          where('receiver.uid', '==', this.userService.currentUser?.uid),
          where('status', '==', FriendStatusEnum.PENDING)
        )
      )
    ).then((res) => res.data().count);
  }
}
