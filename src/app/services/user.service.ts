import { DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDoc,
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
import { UserDataService } from './userdata.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private __currentUser?: User;
  private __userInfo = signal<UserModel | undefined>(undefined);
  private userDataService = inject(UserDataService);

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
              first(),
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
    const batch = writeBatch(this.firestore);

    const username = 'User' + Math.floor(Math.random() * 999999);
    const userInfo: UserModel = {
      username: username,
      uid: this.currentUser!.uid!,
      listCount: 0,
      dislikedMovies: 0,
      likedMovies: 0,
      friends: [],
    };

    batch.set(
      doc(this.firestore, `${CollectionEnum.USERS}/${uid}`),
      userInfo
    );

    this.userDataService.setUsername(username, uid!, batch);

    await batch.commit();

    return userInfo;
  }

  async setUsername(username: string, uid?: string) {
    const batch = writeBatch(this.firestore);
    uid ??= this.currentUser?.uid;
    batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`), {
      username,
    });

    const oldUsername = await getDocs(query(collection(this.firestore, CollectionEnum.USERNAMES), where('uid', '==', uid)));

    if (!oldUsername.empty) {
      batch.delete(oldUsername.docs[0].ref);
    }
    batch.set(doc(this.firestore, `${CollectionEnum.USERNAMES}/${username}`), { 'uid': uid });

    this.userDataService.setUsername(username, uid!, batch);

    return batch.commit();
  }

  async setAvatar(avatarUrl: string, uid?: string) {
    const batch = writeBatch(this.firestore);
    uid ??= this.currentUser?.uid;

    batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`), { avatarUrl });

    this.userDataService.setUserAvatar(avatarUrl, uid!, batch);

    return batch.commit();
  }

  public async userExists(username: string): Promise<{ uid: string } | undefined> {
    const user = await getDoc(doc(this.firestore, `${CollectionEnum.USERNAMES}/${username}`));

    return user.exists() ? user.data() as { uid: string } : undefined;
  }
}
