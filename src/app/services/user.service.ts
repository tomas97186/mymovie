import { DestroyRef, inject, Injectable } from '@angular/core';
import { collection, doc, docData, Firestore, getDocs, query, setDoc, updateDoc, where, writeBatch, WriteBatch } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CollectionEnum } from '../enum/collection.enum';
import { AuthService } from './auth.service';
import { UserModel } from '../models/user.model';
import { User } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  public currentUser?: User;

  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser = user!;
    });
  }

  getUserInfo(uid?: string): Observable<UserModel | undefined> {
    uid ??= this.currentUser?.uid;
    return docData(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`)) as Observable<UserModel>;

  }

  setUserInfo(uid?: string) {
    const username = 'User' + Math.floor(Math.random() * 999999);
    uid ??= this.currentUser?.uid;

    return setDoc(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`),
      {
        username: username,
        uid: uid,
        listCount: 0
      },)
  }

  async setUsername(username: string, uid?: string) {
    const batch = writeBatch(this.firestore);
    uid ??= this.currentUser?.uid;
    batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`),
      {
        username,
      });

    const q = query(collection(this.firestore, CollectionEnum.MEMBERSHIPS), where('user.uid', '==', uid));
    (await getDocs(q)).forEach(
      d => batch.update(d.ref, { 'user.username': username })
    );

    return batch.commit();
  }
}
