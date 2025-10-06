import { DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  WriteBatch,
} from '@angular/fire/firestore';
import { filter, first, from, Observable, of, switchMap, tap } from 'rxjs';
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
  private __currentUser?: User;
  private __userInfo = signal<UserModel | undefined>(undefined);

  constructor() {
    this.authService.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((u) => !!u),
        switchMap((u: User) => {
          this.__currentUser = u!;
          return this.getUserInfo(this.__currentUser.uid);
        }),
        switchMap((userInfo) => {
          if (!userInfo) {
            return from(this.setUserInfo(this.__currentUser!.uid)).pipe(
              first()
            );
          }
          return of(userInfo);
        }),
        tap((u) => {
          this.__userInfo.set(u);
        })
      )
      .subscribe();
  }

  public get currentUser(): User | undefined {
    return this.__currentUser;
  }

  public get userInfo(): UserModel | undefined {
    console.log(this.__userInfo());
    return this.__userInfo();
  }

  public get userInfo$(): Signal<UserModel | undefined> {
    return this.__userInfo.asReadonly();
  }

  public isLoggedIn() {
    if (!this.currentUser) throw new Error('Utente non autenticato.');
    return true;
  }

  getUserInfo(uid?: string): Observable<UserModel | undefined> {
    uid ??= this.currentUser?.uid;
    return docData(
      doc(this.firestore, `${CollectionEnum.USERS}/${uid}`)
    ) as Observable<UserModel>;
  }

  async setUserInfo(uid?: string) {
    const username = 'User' + Math.floor(Math.random() * 999999);
    const userInfo: UserModel = {
      username: username,
      uid: this.currentUser!.uid!,
      listCount: 0,
      dislikedMovies: 0,
      likedMovies: 0,
      friends: [],
    };

    await setDoc(
      doc(this.firestore, `${CollectionEnum.USERS}/${uid}`),
      userInfo
    );

    return userInfo;
  }

  async setUsername(username: string, uid?: string) {
    const batch = writeBatch(this.firestore);
    uid ??= this.currentUser?.uid;
    batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`), {
      username,
    });

    (
      await getDocs(
        query(
          collection(this.firestore, CollectionEnum.MEMBERSHIPS),
          where('user.uid', '==', uid)
        )
      )
    ).forEach((d) => batch.update(d.ref, { 'user.username': username }));

    (
      await getDocs(
        query(
          collection(this.firestore, CollectionEnum.FRIEDS),
          where('sender.uid', '==', uid)
        )
      )
    ).forEach((d) => batch.update(d.ref, { 'sender.username': username }));

    (
      await getDocs(
        query(
          collection(this.firestore, CollectionEnum.FRIEDS),
          where('receiver.uid', '==', uid)
        )
      )
    ).forEach((d) => batch.update(d.ref, { 'receiver.username': username }));

    return batch.commit();
  }

  public async userExists(username: string): Promise<UserModel | undefined> {
    const user = await getDocs(
      query(
        collection(this.firestore, CollectionEnum.USERS),
        where('username', '==', username)
      )
    );

    if (user.empty) {
      return; // L'utente non esiste
    }

    return user.docs[0].data() as UserModel;
  }
}
