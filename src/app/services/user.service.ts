import { inject, Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { get, listVal, objectVal, ref, update } from '@angular/fire/database';
import { filter, first, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { UserModel } from '../models/user.model';
import { AuthService } from './auth.service';
import { DatabaseService, UpdateModel } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);
  private database = inject(DatabaseService);

  addUserList(list: string) {
    return this.authService.currentUser$.pipe(
      filter((user) => !!user),
      switchMap((user) =>
        this.database.set(`users/${user.uid}/lists/${list}`, true)
      )
    );
  }

  removeUserList(list: string) {
    return this.authService.currentUser$.pipe(
      filter((user) => !!user),
      switchMap((user) =>
        this.database.delete(`users/${user.uid}/lists/${list}`)
      )
    );
  }
  /**
   * Legge l'elenco degli ID lista dell'utente autenticato
   */
  getUserLists(): Observable<string[]> {
    return this.authService.currentUser$.pipe(
      filter((user) => !!user),
      switchMap((user) =>
        this.database
          .getList(`users/${user.uid}/lists`)
          .pipe(map((items) => items.map((i: any) => i.id as string)))
      )
    );
  }

  getUserInfo(uid?: string): Observable<UserModel | undefined> {
    return this.authService.currentUser$.pipe(
      filter((user) => !!user),
      switchMap(
        (user) =>
          this.database.get(`users/${user.uid}/info`) as Observable<UserModel>
      )
    );
  }

  setUserInfo() {
    const username = 'User' + Math.floor(Math.random() * 999999);

    return this.authService.currentUser$.pipe(
      filter((user) => !!user),
      switchMap((user) => {
        const updates: UpdateModel[] = [
          {
            path: `usernames/${username.toLowerCase()}`,
            value: user.uid,
          },
          {
            path: `users/${user.uid}/info`,
            value: {
              username: username,
              email: user.email,
              uid: user.uid,
            },
          },
        ];

        return this.database.setMultiple(updates);
      })
    );
  }

  async setUsername(newUsername: string, oldUsername: string) {
    return this.authService.currentUser$.pipe(
      filter((user) => !!user),
      switchMap((user) => {
        const updates: UpdateModel[] = [
          {
            path: `users/${oldUsername.toLocaleLowerCase()}`,
            type: 'delete',
          },
          {
            path: `usernames/${newUsername.toLowerCase()}`,
            value: user.uid,
          },
          {
            path: `users/${user.uid}/info/username`,
            value: newUsername,
          },
        ];

        return this.database.setMultiple(updates);
      })
    );
  }
}
