import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MovieListComponent } from "../../components/movie-list/movie-list.component";
import { MovieModel } from '../../models/movie.model';
import { TMDBService } from '../../services/tmdb.service';
import { CommonModule } from '@angular/common';
import { first, map, switchMap, take } from 'rxjs';
import { SearchItemModel } from '../../models/search-item.model';
import { HomeCategoryComponent } from "../../components/home-category/home-category.component";
import { DiscoverMovieRequestModel } from '../../models/discover-movie-request.model';
import { MovieHeroComponent } from "../../components/movie-hero/movie-hero.component";

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MovieListComponent, HomeCategoryComponent, MovieHeroComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  tmdbService = inject(TMDBService);
  private router = inject(Router);
  private currentList: MovieModel[] = [];
  nowPlayingMovies$ = this.getMovieCollection('now_playing');
  movieToWatch$ = this.nowPlayingMovies$.pipe(switchMap(res => this.tmdbService.getMovieDetails(res.results[Math.floor(Math.random() * Math.min(10, res.results.length))].id)))
  popularMovies$ = this.getMovieCollection('popular');
  topRatedMovies$ = this.getMovieCollection('top_rated');
  upcomingMovies$ = this.getMovieWithFilter(this.customMovieFilter);
  onTheAirTvShows$ = this.getTvShowCollection('on_the_air');
  airingTodayTvShows$ = this.getTvShowCollection('airing_today');
  popularTvShows$ = this.getTvShowCollection('popular');
  topRatedTvShows$ = this.getTvShowCollection('top_rated');
  queryForm = new FormGroup({ query: new FormControl('') });

  get customMovieFilter(): DiscoverMovieRequestModel {
    return {
      sort_by: 'vote_average.desc',
      "vote_count.gte": 200,
      primary_release_year: new Date().getFullYear()
    }
  }

  getMovieWithFilter(filter: DiscoverMovieRequestModel) {
    return this.tmdbService.discoveryMovies(filter).pipe(first());
  }

  getMovieCollection(type: 'popular' | 'upcoming' | 'top_rated' | 'now_playing') {
    return this.tmdbService.getMovieCollection(type).pipe(first());
  }

  getTvShowCollection(type: 'on_the_air' | 'airing_today' | 'popular' | 'top_rated') {
    return this.tmdbService.getTvShowCollection(type).pipe(first());
  }

  search() {
    this.router.navigate(['/search'], {
      queryParams: { query: this.queryForm.get('query')!.value }
    })
  }

  asSearchItemMovie(param: unknown) {
    return param as SearchItemModel[];
  }

}
