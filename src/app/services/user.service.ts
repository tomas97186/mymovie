import { DestroyRef, inject, Injectable, Injector, Signal, signal } from '@angular/core';
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
import { FriendsService } from './friends.service';
import { USER_SERVICE } from '../tokens';
import { AppSettingsService } from './app-settings.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private injector = inject(Injector);
  private __currentUser?: User;
  private __userInfo = signal<UserModel | undefined>(undefined);
  private userDataService = inject(UserDataService);
  private settings = inject(AppSettingsService).settings;

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

  async setUsername(username: string, uid?: string, lastUsernameChange?: string) {
    if (this.daysFromLastChange(lastUsernameChange) < this.settings!.changeUsernameDaysInterval) {
      throw new Error('Non puoi cambiare username prima di 7 giorni dall\'ultima modifica.');
    }

    const batch = writeBatch(this.firestore);
    uid ??= this.currentUser?.uid;
    batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`), {
      username,
      lastUsernameChange: new Date().toISOString(),
    });

    const oldUsername = await getDocs(query(collection(this.firestore, CollectionEnum.USERNAMES), where('uid', '==', uid)));

    if (!oldUsername.empty) {
      batch.delete(oldUsername.docs[0].ref);
    }
    batch.set(doc(this.firestore, `${CollectionEnum.USERNAMES}/${username}`), { 'uid': uid });

    this.userDataService.setUsername(username, uid!, batch);
    await this.injector.get(FriendsService).setUsername(username, batch);

    await batch.commit();
  }

  async setBio(bio: string, uid?: string) {

    return setDoc(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`), { 'bio': bio });

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

  private daysFromLastChange(lastUsernameChange?: string): number {
    if (!lastUsernameChange) {
      return 0;
    }
    const lastChangeDate = new Date(lastUsernameChange);
    const now = new Date();
    const diffInMs = now.getTime() - lastChangeDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  }
}