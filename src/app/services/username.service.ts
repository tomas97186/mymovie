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
export class UsernameService {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private usernames?: {
    [key: string]: string
  };

  constructor() {
    (docData(doc(this.firestore, `${CollectionEnum.USERNAMES}/1`)) as Observable<{ [key: string]: string }>).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(res => {
        this.usernames = res;
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

  public getUsername(uid: string) {
    return this.usernames ? this.usernames![uid] : undefined;
  }

}
