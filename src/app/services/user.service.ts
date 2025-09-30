import { inject, Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import {
  get,
  increment,
  list,
  listVal,
  objectVal,
  push,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { first, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { MovieStatusEnum } from '../enum/movie-status.enum';
import { database } from '../firebase';
import { InfoListModel } from '../models/movie-list.model';
import { SearchItemModel } from '../models/search-item.model';
import { UserModel } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MovieListService {
  private authService = inject(AuthService);

  private currentUser?: User;
  private currentListId?: string;

  constructor() {
    this.authService.currentUser$.pipe().subscribe((user) => {
      this.currentUser = user!;
      this.getUserInfo()
        .pipe(
          first(),
          switchMap((userInfo) => {
            if (!userInfo) {
              return from(this.setUserInfo()).pipe(first());
            }
            return of(userInfo);
          }),
          switchMap(this.getUserLists.bind(this)),
          first(),
          tap(
            (lists) =>
              (this.currentListId = lists?.length ? lists[0] : undefined)
          )
        )
        .subscribe();
    });
  }

  /**
   * Crea una nuova lista con nome e film iniziali
   */
  async createList(
    name: string,
    privateList: boolean = true,
    initialMovies: [] = []
  ): Promise<string> {
    if (!this.currentUser) throw new Error('Utente non autenticato');

    // Crea una nuova chiave lista
    const newListRef = push(ref(database, 'lists'));
    const newListId = newListRef.key;

    if (!newListId) throw new Error("Errore nel generare l'ID della lista");

    this.currentListId = newListId;
    // Struttura iniziale della lista
    const newListData = {
      members: {
        [this.currentUser.uid]: true,
      },
      movies: initialMovies ?? [],
      info: {
        name,
        privateList,
        createdBy: this.currentUser.uid,
        watchedMovies: 0,
        moviesCount: initialMovies?.length || 0,
        id: newListId.slice(1),
        membersCount: 1,
      },
    };
    // Salva la lista
    await set(newListRef, newListData);

    // Aggiungi la lista all'utente
    set(
      ref(database, `users/${this.currentUser.uid}/lists/${newListId}`),
      newListId
    );

    return newListId; // Ritorna l'ID della nuova lista
  }

  /**
   * Elimina una lista
   */
  async deleteList(listId: string) {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    listId = listId.startsWith('-') ? listId : '-' + listId;

    const updates: { [key: string]: unknown } = {};
    updates[`lists/${listId}`] = null;
    updates[`users/${this.currentUser.uid}/lists/${listId}`] = null;
    return update(ref(database), updates);
  }
  /**
   * Legge l'elenco degli ID lista dell'utente autenticato
   */
  getUserLists(): Observable<string[]> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    const db = ref(database, `users/${this.currentUser.uid}/lists`);
    return listVal<string>(db).pipe(map((lists) => Object.values(lists || [])));
  }

  /**
   * Legge le info di una lista (solo se l'utente è membro)
   */
  getListInfo(listId: string): Observable<InfoListModel> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    if (!!listId && !listId.startsWith('-')) {
      listId = '-' + listId;
    }
    const db = ref(database, `lists/${listId}/info`);
    return objectVal<InfoListModel>(db).pipe(
      tap((res) => {
        if (!res) {
          console.error('Gruppo non esistente, elimino dalla lista'),
            remove(
              ref(database, `users/${this.currentUser!.uid}/lists/${listId}`)
            );
        }
      })
    );
  }

  /**
   * Legge i film di una lista (solo se l'utente è membro)
   */
  getListMovies(
    listId: string,
    watched = false
  ): Observable<SearchItemModel[]> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    const db = ref(
      database,
      `lists/${listId}/${watched ? 'watched_movies' : 'movies'}`
    );

    return listVal<SearchItemModel>(db).pipe(
      map((res) =>
        res.map((m) => ({
          ...m,
          watched: watched,
          poster_path: m.poster_path.startsWith(environment.posterUrl)
            ? m.poster_path
            : environment.posterUrl + m.poster_path,
        }))
      )
    );
  }

  /**
   * Legge i membri di una lista (solo se l'utente è membro)
   */
  getListMembers(listId: string): Observable<{ [key: string]: boolean }> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    const db = ref(database, `lists/${listId}/members`);
    return list(db).pipe(
      map((actions) =>
        Object.fromEntries(
          actions.map((a) => [a.snapshot.key, a.snapshot.val()])
        )
      )
    );
  }

  /**
   * Aggiunge l'utente autenticato come membro a una lista esistente
   */
  async joinList(listId: string): Promise<boolean> {
    listId = listId.startsWith('-') ? listId : '-' + listId;
    console.log('Aggiungi alla lista: ', listId);
    if (!this.currentUser) throw new Error('Utente non autenticato');
    const res = await get(ref(database, `lists/${listId}/info/id`));
    if (!res.exists()) {
      console.log('Errore! lista non esistente');
      return false; // La lista non esiste
    }
    const alreadyInlist = await get(
      ref(database, `lists/${listId}/members/${this.currentUser.uid}`)
    );
    if (alreadyInlist.exists() && alreadyInlist.val()) {
      console.log('Errore! Utente già in lista');
      return false;
    }
    const updates: { [key: string]: unknown } = {};
    updates[`lists/${listId}/members/${this.currentUser.uid}`] = true;
    updates[`lists/${listId}/info/membersCount`] = increment(1);
    updates[`users/${this.currentUser.uid}/lists/${listId}`] = listId;
    await update(ref(database), updates);
    console.log('Invito accettato');
    return true;
  }

  async removeUser(listId: string, userUid: string) {
    console.log('Removing user ' + userUid + ' dalla lista ' + listId);

    listId = listId.startsWith('-') ? listId : '-' + listId;
    const res = await get(ref(database, `lists/${listId}/info/createdBy`));
    if (!res.exists) {
      throw new Error('Lista non esistente');
    } else if (res.val() != this.currentUser?.uid) {
      throw new Error("L`'utente non è amministratore della lista.");
    }
    const userStatus = await get(
      ref(database, `lists/${listId}/members/${userUid}`)
    );
    if (!userStatus.exists) {
      throw new Error('Utente non esistente');
    }
    const updates: { [key: string]: unknown } = {};
    updates[`lists/${listId}/members/${userUid}`] = null;
    if (userStatus.val()) {
      updates[`lists/${listId}/info/membersCount`] = increment(-1);
    } else {
      updates[`invitations/${userUid}/${listId}`] = null;
    }
    await update(ref(database), updates);
  }

  /**
   * Aggiunge l'utente autenticato come membro a una lista esistente
   */
  async inviteToList(listId: string, username: string): Promise<boolean> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    listId = listId.startsWith('-') ? listId : '-' + listId;
    const res = await get(ref(database, `usernames/${username.toLowerCase()}`));
    if (!res.exists()) {
      return false; // La lista non esiste.
    }
    const uid = res.val();
    const isInList = await get(ref(database, `lists/${listId}/members/${uid}`));
    if (isInList.exists()) {
      return false; // L'utente è già in lista.
    }
    const updates: { [key: string]: unknown } = {};
    updates[`invitations/${uid}/${listId}`] = true;
    updates[`lists/${listId}/members/${uid}`] = false;
    await update(ref(database), updates);

    return true;
  }

  getListInvitations(): Observable<string[]> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    const db = ref(database, `invitations/${this.currentUser.uid}`);

    return list(db).pipe(
      map((actions) => actions.map((a) => a.snapshot.key as string)),
      tap(console.log)
    );
  }

  async acceptListInvitation(listId: string): Promise<boolean> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    listId = listId.startsWith('-') ? listId : '-' + listId;

    const res = await this.joinList(listId);
    if (res) {
      await remove(
        ref(database, `invitations/${this.currentUser.uid}/${listId}`)
      );
    }

    return res;
  }

  async declineListInvitation(listId: string): Promise<void> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    listId = listId.startsWith('-') ? listId : '-' + listId;

    const updates: { [key: string]: unknown } = {};
    updates[`lists/${listId}/members/${this.currentUser.uid}`] = null;
    updates[`invitations/${this.currentUser.uid}/${listId}`] = null;

    await update(ref(database), updates);
  }

  /**
   * Modifica il nome di una lista
   */
  async changeListName(name: string, listId: string): Promise<void> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    await set(ref(database, `lists/${listId}/info/name`), name);
  }

  /**
   * Esce dalla lista corrente dell'utente autenticato
   */
  async exitList(listId: string): Promise<void> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    console.log('Exiting from list', listId);
    listId = listId.startsWith('-') ? listId : '-' + listId;

    const updates: { [key: string]: unknown } = {};
    updates[`users/${this.currentUser.uid}/lists/${listId}`] = null;
    updates[`lists/${listId}/info/membersCount`] = increment(-1);
    updates[`lists/${listId}/members/${this.currentUser.uid}`] = null;

    return update(ref(database), updates);
  }

  /**
   * Modifica il contenuto dei film della lista di cui l'utente è membro
   */
  async addMovie(newMovie: SearchItemModel, listId?: string): Promise<void> {
    if (!this.currentListId)
      throw new Error('Utente non presente in nessuna lista');

    const updates: { [key: string]: unknown } = {};
    updates[`lists/${listId ?? this.currentListId}/movies/${newMovie.id}`] = {
      id: newMovie.id,
      title: newMovie.title,
      poster_path: newMovie.poster_path.replace(environment.posterUrl, ''),
      // vote_average: newMovie.vote_average,
      createdDate: new Date().toISOString(),
    };
    updates[`lists/${listId ?? this.currentListId}/info/moviesCount`] =
      increment(1);
    updates[`movies/${newMovie.id}/${listId ?? this.currentListId}`] = false;

    await update(ref(database), updates);
  }

  /**
   * Modifica il contenuto dei film della lista di cui l'utente è membro
   */
  async removeMovie(id: number, listId?: string): Promise<void> {
    const watched = await get(
      ref(
        database,
        `lists/${listId ?? this.currentListId}/watched_movies/${id}/id`
      )
    );

    const updates: { [key: string]: unknown } = {};
    updates[`lists/${listId ?? this.currentListId}/info/moviesCount`] =
      increment(-1);
    if (watched.exists()) {
      updates[`lists/${listId ?? this.currentListId}/watched_movies/${id}`] =
        null;
      updates[`lists/${listId ?? this.currentListId}/info/watchedMovies`] =
        increment(-1);
    } else {
      updates[`lists/${listId ?? this.currentListId}/movies/${id}`] = null;
    }
    updates[`movies/${id}/${listId ?? this.currentListId}`] = null;

    return update(ref(database), updates);
  }

  /**
   * Modifica il contenuto dei film della lista di cui l'utente è membro
   */
  async setMovieAsWatched(id: number, listId?: string): Promise<void> {
    const listRef = ref(database, `lists/${listId ?? this.currentListId}`);

    console.log(listId);
    console.log(id);
    const movie = (
      await get(
        ref(database, `lists/${listId ?? this.currentListId}/movies/${id}`)
      )
    ).val();

    movie.watchedDate = new Date().toISOString();
    const updates: { [key: string]: unknown } = {};
    updates[`lists/${listId ?? this.currentListId}/movies/${id}`] = null;
    updates[`lists/${listId ?? this.currentListId}/watched_movies/${id}`] =
      movie;
    updates[`lists/${listId ?? this.currentListId}/info/watchedMovies`] =
      increment(1);
    updates[`movies/${id}/${listId ?? this.currentListId}`] = true;

    return update(ref(database), updates);
  }

  reviewMovie(movieId: string, review: -1 | 1) {
    const updates: { [key: string]: unknown } = {};

    updates[`reviews/${movieId}/${this.currentUser!.uid}`] = review;
    updates[`users/${this.currentUser!.uid}/reviews/${movieId}`] = review;

    return update(ref(database), updates);
  }

  /**
   * Ritorna le liste in cui è presente il film specificato
   */
  getMovieLists(id: number): Observable<string[]> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    const db = ref(database, `movies/${id}`);
    return list(db).pipe(
      map((actions) => actions.map((a) => a.snapshot.key as string))
    );
  }

  getUserInfo(uid?: string): Observable<UserModel | undefined> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    return objectVal<UserModel>(
      ref(database, `users/${uid ?? this.currentUser.uid}/info`)
    );
  }

  async setUserInfo() {
    if (!this.currentUser) throw new Error('Utente non autenticato');

    const username = 'User' + Math.floor(Math.random() * 999999);
    const updates: { [key: string]: unknown } = {};
    updates[`usernames/${username.toLowerCase()}`] = this.currentUser.uid;
    updates[`users/${this.currentUser.uid}/info`] = {
      username: username,
      email: this.currentUser.email,
      uid: this.currentUser.uid,
    };

    return update(ref(database), updates);
  }

  async setUsername(username: string) {
    if (!this.currentUser) throw new Error('Utente non autenticato');

    const updates: { [key: string]: unknown } = {};
    const oldUsername = await get(
      ref(database, `users/${this.currentUser.uid}/info/username`)
    );
    if (oldUsername.exists()) {
      updates[`usernames/${oldUsername.val().toLowerCase()}`] = null;
    }
    updates[`usernames/${username.toLowerCase()}`] = this.currentUser.uid;
    updates[`users/${this.currentUser.uid}/info/username`] = username;

    return update(ref(database), updates);
  }

  movieStatus(id: number, listId?: string): Observable<MovieStatusEnum> {
    if (!this.currentUser) throw new Error('Utente non autenticato');
    listId = listId || this.currentListId;
    const db = ref(database, `movies/${id}/${listId}`);
    return objectVal<MovieStatusEnum>(db).pipe(
      map((val) => {
        if (val != null) {
          return val ? MovieStatusEnum.WATCHED : MovieStatusEnum.TO_WATCH;
        }
        return MovieStatusEnum.NOT_IN_LIST;
      })
    );
  }
}
