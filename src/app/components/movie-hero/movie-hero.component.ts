import { Component, computed, input } from '@angular/core';
import { MovieModel } from '../../models/movie.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { isObservable, Observable, of } from 'rxjs';

@Component({
  selector: 'app-movie-hero',
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './movie-hero.component.html',
  styleUrl: './movie-hero.component.scss'
})
export class MovieHeroComponent {
  _movie = input.required<Observable<MovieModel> | MovieModel>({ alias: 'movie' });
  movie = computed<Observable<MovieModel>>(() => isObservable(this._movie()) ? this._movie() as Observable<MovieModel> : of(this._movie() as MovieModel));
  hideDetailsButton = input(false);
  hideDescription = input(false);
  showPoster = input(false);

  heroLoaded = false;
}
