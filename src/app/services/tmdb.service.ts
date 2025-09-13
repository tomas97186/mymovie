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
  providedIn: 'root'
})
export class TMDBService {
  private posterUrl = 'https://image.tmdb.org/t/p/original';
  private sessionToken?: string;
  private accountId?: string;
  private genres?: { [key: number]: string };

  private params = new HttpParams()
    .set('language', 'it');

  constructor(private http: HttpClient) { }

  /**
   * Cerca film per query (stringa)
   */
  searchMovies(query: string, page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', '/search/movie').set('query', query).set('page', page.toString());

    return this.http.get<SearchResultsModel>(`${environment.apiUrl}`, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(movie => ({
          ...movie,
          type: 'movie',
          poster_path: environment.posterUrl + movie.poster_path
        }))
      }))
    );
  }


  /**
   * Cerca film raccomandati
   */
  recommendedMovies(id: number, page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', `/movie/${id}/recommendations`).set('page', page.toString());

    return this.http.get<SearchResultsModel>(environment.apiUrl, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(movie => ({
          ...movie,
          type: 'movie',
          poster_path: environment.posterUrl + movie.poster_path
        }))
      }))
    );
  }

  /**
   * Cerca film per query (stringa)
   */
  discoveryMovies(query: DiscoverMovieRequestModel, page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', '/discover/movie').appendAll({ ...query }).set('page', page.toString());

    return this.http.get<SearchResultsModel>(environment.apiUrl, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(movie => ({
          ...movie,
          type: 'movie',
          poster_path: environment.posterUrl + movie.poster_path
        }))
      }))
    );
  }

  /**
   * Ottieni dettagli di un film per ID
   */
  getMovieDetails(movieId: number): Observable<MovieModel> {
    const params = this.params.set('path', `/movie/${movieId}`).set('movie_id', movieId.toString());

    return this.http.get<MovieModel>(environment.apiUrl, { params }).pipe(
      map(movie => ({ ...movie, poster_path: environment.posterUrl + movie.poster_path, backdrop_path: environment.posterUrl + movie.backdrop_path }) as MovieModel)
    );
  }

  getMovieCollection(type: 'popular' | 'upcoming' | 'top_rated' | 'now_playing', page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', '/movie/' + type).set('page', page.toString());

    return this.http.get<SearchResultsModel>(environment.apiUrl, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(movie => ({
          ...movie,
          type: 'movie',
          poster_path: environment.posterUrl + movie.poster_path
        }))
      })));
  }

  /**
   * (Facoltativo) Ottieni video di un film per ID
   */
  getVideoOfMovie(id: number): Observable<{ id: string, results: VideoModel[] }> {
    const params = this.params.set('path', `/movie/${id}/videos`);

    return this.http.get<{ id: string, results: VideoModel[] }>(environment.apiUrl, { params });
  }

  /**
   * (Facoltativo) Ottieni immagini di un film per ID
   */
  getMovieImages(id: number): Observable<{ id: string, posters: ImageModel[], logos: ImageModel[], backdrops: ImageModel[] }> {
    const params = this.params.set('path', `/movie/${id}/images`);

    return this.http.get<{ id: string, posters: ImageModel[], logos: ImageModel[], backdrops: ImageModel[] }>(environment.apiUrl, { params });
  }

  getMovieCredits(id: number): Observable<CreditModel> {
    const params = this.params.set('path', `/movie/${id}/credits`);
    return this.http.get<CreditModel>(environment.apiUrl, { params });
  }

  getMovieReviews(id: number, page: number = 1): Observable<{ id: number, page: number, results: ReviewModel[], total_pages: number, total_results: number }> {
    const params = new HttpParams().set('path', `/movie/${id}/reviews`);
    return this.http.get<{ id: number, page: number, results: ReviewModel[], total_pages: number, total_results: number }>(environment.apiUrl, { params });
  }


  getTvShowCollection(type: 'on_the_air' | 'airing_today' | 'popular' | 'top_rated', page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', '/tv/' + type).set('page', page.toString());

    return this.http.get<SearchResultsModel>(environment.apiUrl, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(movie => ({
          ...movie,
          title: movie.name,
          type: 'tv',
          poster_path: environment.posterUrl + movie.poster_path
        }))
      })));
  }

  searchTvShow(query: string, page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', '/search/tv').set('query', query).set('page', page.toString());

    return this.http.get<SearchResultsModel>(`${environment.apiUrl}`, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(tv => ({
          ...tv,
          title: tv.name,
          type: 'tv',
          poster_path: environment.posterUrl + tv.poster_path
        }))
      }))
    );
  }


  /**
   * Cerca film raccomandati
   */
  recommendedTvShows(id: number, page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', `/tv/${id}/recommendations`).set('page', page.toString());

    return this.http.get<SearchResultsModel>(environment.apiUrl, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(movie => ({
          ...movie,
          title: movie.name,
          type: 'tv',
          poster_path: environment.posterUrl + movie.poster_path
        }))
      }))
    );
  }

  /**
   * Cerca film per query (stringa)
   */
  discoveryTvShows(query: DiscoverMovieRequestModel, page: number = 1): Observable<SearchResultsModel> {
    const params = this.params.set('path', '/discover/tv').appendAll({ ...query }).set('page', page.toString());

    return this.http.get<SearchResultsModel>(environment.apiUrl, { params }).pipe(
      map(results => ({
        ...results,
        results: results.results.map(movie => ({
          ...movie,
          title: movie.name,
          type: 'tv',
          poster_path: environment.posterUrl + movie.poster_path
        }))
      }))
    );
  }

  /**
   * Ottieni dettagli di un film per ID
   */
  getTvShowDetails(id: number): Observable<TvShowModel> {
    const params = this.params.set('path', `/tv/${id}`).set('series_id', id.toString());

    return this.http.get<TvShowModel>(environment.apiUrl, { params }).pipe(
      map(movie => ({ ...movie, title: movie.name, poster_path: environment.posterUrl + movie.poster_path }) as TvShowModel)
    );
  }
  getGenres(): Observable<{ [key: number]: string }> {
    const params = this.params.set('path', '/genre/movie/list');
    if (!!this.genres) return of(this.genres);
    this.genres = {};
    return this.http.get<{ genres: { id: number, name: string }[] }>(environment.apiUrl, { params }).pipe(
      tap(response => response.genres.map(genre => (this.genres![genre.id] = genre.name))),
      map(() => this.genres!),
      shareReplay()
    );
  }
  getAccount(sessionId: string): Observable<any> {
    const params = this.params.set('path', '/account').set('session_id', sessionId);
    return this.http.get(environment.apiUrl, {
      params,
    }).pipe(
      tap((response: any) => {
        this.accountId = response.id;
      }));
  }
}