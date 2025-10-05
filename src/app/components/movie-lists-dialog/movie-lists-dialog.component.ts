import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { filter, firstValueFrom, from, map, shareReplay } from 'rxjs';
import { SearchItemModel } from 'src/app/models/search-item.model';
import { ToastService } from 'src/app/services/toast.service';
import { MovieStatusEnum } from '../../enum/movie-status.enum';
import { MovieModel } from '../../models/movie.model';
import { MovieListService } from '../../services/movie-list.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembershipEnum } from 'src/app/enum/membership.enum';

@Component({
  selector: 'app-movie-lists-dialog',
  imports: [
    TranslateModule,
    IonListHeader,
    IonButtons,
    IonLabel,
    IonItem,
    IonList,
    IonContent,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './movie-lists-dialog.component.html',
  styleUrl: './movie-lists-dialog.component.scss',
})
export class MovieListsDialogComponent {
  private readonly MESSAGE_LABELS = 'dialogs.movieMenu.messages.';

  readonly dialogRef = inject(ModalController);

  movie = input.required<MovieModel>();
  lists = input<Set<string>>();
  showName = input<boolean>(false);

  private _snackBar = inject(ToastService);
  private listService = inject(MovieListService);
  private translate = inject(TranslateService);

  movieStatusEnum = MovieStatusEnum;

  userLists$ = this.listService.getUserLists()?.pipe(
    map((res) =>
      res
        .filter((m) => m.status === MembershipEnum.ACCEPTED)
        .map((l) => ({
          listInfo: l.list,
          movieStatus: this.listService.movieStatus(this.movie().id, l.list.id),
        }))
    )
  );

  close(): void {
    this.dialogRef.dismiss();
  }

  addMovieToList(movie: MovieModel, listId: string): void {
    movie.genre_ids = movie.genre_ids || movie.genres?.map((g) => g.id) || [];
    this.listService
      .addMovie((<unknown>movie) as SearchItemModel, listId)
      .then(() => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'aggiungi.successo'),
          {
            duration: 3000,
            icon: 'checkmark',
          }
        );
      })
      .catch((error) => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'aggiungi.errore'),
          {
            duration: 3000,
          }
        );
        console.error("Errore nell'aggiungere il film alla lista:", error);
      });
  }

  removeMovieFromList(movie: MovieModel, listId: string): void {
    this.listService
      .removeMovie(movie.id, listId)
      .then(() => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'rimuovi.successo'),
          {
            duration: 3000,
          }
        );
      })
      .catch((error) => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'rimuovi.errore'),
          {
            duration: 3000,
          }
        );
        console.error('Errore nel rimuovere il film alla lista:', error);
      });
  }

  setAsWatched(movie: MovieModel, listId: string): void {
    this.listService
      .setMovieAsWatched(movie.id, listId)
      .then(() => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'visto.successo'),
          {
            duration: 3000,
          }
        );
      })
      .catch((error) => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'visto.errore'),
          {
            duration: 3000,
          }
        );
        console.error('Errore nel segnare il film come visto', error);
      });
  }

  movieIsWatched(movieId: number, listId: string) {
    return this.listService.movieStatus(movieId, listId).pipe(
      map((res) => res === MovieStatusEnum.WATCHED),
      shareReplay()
    );
  }
}
