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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ActivatedRoute,
  EventType,
  Router,
  RouterModule,
} from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subscription, tap } from 'rxjs';
import { ProviderModel } from 'src/app/models/provider.model';
import { ToastService } from 'src/app/services/toast.service';
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
    TranslateModule,
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
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private _sanitizer = inject(DomSanitizer);
  public location = inject(Location);
  private dialog = inject(ModalController);
  private eventSub?: Subscription;
  isImgLoaded = false;
  isOverviewExpanded = false;
  isCastExpanded = false;
  tmdbService = inject(TMDBService);
  posterUrl = environment.posterUrl;

  movieId = model<number | undefined>(undefined);
  isInModal = input<boolean>(false);
  movie = rxResource<MovieModel | undefined, { id: number | undefined }>({
    request: () => ({ id: this.movieId() }),
    loader: ({ request: { id } }) => {
      if (!id) return of(undefined);
      return this.tmdbService.getMovieDetails(id!, true);
    },
  });
  recommendations = computed(() => this.movie.value()?.recommendations);
  trailer = computed(() => {
    const trailer = this.movie
      .value()
      ?.videos?.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );
    return trailer
      ? this._sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1&showinfo=0`
      )
      : undefined;
  });
  cast = computed(() => this.movie.value()?.credits?.cast);
  director = computed(() =>
    this.movie.value()?.credits?.crew.find((m) => m.job === 'Director')
  );
  providers = computed(() => {
    const providers = this.movie.value()?.providers['IT'];
    const res: { [key: string]: ProviderModel } = {};
    for (const p of providers?.flatrate ?? []) {
      res[p.provider_id] = { ...p, type: ['flatrate'] };
    }
    for (const p of providers?.buy ?? []) {
      if (!(p.provider_id in res)) {
        res[p.provider_id] = { ...p, type: [] };
      }
      res[p.provider_id].type.push('buy');
    }
    for (const p of providers?.rent ?? []) {
      if (!(p.provider_id in res)) {
        res[p.provider_id] = { ...p, type: [] };
      }
      res[p.provider_id].type.push('rent');
    }

    return Object.values(res).sort(p => p.display_priority);
  });

  ngOnInit() {
    this.eventSub = this.router.events.subscribe({
      next: (e) => {
        if (e.type === EventType.NavigationStart && this.isInModal()) {
          this.dialog.dismiss();
        }
      },
    });
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.movieId.set(+id);
        }
      });
  }

  ngOnDestroy() {
    this.eventSub?.unsubscribe();
  }

  dismissIfInModal() {
    if (this.isInModal()) {
      this.dialog.dismiss();
    }
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
      expandToScroll: false,

    });
    dialogRef.present();
  }
}
