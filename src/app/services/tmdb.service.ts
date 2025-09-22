// src/app/services/tmdb.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiscoverMovieRequestModel } from '../models/discover-movie-request.model';
import { ImageModel } from '../models/image.model';
import { MovieModel } from '../models/movie.model';
import { SearchResultsModel } from '../models/search-results.model';
import { VideoModel } from '../models/video.model';
import { TvShowModel } from '../models/tv-show.model';
import { CreditModel } from '../models/credit.model';
import { ReviewModel } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class TMDBService {
  private genres?: { [key: number]: string };

  private params = new HttpParams().set('language', 'it');

  constructor(private http: HttpClient) {}

  /**
   * Cerca film per query (stringa)
   */
  searchMovies(
    query: string,
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params.set('query', query).set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(`${environment.apiUrl}/search/movie`, { params })
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((movie) => ({
            ...movie,
            type: 'movie',
          })),
        }))
      );
  }

  /**
   * Cerca film raccomandati
   */
  recommendedMovies(
    id: number,
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params.set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(
        environment.apiUrl + `/movie/${id}/recommendations`,
        { params }
      )
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((movie) => ({
            ...movie,
            type: 'movie',
          })),
        }))
      );
  }

  /**
   * Cerca film per query (stringa)
   */
  discoveryMovies(
    query: DiscoverMovieRequestModel,
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params
      .appendAll({ ...query })
      .set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(environment.apiUrl + '/discover/movie', {
        params,
      })
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((movie) => ({
            ...movie,
            type: 'movie',
          })),
        }))
      );
  }

  /**
   * Ottieni dettagli di un film per ID
   */
  getMovieDetails(
    movieId: number,
    full: boolean = false
  ): Observable<MovieModel> {
    let params = this.params.set('movie_id', movieId.toString());
    if (full) {
      params = params.set(
        'append_to_response',
        'recommendations,videos,credits,watch/providers'
      );
    }
    return this.http
      .get<MovieModel>(`${environment.apiUrl}/movie/${movieId}`, { params })
      .pipe(
        map(
          (movie) =>
            ({
              ...movie,
              providers: full
                ? (movie as any)['watch/providers'].results
                : undefined,
            } as MovieModel)
        )
      );
  }

  getMovieCollection(
    type: 'popular' | 'upcoming' | 'top_rated' | 'now_playing',
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params.set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(environment.apiUrl + '/movie/' + type, {
        params,
      })
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((movie) => ({
            ...movie,
            type: 'movie',
          })),
        }))
      );
  }

  /**
   * (Facoltativo) Ottieni video di un film per ID
   */
  getVideoOfMovie(
    id: number
  ): Observable<{ id: string; results: VideoModel[] }> {
    return this.http.get<{ id: string; results: VideoModel[] }>(
      `${environment.apiUrl}/movie/${id}/videos`,
      { params: this.params }
    );
  }

  /**
   * (Facoltativo) Ottieni immagini di un film per ID
   */
  getMovieImages(id: number): Observable<{
    id: string;
    posters: ImageModel[];
    logos: ImageModel[];
    backdrops: ImageModel[];
  }> {
    return this.http.get<{
      id: string;
      posters: ImageModel[];
      logos: ImageModel[];
      backdrops: ImageModel[];
    }>(`${environment.apiUrl}/movie/${id}/images`, { params: this.params });
  }

  getMovieCredits(id: number): Observable<CreditModel> {
    return this.http.get<CreditModel>(
      `${environment.apiUrl}/movie/${id}/credits`,
      { params: this.params }
    );
  }

  getMovieReviews(
    id: number,
    page: number = 1
  ): Observable<{
    id: number;
    page: number;
    results: ReviewModel[];
    total_pages: number;
    total_results: number;
  }> {
    return this.http.get<{
      id: number;
      page: number;
      results: ReviewModel[];
      total_pages: number;
      total_results: number;
    }>(`${environment.apiUrl}/movie/${id}/reviews`, { params: this.params });
  }

  getTvShowCollection(
    type: 'on_the_air' | 'airing_today' | 'popular' | 'top_rated',
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params.set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(environment.apiUrl + '/tv/' + type, { params })
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((movie) => ({
            ...movie,
            title: movie.name,
            type: 'tv',
          })),
        }))
      );
  }

  searchTvShow(
    query: string,
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params.set('query', query).set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(`${environment.apiUrl}/search/tv`, { params })
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((tv) => ({
            ...tv,
            title: tv.name,
            type: 'tv',
          })),
        }))
      );
  }

  /**
   * Cerca film raccomandati
   */
  recommendedTvShows(
    id: number,
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params.set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(`environment.apiUrl/tv/${id}/recommendations`, {
        params,
      })
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((movie) => ({
            ...movie,
            title: movie.name,
            type: 'tv',
          })),
        }))
      );
  }

  /**
   * Cerca film per query (stringa)
   */
  discoveryTvShows(
    query: DiscoverMovieRequestModel,
    page: number = 1
  ): Observable<SearchResultsModel> {
    const params = this.params
      .appendAll({ ...query })
      .set('page', page.toString());

    return this.http
      .get<SearchResultsModel>(environment.apiUrl + '/discover/tv', { params })
      .pipe(
        map((results) => ({
          ...results,
          results: results.results.map((movie) => ({
            ...movie,
            title: movie.name,
            type: 'tv',
          })),
        }))
      );
  }

  /**
   * Ottieni dettagli di un film per ID
   */
  getTvShowDetails(id: number): Observable<TvShowModel> {
    const params = this.params.set('series_id', id.toString());

    return this.http
      .get<TvShowModel>(`environment.apiUrl/tv/${id}`, { params })
      .pipe(
        map(
          (movie) =>
            ({
              ...movie,
              title: movie.name,
            } as TvShowModel)
        )
      );
  }
  getGenres(): Observable<{ [key: number]: string }> {
    if (!!this.genres) return of(this.genres);
    this.genres = {};
    return this.http
      .get<{ genres: { id: number; name: string }[] }>(
        environment.apiUrl + '/genre/movie/list',
        { params: this.params }
      )
      .pipe(
        tap((response) =>
          response.genres.map((genre) => (this.genres![genre.id] = genre.name))
        ),
        map(() => this.genres!),
        shareReplay()
      );
  }
}
