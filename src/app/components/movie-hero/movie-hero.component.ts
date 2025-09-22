import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { isObservable, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MovieModel } from '../../models/movie.model';

@Component({
  selector: 'app-movie-hero',
  imports: [
    IonIcon,
    CommonModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './movie-hero.component.html',
  styleUrl: './movie-hero.component.scss',
})
export class MovieHeroComponent {
  _movie = input.required<Observable<MovieModel> | MovieModel>({
    alias: 'movie',
  });
  movie = computed<Observable<MovieModel>>(() =>
    isObservable(this._movie())
      ? (this._movie() as Observable<MovieModel>)
      : of(this._movie() as MovieModel)
  );
  hideDetailsButton = input(false);
  hideDescription = input(false);
  showPoster = input(false);
  imageUrl = environment.posterUrl;

  heroLoaded = false;
}
