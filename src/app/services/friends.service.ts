import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  and,
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getCountFromServer,
  or,
  query,
  where,
  writeBatch
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { CollectionEnum } from '../enum/collection.enum';
import { FriendStatusEnum } from '../enum/friend-status.enum';
import { FriendshipModel } from '../models/Friendship.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);

  async sendFriendRequest(username: string) {
    const user = await this.userService.userExists(username);

    if (!user) {
      return false;
    }

    await addDoc(collection(this.firestore, CollectionEnum.FRIEDS), {
      sender: { username: this.userService.userInfo?.username, uid: this.userService.userInfo?.uid },
      receiver: { uid: user.uid, username: username },
      status: FriendStatusEnum.PENDING,
      createdDate: new Date().toISOString(),
    });

    return true;
  }

  acceptFriendRequest(friendship: FriendshipModel) {
    const batch = writeBatch(this.firestore);

    batch.update(
      doc(this.firestore, `${CollectionEnum.FRIEDS}/${friendship.id}`),
      {
        status: FriendStatusEnum.ACCEPTED,
        acceptedDate: new Date().toISOString(),
      }
    );
    batch.update(
      doc(this.firestore, `${CollectionEnum.USERS}/${friendship.receiver.uid}`),
      { friends: arrayUnion(friendship.sender.uid) }
    );
    batch.update(
      doc(this.firestore, `${CollectionEnum.USERS}/${friendship.sender.uid}`),
      { friends: arrayUnion(friendship.receiver.uid) }
    );

    return batch.commit();
  }

  declineFriendRequest(friendship: FriendshipModel) {
    return deleteDoc(
      doc(this.firestore, `${CollectionEnum.FRIEDS}/${friendship.id}`)
    );
  }

  removeFriend(friendship: FriendshipModel) {
    console.log('Removing friend: ', friendship.id);
    const batch = writeBatch(this.firestore);

    batch.delete(
      doc(this.firestore, `${CollectionEnum.FRIEDS}/${friendship.id}`)
    );
    batch.update(
      doc(this.firestore, `${CollectionEnum.USERS}/${friendship.receiver.uid}`),
      { friends: arrayRemove(friendship.sender.uid) }
    );
    batch.update(
      doc(this.firestore, `${CollectionEnum.USERS}/${friendship.sender.uid}`),
      { friends: arrayRemove(friendship.receiver.uid) }
    );

    return batch.commit();
  }

  getFriendList() {
    return collectionData(
      query(
        collection(this.firestore, `${CollectionEnum.FRIEDS}`),
        or(
          where('sender.uid', '==', this.userService.currentUser!.uid),
          where('receiver.uid', '==', this.userService.currentUser!.uid)
        )
      ),
      { idField: 'id' }
    ) as Observable<FriendshipModel[]>;
  }

  getFriendStatus(uid: string) {
    return (collectionData(
      query(
        collection(this.firestore, `${CollectionEnum.FRIEDS}`),
        or(
          and(
            where('sender.uid', '==', this.userService.currentUser!.uid),
            where('receiver.uid', '==', uid),
          ),
          and(
            where('receiver.uid', '==', this.userService.currentUser!.uid),
            where('sender.uid', '==', uid)
          )
        )
      ), { idField: 'id' }
    ) as Observable<FriendshipModel[]>).pipe(
      map(res => res.length > 0 ? res[0] : undefined)
    );
  }

  countFriendRequests() {
    return getCountFromServer(
      query(
        collection(this.firestore, `${CollectionEnum.FRIEDS}`),
        and(
          where(
            'receiver.uid', '==', this.userService.currentUser?.uid
          ),
          where(
            'status', '==', FriendStatusEnum.PENDING
          ),
        )
      )
    ).then(res => res.data().count);

  }
}
