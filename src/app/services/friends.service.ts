import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  or,
  query,
  updateDoc,
  where,
  writeBatch,
  WriteBatch,
} from '@angular/fire/firestore';
import { CollectionEnum } from '../enum/collection.enum';
import { FriendStatusEnum } from '../enum/friend-status.enum';
import { UserPartialModel } from '../models/user.partial.model';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { FriendshipModel } from '../models/Friendship.model';

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
      sender: this.userService.userInfo,
      receiver: { uid: user.uid, username: user.username },
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
    collectionData(
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
}
