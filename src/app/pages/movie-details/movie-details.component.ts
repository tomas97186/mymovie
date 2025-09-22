import { CommonModule, Location } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from 'src/app/services/toast.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ModalController,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBackButton,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovieHeroComponent } from '../../components/movie-hero/movie-hero.component';
import { MovieListComponent } from '../../components/movie-list/movie-list.component';
import { MovieListsDialogComponent } from '../../components/movie-lists-dialog/movie-lists-dialog.component';
import { MovieModel } from '../../models/movie.model';
import { TimePipe } from '../../pipes/time.pipe';
import { MovieListService } from '../../services/movie-list.service';
import { TMDBService } from '../../services/tmdb.service';

@Component({
  selector: 'app-movie-details',
  imports: [
    IonSpinner,
    IonButton,
    IonBackButton,
    IonFab,
    IonIcon,
    IonFabButton,
    CommonModule,
    RouterModule,
    TimePipe,
    MovieListComponent,
    MatIconModule,
    MatButtonModule,
    MovieHeroComponent,
    MatProgressSpinnerModule,
    IonContent,
    IonBackButton,
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private _sanitizer = inject(DomSanitizer);
  private _snackBar = inject(ToastService);
  public location = inject(Location);
  private movieService = inject(MovieListService);
  private dialog = inject(ModalController);
  isImgLoaded = false;
  isOverviewExpanded = false;
  isCastExpanded = false;
  tmdbService = inject(TMDBService);
  posterUrl = environment.posterUrl;

  movieId = model<number | undefined>(undefined);
  isInModal = input<boolean>(false);
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
        return {
          ...images.backdrops[0],
          file_path: environment.posterUrl + images.backdrops[0].file_path,
        };
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
        if (id) {
          this.movieId.set(+id);
        }
      });
  }

  removeMovieFromList(movie: MovieModel): void {
    this.movieService
      .removeMovie(movie.id)
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

  setAsWatched(movie: MovieModel): void {
    this.movieService
      .setMovieAsWatched(movie.id)
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

  closePage() {
    if (this.isInModal()) {
      this.dialog.dismiss();
    } else {
      this.location.back();
    }
  }

  async openListDialog() {
    const dialogRef = await this.dialog.create({
      component: MovieListsDialogComponent,
      componentProps: { movie: this.movie.value() },
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.25, 0.5],
    });
    dialogRef.present();
  }
}
