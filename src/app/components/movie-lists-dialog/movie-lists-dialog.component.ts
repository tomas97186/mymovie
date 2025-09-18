import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem, IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import { map, shareReplay } from 'rxjs';
import { SearchItemModel } from 'src/app/models/search-item.model';
import { ToastService } from 'src/app/services/toast.service';
import { MovieStatusEnum } from '../../enum/movie-status.enum';
import { MovieModel } from '../../models/movie.model';
import { MovieListService } from '../../services/movie-list.service';

@Component({
  selector: 'app-movie-lists-dialog',
  imports: [IonListHeader, IonButtons, IonLabel, IonItem, IonList, IonContent, 
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

  private _snackBar = inject(ToastService);
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
        this._snackBar.open('Film aggiunto alla lista con successo', {
          duration: 3000,
          icon: 'checkmark'
        });
      })
      .catch((error) => {
        this._snackBar.open(
          "Errore nell'aggiungere il film alla lista",
         
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
        this._snackBar.open('Film rimosso dalla lista.', {
          duration: 3000,
        });
      })
      .catch((error) => {
        this._snackBar.open(
          'Errore nel rimuover il film alla lista',
         
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
        this._snackBar.open('Film segnato come visto.', {
          duration: 3000,
        });
      })
      .catch((error) => {
        this._snackBar.open(
          'Errore! Impossibile segnare il film come visto.',
         
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
