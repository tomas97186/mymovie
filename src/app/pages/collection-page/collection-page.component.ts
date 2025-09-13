import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { MovieListDynamicComponent } from "../../components/movie-list-dynamic/movie-list-dynamic.component";
import { MovieListComponent } from "../../components/movie-list/movie-list.component";
import { SearchResultsModel } from '../../models/search-results.model';
import { TMDBService } from '../../services/tmdb.service';

@Component({
  selector: 'app-collection-page',
  imports: [MovieListDynamicComponent],
  templateUrl: './collection-page.component.html',
  styleUrl: './collection-page.component.scss'
})
export class CollectionPageComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  tmdbService = inject(TMDBService);

  collectionType = signal<'popular' | 'upcoming' | 'top_rated' | 'now_playing' | 'on_the_air' | 'airing_today' | undefined>(undefined);
  mediaType = signal<'tv' | 'movie' | undefined>(undefined);
  currentPage = signal<number>(1);
  collectionTitle = {
    'popular': 'Popolari',
    'upcoming': 'Prossimamente',
    'top_rated': 'Più Votati',
    'now_playing': 'Ultime Uscite',
    'on_the_air': 'In Onda',
    'airing_today': 'In Onda Oggi'
  }

  resultCriteria = computed(() => ({ type: this.collectionType(), media: this.mediaType(), page: this.currentPage() }))

  result = rxResource<SearchResultsModel, { type: 'popular' | 'upcoming' | 'top_rated' | 'now_playing' | 'on_the_air' | 'airing_today' | undefined, media: 'tv' | 'movie' | undefined, page: number }>({
    request: this.resultCriteria,
    loader: ({ request: query }) => {
      if (!query.type) query.type = 'popular';
      if (query.media === 'movie') {
        return this.tmdbService.getMovieCollection(query.type as 'popular' | 'upcoming' | 'top_rated' | 'now_playing', query.page)
      }
      else {
        return this.tmdbService.getTvShowCollection(query.type as 'on_the_air' | 'airing_today' | 'popular' | 'top_rated', query.page);
      }

    }
  });
  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const type = params.get('type');
      const media = params.get('media');
      this.mediaType.set(media as 'tv' | 'movie');
      if (media === 'movie') {
        if (!type || !['popular', 'upcoming', 'top_rated', 'now_playing'].includes(type)) {
          this.collectionType.set(undefined);
        } else {
          this.collectionType.set(type as 'popular' | 'upcoming' | 'top_rated' | 'now_playing');
        }
      } else if (media === 'tv') {
        if (!type || !['on_the_air', 'airing_today', 'popular', 'top_rated'].includes(type)) {
          this.collectionType.set(undefined);
        } else {
          this.collectionType.set(type as 'on_the_air' | 'airing_today' | 'popular' | 'top_rated');
        }

      }
    });
  }
}
