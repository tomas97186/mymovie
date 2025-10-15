import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  Firestore,
  setDoc,
  WriteBatch
} from '@angular/fire/firestore';
import { first, map, Observable, share, tap } from 'rxjs';
import { CollectionEnum } from '../enum/collection.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private usernames?: {
    [key: string]: string
  };
  private userAvatars?: {
    [key: string]: string
  }

  constructor() {
    (docData(doc(this.firestore, `${CollectionEnum.USERNAMES}/1`)) as Observable<{ [key: string]: string }>).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(res => {
        this.usernames = res;
      })
    ).subscribe();
    (docData(doc(this.firestore, `${CollectionEnum.USER_AVATARS}/1`)) as Observable<{ [key: string]: string }>).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(res => {
        this.userAvatars = res;
      })
    ).subscribe();

  }
  public async setUsername(username: string, uid: string, batch?: WriteBatch) {
    const usernameRef = doc(this.firestore, `${CollectionEnum.USERNAMES}/1`);

    if (batch) {
      batch.set(usernameRef, { [uid]: username }, { merge: true });
      batch.set(doc(this.firestore, `${CollectionEnum.USERNAMES}/${username}`), { 'uid': uid });
    } else {
      await setDoc(usernameRef, { [uid]: username }, { merge: true });
    }
  }

  public getUserAvatar(uid: string) {
    return this.userAvatars ? this.userAvatars![uid] : undefined;
  }

  public async setUserAvatar(avatarUrl: string, uid: string, batch?: WriteBatch) {
    const userAvatarsRef = doc(this.firestore, `${CollectionEnum.USER_AVATARS}/1`);

    if (batch) {
      batch.set(userAvatarsRef, { [uid]: avatarUrl }, { merge: true });
    } else {
      await setDoc(userAvatarsRef, { [uid]: avatarUrl }, { merge: true });
    }
  }

  public getUsername(uid: string) {
    return this.usernames ? this.usernames![uid] : undefined;
  }

}
