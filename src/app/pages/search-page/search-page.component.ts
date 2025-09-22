import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, Location } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { map, of } from 'rxjs';
import { MovieListDynamicComponent } from '../../components/movie-list-dynamic/movie-list-dynamic.component';
import { TMDBService } from '../../services/tmdb.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-page',
  imports: [
    TranslateModule,
    IonFabButton,
    IonFab,
    IonInput,
    IonIcon,
    IonButton,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MovieListDynamicComponent,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
  animations: [
    trigger('showBackButton', [
      transition(':enter', [
        style({ transform: 'translateX(-120%)', opacity: 0 }),
        animate(
          '.2s ease-in',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate(
          '.2s ease-in',
          style({ transform: 'translateX(-120%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class SearchPageComponent {
  private route = inject(ActivatedRoute);
  tmdbService = inject(TMDBService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  searchQuery = signal<string | undefined>(undefined);
  currentPage = signal<number>(1);
  queryForm = new FormGroup({ query: new FormControl('') });
  location = inject(Location);

  private resultCriteria = computed(() => ({
    query: this.searchQuery(),
    page: this.currentPage(),
  }));

  private resultCriteriEff = effect(() => console.log(this.resultCriteria()));

  result = rxResource({
    request: this.resultCriteria,
    loader: ({ request: query }) => {
      if (!query.query) return of(undefined);
      return this.tmdbService.searchMovies(query.query!, query.page);
    },
  });

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const { query, ...req } = params;
        if (this.searchQuery() != query) {
          this.currentPage.set(1);
          this.searchQuery.set(query);
        }
        this.queryForm.get('query')!.setValue(query);
      });
  }

  search() {
    this.router.navigate([], {
      queryParams: { query: this.queryForm.get('query')!.value },
      replaceUrl: !!this.searchQuery(),
    });
  }

  navigateToGenre(genre: { id: string; name: string }) {
    this.router.navigate(['/discovery/movie'], {
      queryParams: { with_genres: genre.id, title: genre.name },
    });
  }

  get genres() {
    return this.tmdbService
      .getGenres()
      .pipe(map((genresArray) => Object.entries(genresArray)));
  }
}
