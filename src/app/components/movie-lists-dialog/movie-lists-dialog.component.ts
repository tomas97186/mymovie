import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, shareReplay, tap } from 'rxjs';
import { MovieModel } from '../../models/movie.model';
import { MovieListService } from '../../services/movie-list.service';
import { MovieStatusEnum } from '../../enum/movie-status.enum';
import { RouterModule } from '@angular/router';
import { SearchItemModel } from 'src/app/models/search-item.model';
import {
  ModalController,
  IonIcon,
  IonButton,
  IonToolbar,
  IonHeader,
  IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-movie-lists-dialog',
  imports: [IonLabel, IonItem, IonList, IonContent, 
    IonTitle,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  templateUrl: './movie-lists-dialog.component.html',
  styleUrl: './movie-lists-dialog.component.scss',
})
export class MovieListsDialogComponent {
  readonly dialogRef = inject(ModalController);

  movie = input.required<MovieModel>();
  lists = input<Set<string>>();

  private _snackBar = inject(MatSnackBar);
  private listService = inject(MovieListService);
  private destroyRef = inject(DestroyRef);

  movieStatusEnum = MovieStatusEnum;

  userLists$ = this.listService.getUserLists().pipe(
    map((listId) =>
      listId.map((id) => ({
        listInfo: this.listService.getListInfo(id),
        movieStatus: this.listService.movieStatus(this.movie().id, id),
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
        this._snackBar.open('Film aggiunto alla lista con successo', 'Chiudi', {
          duration: 3000,
        });
      })
      .catch((error) => {
        this._snackBar.open(
          "Errore nell'aggiungere il film alla lista",
          'Chiudi',
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
        this._snackBar.open('Film rimosso dalla lista.', 'Chiudi', {
          duration: 3000,
        });
      })
      .catch((error) => {
        this._snackBar.open(
          'Errore nel rimuover il film alla lista',
          'Chiudi',
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
        this._snackBar.open('Film segnato come visto.', 'Chiudi', {
          duration: 3000,
        });
      })
      .catch((error) => {
        this._snackBar.open(
          'Errore! Impossibile segnare il film come visto.',
          'Chiudi',
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
