import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  and,
  collection,
  collectionData,
  count,
  deleteDoc,
  deleteField,
  doc,
  docData,
  Firestore,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  WriteBatch,
} from '@angular/fire/firestore';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { CollectionEnum } from '../enum/collection.enum';
import { MembershipEnum } from '../enum/membership.enum';
import { MovieStatusEnum } from '../enum/movie-status.enum';
import { MembershipModel } from '../models/membership.model';
import { InfoListModel } from '../models/movie-list.model';
import { SearchItemModel } from '../models/search-item.model';
import { UserPartialModel } from '../models/user.partial.model';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class MovieListService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  /**
   * Crea una nuova lista con nome e film iniziali
   */
  async createList(name: string, privateList: boolean = true) {
    if (this.userService.isLoggedIn()) {
      const batch = writeBatch(this.firestore);
      const listRef = doc(collection(this.firestore, CollectionEnum.LISTS));

      batch.set(listRef, {
        name,
        privateList,
        createdBy: this.userService.currentUser!.uid,
        watchedMovies: 0,
        moviesCount: 0,
        membersCount: 1,
      });
      this.addToUserList(
        { name, id: listRef.id },
        this.userService.userInfo!,
        MembershipEnum.ACCEPTED,
        batch
      );

      return batch.commit();
    }
  }

  /**
   * Elimina una lista
   */
  async deleteList(listId: string) {
    const batch = writeBatch(this.firestore);

    batch.delete(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`));
    await this.removeUserList(listId, batch, this.userService.currentUser!.uid);
    return batch.commit();
  }

  // /**
  //  * Modifica il nome di una lista
  //  */
  async changeListName(name: string, listId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), {
      name,
    });
    await this.updateListName({ name, id: listId }, batch);

    return batch.commit();
  }

  // /**
  //  * Legge le info di una lista (solo se l'utente è membro)
  //  */
  getListInfo(listId: string): Observable<InfoListModel> {
    return docData(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), {
      idField: 'id',
    }).pipe(tap(console.log)) as Observable<InfoListModel>;
  }

  /**
   * Modifica il contenuto dei film della lista di cui l'utente è membro
   */
  async addMovie(newMovie: SearchItemModel, listId: string) {
    if (this.userService.isLoggedIn()) {
      const batch = writeBatch(this.firestore);
      // const movieRef = doc(this.firestore, `${CollectionEnum.MOVIES}/${newMovie.id}`);
      const listRef = doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`);

      // batch.set(movieRef, newMovie);
      batch.set(
        doc(
          this.firestore,
          `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${newMovie.id}`
        ),
        {
          listId: listId,
          movie: {
            id: newMovie.id,
            title: newMovie.title,
            poster_path: newMovie.poster_path,
          },
          addedDate: new Date().toISOString(),
          addedBy: this.userService.currentUser!.uid,
          watched: false,
        }
      );
      batch.set(
        doc(
          this.firestore,
          `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/toWatch`
        ),
        { [newMovie.id]: newMovie.poster_path },
        { merge: true }
      );
      batch.update(listRef, { moviesCount: increment(1) });
      // batch.set(doc(this.firestore, `${CollectionEnum.MOVIES}/${newMovie.id}/${CollectionEnum.LISTS}/${listId}`), { list: listRef });
      await batch.commit();
    }
  }

  // /**
  //  * Aggiunge l'utente autenticato come membro a una lista esistente
  //  */
  async joinList(listId: string): Promise<boolean> {
    if (this.userService.isLoggedIn()) {
      const batch = writeBatch(this.firestore);
      const listRef = doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`);
      const list = await getDoc(listRef);

      if (list.exists()) {
        throw new Error(`Lista ${listId} non esistente.`);
      }

      this.addToUserList(
        { id: listId, name: list.get('name') },
        {
          uid: this.userService.currentUser!.uid,
          username: this.userService.currentUser?.displayName!,
        },
        MembershipEnum.ACCEPTED,
        batch
      );
      batch.set(
        doc(
          this.firestore,
          `${CollectionEnum.LISTS}/${listRef.id}/members/${
            this.userService.currentUser!.uid
          }`
        ),
        {
          status: 'accepted',
          uid: this.userService.currentUser!.uid,
          username: this.userService.currentUser!.displayName,
        }
      );
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
    if (this.userService.isLoggedIn()) {
      return this.removeUser(listId, this.userService.currentUser!.uid);
    }
  }

  async removeUser(listId: string, userUid: string) {
    const batch = writeBatch(this.firestore);

    await this.removeUserList(listId, batch, userUid);
    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), {
      membersCount: increment(-1),
    });
    return batch.commit();
  }

  // /**
  //  * Modifica il contenuto dei film della lista di cui l'utente è membro
  //  */
  async removeMovie(id: number, listId?: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    const movieRef = doc(
      this.firestore,
      `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${id}`
    );

    const movie = await getDoc(movieRef);

    if (movie.get('watched')) {
      batch.update(
        doc(
          this.firestore,
          `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/watched`
        ),
        { [id]: deleteField() }
      );
    } else {
      batch.update(
        doc(
          this.firestore,
          `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/toWatch`
        ),
        { [id]: deleteField() }
      );
    }

    batch.delete(movieRef);
    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), {
      moviesCount: increment(-1),
      watchedMovies: increment(movie.get('watched') ? -1 : 0),
    });

    return batch.commit();
  }

  // /**
  //  * Modifica il contenuto dei film della lista di cui l'utente è membro
  //  */
  async setMovieAsWatched(id: number, listId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    const movieRef = doc(
      this.firestore,
      `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${id}`
    );

    const movie = await getDoc(movieRef);

    batch.update(movieRef, {
      watched: true,
      watchedDate: new Date().toISOString(),
    });
    batch.update(doc(this.firestore, `${CollectionEnum.LISTS}/${listId}`), {
      watchedMovies: increment(1),
    });
    batch.update(
      doc(
        this.firestore,
        `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/toWatch`
      ),
      { [id]: deleteField() }
    );
    batch.set(
      doc(
        this.firestore,
        `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/watched`
      ),
      { [id]: movie.get('movie.poster_path') },
      { merge: true }
    );
    return batch.commit();
  }

  async getMovieFromList(id: number, listId: string) {
    return docData(
      doc(
        this.firestore,
        `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${id}`
      )
    ) as Observable<SearchItemModel>;
  }

  // /**
  //  * Legge i film di una lista (solo se l'utente è membro)
  //  */
  getUserReviews(uid?: string, like = false) {
    uid ??= this.userService.currentUser?.uid;
    return (
      docData(
        doc(
          this.firestore,
          `${CollectionEnum.USERS}/${uid}/${like ? 'likes' : 'dislikes'}/1`
        )
      ) as Observable<{ [key: string]: string }>
    ).pipe(
      map<{ [key: string]: string }, SearchItemModel[]>((res) =>
        res
          ? Object.entries(res).map<SearchItemModel>(
              ([id, poster_path]) =>
                ({
                  id: +id,
                  poster_path,
                } as unknown as SearchItemModel)
            )
          : []
      )
    );
  }

  async getMovieReviews(
    movieId: number
  ): Promise<{ likes: number; dislikes: number }> {
    const collRef = collection(this.firestore, CollectionEnum.REVIEWS);
    return {
      likes: (
        await getCountFromServer(
          query(collRef, and(where('movie.id', '==', movieId)))
        )
      ).data().count,
      dislikes: (
        await getCountFromServer(
          query(
            collRef,
            and(where('movie.id', '==', movieId), where('review', '==', -1))
          )
        )
      ).data().count,
    };
  }

  reviewMovie(movie: { id: string; poster_path: string }, review: -1 | 1) {
    const batch = writeBatch(this.firestore);
    const userRef = doc(
      this.firestore,
      `${CollectionEnum.USERS}/${this.userService.currentUser!.uid}`
    );

    batch.set(doc(collection(this.firestore, CollectionEnum.REVIEWS)), {
      review,
      user: this.userService.currentUser!.uid,
      movie: movie,
    });

    if (review === -1) {
      batch.update(userRef, { dislikedMovies: increment(1) });
      batch.set(
        doc(
          this.firestore,
          `${CollectionEnum.USERS}/${
            this.userService.currentUser!.uid
          }/dislikes/1`
        ),
        { [movie.id]: movie.poster_path },
        { merge: true }
      );
    } else {
      batch.update(userRef, { likedMovies: increment(1) });
      batch.set(
        doc(
          this.firestore,
          `${CollectionEnum.USERS}/${this.userService.currentUser!.uid}/likes/1`
        ),
        { [movie.id]: movie.poster_path },
        { merge: true }
      );
    }

    return batch.commit();
  }

  movieStatus(id: number, listId?: string) {
    const movie = doc(
      this.firestore,
      `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${id}`
    );

    return docData(movie).pipe(
      map((res) => {
        if (!res) {
          return MovieStatusEnum.NOT_IN_LIST;
        } else {
          return res['watched']
            ? MovieStatusEnum.WATCHED
            : MovieStatusEnum.TO_WATCH;
        }
      })
    );
  }

  // /**
  //  * Legge i film di una lista (solo se l'utente è membro)
  //  */
  getListMovies(listId: string, watched = false) {
    return (
      docData(
        doc(
          this.firestore,
          `${CollectionEnum.LISTS}/${listId}/${CollectionEnum.MOVIES}/${
            watched ? 'watched' : 'toWatch'
          }`
        )
      ) as Observable<{ [key: string]: string }>
    ).pipe(
      map<{ [key: string]: string }, SearchItemModel[]>((res) =>
        res
          ? Object.entries(res).map<SearchItemModel>(
              ([id, poster_path]) =>
                ({
                  id: +id,
                  poster_path,
                  watched: watched,
                } as unknown as SearchItemModel)
            )
          : []
      )
    );
  }

  // /**
  //  * Legge i memberi di una lista (solo se l'utente è membro)
  //  */
  getListMembers(listId: string) {
    return collectionData(
      query(
        collection(this.firestore, `${CollectionEnum.MEMBERSHIPS}`),
        where('list.id', '==', listId)
      )
    ) as Observable<MembershipModel[]>;
  }

  // /**
  //  * Aggiunge l'utente autenticato come membro a una lista esistente
  //  */
  async inviteToList(listId: string, username: string): Promise<boolean> {
    const user = await this.userService.userExists(username);
    if (!user) {
      return false;
    }
    const uid = user.uid;

    if (await this.userInList(listId, uid)) {
      return false; // L'utente è già in lista.
    }

    const list = await firstValueFrom(this.getListInfo(listId));

    await this.addToUserList(
      { id: listId, name: list.name },
      { uid: uid, username: username },
      MembershipEnum.PENDING
    );

    return true;
  }

  async acceptListInvitation(invitationId: string) {
    return updateDoc(
      doc(this.firestore, `${CollectionEnum.MEMBERSHIPS}/${invitationId}`),
      { status: 'accepted' }
    );
  }

  async declineListInvitation(listId: string): Promise<void> {
    if (this.userService.isLoggedIn()) {
      return await this.removeUserList(
        listId,
        undefined,
        this.userService.currentUser!.uid
      );
    }
  }

  /**
   * Legge l'elenco degli ID lista dell'utente autenticato
   */
  getUserLists(uid?: string) {
    if (uid || this.userService.isLoggedIn()) {
      return collectionData(
        query(
          collection(this.firestore, CollectionEnum.MEMBERSHIPS),
          where('user.uid', '==', uid || this.userService.currentUser!.uid)
        ),
        { idField: 'id' }
      ) as Observable<MembershipModel[]>;
    }

    return undefined;
  }

  private async userInList(listId: string, uid: string) {
    return !(
      await getDocs(
        query(
          collection(this.firestore, CollectionEnum.MEMBERSHIPS),
          and(where('list.id', '==', listId), where('user.uid', '==', uid))
        )
      )
    ).empty;
  }

  private addToUserList(
    list: { name: string; id: string },
    user: UserPartialModel,
    status: MembershipEnum,
    batch?: WriteBatch
  ) {
    const m = doc(collection(this.firestore, CollectionEnum.MEMBERSHIPS));
    if (batch) {
      if (status == MembershipEnum.ACCEPTED) {
        batch.update(
          doc(this.firestore, `${CollectionEnum.USERS}/${user.uid}`),
          { listCount: increment(1) }
        );
      }
      return batch.set(m, { list, user, status });
    } else {
      return setDoc(m, { list, user, status });
    }
  }

  private async updateListName(
    list: { name: string; id: string },
    batch: WriteBatch
  ) {
    const q = query(
      collection(this.firestore, CollectionEnum.MEMBERSHIPS),
      where('list.id', '==', list.id)
    );
    (await getDocs(q)).forEach((d) =>
      batch.update(d.ref, { 'list.name': list.name })
    );
  }

  private async removeUserList(
    listId: string,
    batch?: WriteBatch,
    uid?: string
  ) {
    const q = uid
      ? query(
          collection(this.firestore, CollectionEnum.MEMBERSHIPS),
          and(where('list.id', '==', listId), where('user.uid', '==', uid))
        )
      : query(
          collection(this.firestore, CollectionEnum.MEMBERSHIPS),
          where('list.id', '==', listId)
        );
    (await getDocs(q)).forEach(async (d) =>
      batch ? batch.delete(d.ref) : await deleteDoc(d.ref)
    );
    if (batch) {
      batch.update(doc(this.firestore, `${CollectionEnum.USERS}/${uid}`), {
        listCount: increment(-1),
      });
    }
  }
}
