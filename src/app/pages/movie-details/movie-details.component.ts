import { CommonModule, Location } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  model
} from '@angular/core';
import {
  rxResource,
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MatFabMenuComponent,
  MenuButton,
} from '../../components/mat-fab-menu/mat-fab-menu.component';
import { MovieHeroComponent } from "../../components/movie-hero/movie-hero.component";
import { MovieListComponent } from '../../components/movie-list/movie-list.component';
import { MovieListsDialogComponent } from '../../components/movie-lists-dialog/movie-lists-dialog.component';
import { MovieModel } from '../../models/movie.model';
import { TimePipe } from '../../pipes/time.pipe';
import { MovieListService } from '../../services/movie-list.service';
import { TMDBService } from '../../services/tmdb.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-movie-details',
  imports: [
    CommonModule,
    RouterModule,
    TimePipe,
    MovieListComponent,
    MatFabMenuComponent,
    MatIconModule,
    MatButtonModule,
    MovieHeroComponent
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private _sanitizer = inject(DomSanitizer);
  private _snackBar = inject(MatSnackBar);
  public location = inject(Location);
  private movieService = inject(MovieListService);
  private dialog = inject(MatDialog);
  isImgLoaded = false;
  isOverviewExpanded = false;
  isCastExpanded = false;
  tmdbService = inject(TMDBService);
  posterUrl = environment.posterUrl;

  movieId = model<number | undefined>(undefined);
  movie = rxResource({
    request: () => ({ id: this.movieId() }),
    loader: ({ request: { id } }) => {
      if (!id) return of(undefined);
      return this.tmdbService.getMovieDetails(id!).pipe(tap(console.log));
    },
  });
  recommendations = rxResource({
    request: () => ({ id: this.movieId() }),
    loader: ({ request: { id } }) => {
      if (!id) return of(undefined);
      return this.tmdbService.recommendedMovies(id!);
    },
  });
  trailer = rxResource({
    request: () => ({ id: this.movieId() }),
    loader: ({ request: { id } }) => {
      if (!id) return of(undefined);
      return this.tmdbService
        .getVideoOfMovie(id!)
        .pipe()
        .pipe(
          map((res) => {
            const trailer = res.results.find(
              (video) => video.type === 'Trailer' && video.site === 'YouTube'
            );
            return trailer
              ? this._sanitizer.bypassSecurityTrustResourceUrl(
                `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1&showinfo=0`
              )
              : undefined;
          })
        );
    },
  });
  credits = rxResource({
    request: () => ({ id: this.movieId() }),
    loader: ({ request: { id } }) => {
      if (!id) return of(undefined);
      return this.tmdbService.getMovieCredits(id!);
    },
  });
  cast = computed(() => this.credits.value()?.cast);
  director = computed(() =>
    this.credits.value()?.crew.find((m) => m.job === 'Director')
  );
  images = rxResource({
    request: () => ({ id: this.movieId() }),
    loader: ({ request: { id } }) => {
      if (!id) return of(undefined);
      return this.tmdbService.getMovieImages(id!);
    },
  });
  backgroundImg = computed(() => {
    if (this.images.hasValue()) {
      const images = this.images.value();
      if (images.backdrops.length > 0) {
        return { ...images.backdrops[0], file_path: environment.posterUrl + images.backdrops[0].file_path };
      }
    }
    return undefined;
  });
  reviews = rxResource({
    request: () => ({ id: this.movieId() }),
    loader: ({ request: { id } }) => {
      if (!id) return of(undefined);
      return this.tmdbService.getMovieReviews(id!);
    },
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        this.movieId.set(id ? +id : undefined);
      });
  }

  getMenuButtons(movie: MovieModel, movieInList?: MovieModel): MenuButton[] {
    const buttons: MenuButton[] = [];
    if (!movieInList) {
      buttons.push({
        icon: 'add',
        name: 'Aggiungi',
        fn: () => this.addMovieToList(movie),
      });
    } else {
      if (!movieInList.watched) {
        buttons.push({
          icon: 'check',
          name: 'Segna come visto',
          fn: () => this.setAsWatched(movie),
        });
      }
      buttons.push({
        icon: 'delete',
        name: 'Rimuovi',
        fn: () => this.removeMovieFromList(movie),
      });
    }
    return buttons;
  }

  addMovieToList(movie: MovieModel): void {
    movie.genre_ids = movie.genre_ids || movie.genres?.map((g) => g.id) || [];
    this.movieService
      .addMovie(movie)
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

  removeMovieFromList(movie: MovieModel): void {
    this.movieService
      .removeMovie(movie.id)
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

  setAsWatched(movie: MovieModel): void {
    this.movieService
      .setMovieAsWatched(movie.id)
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

  openListDialog(): void {
    const dialogRef = this.dialog.open(MovieListsDialogComponent, {
      width: "90%",
      maxWidth: "400px",
      data: {
        movie: this.movie.value(),
      },
    });
  }
}
