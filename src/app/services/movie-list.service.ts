import { DestroyRef, inject, Injectable } from '@angular/core';
import { and, collection, collectionData, deleteDoc, doc, docData, Firestore, getDoc, getDocs, increment, query, setDoc, updateDoc, where, writeBatch, WriteBatch } from '@angular/fire/firestore';
import { first, firstValueFrom, from, Observable, of, switchMap } from 'rxjs';
import { CollectionEnum } from '../enum/collection.enum';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';
import { UserService } from './user.service';
import { SearchItemModel } from '../models/search-item.model';
import { MovieStatusEnum } from '../enum/movie-status.enum';
import { MembershipModel } from '../models/membership.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MembershipEnum } from '../enum/membership.enum';
import { UserPartialModel } from '../models/user.partial.model';

@Injectable({
  providedIn: 'root',
})
export class MovieListService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);


  public currentUser?: User;

  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser = user!;
      this.userService.getUserInfo(this.currentUser.uid)
        .pipe(
          first(),
          switchMap((userInfo) => {
            if (!userInfo) {
              return from(this.userService.setUserInfo(this.currentUser!.uid)).pipe(first());
            }
            return of(userInfo);
          }),
        )
        .subscribe();
    });
  }

  /**
   * Crea una nuova lista con nome e film iniziali
   */
  async createList(
    name: string,
    privateList: boolean = true
  ) {
    if (this.isLoggedIn()) {
      const batch = writeBatch(this.firestore);
      const listRef = doc(this.firestore, CollectionEnum.LISTS);

      batch.set(listRef, {
        name,
        privateList,
        createdBy: this.currentUser!.uid,
        watchedMovies: 0,
        moviesCount: 0,
        membersCount: 1,
      });
      this.addToUserList({ name, id: listRef.id }, this.currentUser!.uid, MembershipEnum.ACCEPTED, batch);

      return batch.commit();

    }
  }

  /**
   * Elimina una lista
   */
  async deleteList(listId: string) {
    const batch = writeBatch(this.firestore);

    batch.delete(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`));
    await this.removeUserList(listId, batch);
    return batch.commit();
  }


  // /**
  //  * Modifica il nome di una lista
  //  */
  async changeListName(name: string, listId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), { name });
    await this.updateListName({ name, id: listId }, batch);

    return batch.commit();
  }

  // /**
  //  * Legge le info di una lista (solo se l'utente è membro)
  //  */
  getListInfo(listId: string): Observable<SearchItemModel> {
    return docData(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`)) as Observable<SearchItemModel>;
  }

  /**
   * Modifica il contenuto dei film della lista di cui l'utente è membro
   */
  async addMovie(newMovie: SearchItemModel, listId: string) {
    if (this.isLoggedIn()) {
      const batch = writeBatch(this.firestore);
      // const movieRef = doc(this.firestore, `${CollectionEnum.MOVIES}/${newMovie.id}`);
      const listRef = doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`);

      // batch.set(movieRef, newMovie);
      batch.set(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${newMovie.id}`), {
        listId: listId,
        movie: {
          id: newMovie.id,
          title: newMovie.title,
          poster_path: newMovie.poster_path,
        }, addedDate: new Date().toISOString(), addedBy: this.currentUser!.uid, watched: false
      });
      batch.update(listRef, { moviesCount: increment(1) });
      // batch.set(doc(this.firestore, `${CollectionEnum.MOVIES}/${newMovie.id}/${CollectionEnum.LISTS}/${listId}`), { list: listRef });
      await batch.commit();

    }
  }

  // /**
  //  * Aggiunge l'utente autenticato come membro a una lista esistente
  //  */
  async joinList(listId: string): Promise<boolean> {
    if (this.isLoggedIn()) {
      const batch = writeBatch(this.firestore);
      const listRef = doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`);
      const list = await getDoc(listRef);

      if (list.exists()) {
        throw new Error(`Lista ${listId} non esistente.`);
      }

      this.addToUserList({ id: listId, name: list.data()!['name'] }, { uid: this.currentUser!.uid, username: this.currentUser?.displayName! }, MembershipEnum.ACCEPTED, batch);
      batch.set(doc(this.firestore, `${CollectionEnum.LISTS}/${listRef.id}/members/${this.currentUser!.uid}`), { status: 'accepted', uid: this.currentUser!.uid, username: this.currentUser!.displayName });
      batch.update(listRef, { membersCount: increment(1) });

      await batch.commit();

      return true;
    }

    return false;
  }

  // /**
  //  * Esce dalla lista corrente dell'utente autenticato
  //  */
  async exitList(listId: string): Promise<void> {
    if (this.isLoggedIn()) {
      return this.removeUser(listId, this.currentUser!.uid);
    }
  }

  async removeUser(listId: string, userUid: string) {
    const batch = writeBatch(this.firestore);

    await this.removeUserList(listId, batch, userUid);
    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), { membersCount: increment(-1) });
    return batch.commit();
  }


  // /**
  //  * Modifica il contenuto dei film della lista di cui l'utente è membro
  //  */
  async removeMovie(id: number, listId?: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    const movieRef = doc(this.firestore, `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${id}`);

    const movie = await firstValueFrom(docData(movieRef));

    batch.delete(movieRef);
    batch.delete(doc(this.firestore, `${CollectionEnum.MOVIES}/${id}/${CollectionEnum.LISTS}/${listId}`));
    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), { moviesCount: increment(-1), watchedMovies: increment(movie!['watched'] ? -1 : 0) });

    return batch.commit();
  }

  // /**
  //  * Modifica il contenuto dei film della lista di cui l'utente è membro
  //  */
  async setMovieAsWatched(id: number, listId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    const movieRef = doc(this.firestore, `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${id}`);

    batch.update(movieRef, { watched: true, watchedDate: new Date().toISOString() });
    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), { watchedMovies: increment(1) });
    return batch.commit();
  }


  reviewMovie(movieId: string, review: -1 | 1) {

    return setDoc(doc(this.firestore, CollectionEnum.REVIEWS), { review, user: this.currentUser!.uid, movie: movieId });
  }

  async movieStatus(id: number, listId?: string): Promise<MovieStatusEnum> {

    const movie = await getDoc(doc(this.firestore, `${CollectionEnum.MOVIES}/${id}/${CollectionEnum.LISTS}/${listId}`));

    if (!movie.exists()) {
      return MovieStatusEnum.NOT_IN_LIST;
    }
    return movie.get('watched') ? MovieStatusEnum.WATCHED : MovieStatusEnum.TO_WATCH;
  }

  // /**
  //  * Legge i film di una lista (solo se l'utente è membro)
  //  */
  getListMovies(
    listId: string,
    watched = false
  ): Observable<SearchItemModel[]> {
    return collectionData(query(collection(this.firestore, `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}`), where('watched', '==', watched))) as Observable<SearchItemModel[]>;
  }

  // /**
  //  * Legge i memberi di una lista (solo se l'utente è membro)
  //  */
  getListMembers(
    listId: string,
  ) {
    return collectionData(query(collection(this.firestore, `${CollectionEnum.MEMBERSHIPS}`), where('list.id', '==', listId))) as Observable<MembershipModel[]>;
  }

  // /**
  //  * Aggiunge l'utente autenticato come membro a una lista esistente
  //  */
  async inviteToList(listId: string, username: string): Promise<boolean> {
    const user = await getDocs(query(collection(this.firestore, CollectionEnum.USERS), where('username', '==', username)));

    if (user.empty) {
      return false; // L'utente non esiste
    }
    const uid = user.docs[0].id;

    if (await this.userInList(listId, uid)) {
      return false; // L'utente è già in lista.
    }

    const list = await firstValueFrom(this.getListInfo(listId));

    await this.addToUserList({ id: listId, name: list.name }, { uid: uid, username: username }, MembershipEnum.PENDING);

    return true;
  }

  async acceptListInvitation(invitationId: string) {

    return await updateDoc(doc(this.firestore, `${CollectionEnum.MEMBERSHIPS}/${invitationId}`), { status: 'accepted' });

  }

  async declineListInvitation(listId: string): Promise<void> {
    if (this.isLoggedIn()) {
      return await this.removeUserList(listId, undefined, this.currentUser!.uid);
    }
  }

  /**
   * Legge l'elenco degli ID lista dell'utente autenticato
   */
  getUserLists(uid?: string) {
    if (uid || this.isLoggedIn()) {
      return collectionData(query(collection(this.firestore, CollectionEnum.MEMBERSHIPS), where('uid', '==', uid || this.currentUser!.uid))) as Observable<MembershipModel[]>
    }

    return undefined;
  }

  private async userInList(listId: string, uid: string) {
    return !(await getDocs(query(collection(this.firestore, CollectionEnum.MEMBERSHIPS), and(where('list.id', '==', listId), where('user.uid', '==', uid))))).empty;
  }

  private addToUserList(list: { name: string, id: string }, user: UserPartialModel, status: MembershipEnum, batch?: WriteBatch) {
    const m = doc(this.firestore, CollectionEnum.MEMBERSHIPS);
    if (batch) {
      if (status == MembershipEnum.ACCEPTED) {
        batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${user.uid}`), { listCount: increment(1) })
      }
      return batch.set(m, { list, user, status });
    } else {
      return setDoc(m, { list, user, status });
    }
  }

  private async updateListName(list: { name: string, id: string }, batch: WriteBatch) {
    const q = query(collection(this.firestore, CollectionEnum.MEMBERSHIPS), where('list.id', '==', list.id));
    (await getDocs(q)).forEach(
      d => batch.update(d.ref, { 'list.name': list.name })
    );
  }

  private async removeUserList(listId: string, batch?: WriteBatch, uid?: string,) {
    const q = uid ? query(collection(this.firestore, CollectionEnum.MEMBERSHIPS), and(where('list.id', '==', listId), where('list.uid', '==', uid))) : query(collection(this.firestore, `memberships`), where('list.id', '==', listId));
    (await getDocs(q)).forEach(async d => batch ? batch.delete(d.ref) : await deleteDoc(d.ref));
    if (batch) {
      batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`), { listCount: increment(-1) })
    }
  }

  private isLoggedIn() {
    if (!this.currentUser) throw new Error('Utente non autenticato.')
    return true;
  }


}
