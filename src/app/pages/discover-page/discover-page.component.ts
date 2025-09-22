import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MovieListDynamicComponent } from '../../components/movie-list-dynamic/movie-list-dynamic.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TMDBService } from '../../services/tmdb.service';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DiscoverMovieRequestModel } from '../../models/discover-movie-request.model';
import { SearchResultsModel } from '../../models/search-results.model';
import { of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import {
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonFabList,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-discover-page',
  imports: [
    TranslateModule,
    TitleCasePipe,
    IonFabList,
    IonFabButton,
    IonFab,
    IonIcon,
    IonButton,
    MovieListDynamicComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './discover-page.component.html',
  styleUrl: './discover-page.component.scss',
})
export class DiscoverPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private discoverParams = signal<DiscoverMovieRequestModel | undefined>(
    undefined
  );
  tmdbService = inject(TMDBService);
  title = '';
  subject?: string;
  currentPage = signal<number>(1);

  private resultCriteria = computed(() => ({
    page: this.currentPage(),
    discoverParams: this.discoverParams(),
  }));

  result = rxResource({
    request: this.resultCriteria,
    loader: ({ request: query }) => {
      if (!query.discoverParams) return of(undefined);
      return this.tmdbService.discoveryMovies(query.discoverParams, query.page);
    },
  });
  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.title = params['title'] ?? '';
        this.subject = params['subject'];
        if (this.discoverParams() != params) {
          this.discoverParams.set(
            Object.keys(params).length > 0 ? params : undefined
          );
        }
      });
  }

  setOrderBy(sort_by: DiscoverMovieRequestModel['sort_by'] | undefined) {
    const queryParams: {
      sort_by: DiscoverMovieRequestModel['sort_by'] | undefined;
      'release_date.lte'?: string;
    } = { sort_by };
    if (sort_by === 'release_date.desc') {
      queryParams['release_date.lte'] = new Date().toISOString();
    } else {
      queryParams['release_date.lte'] = undefined;
    }
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
