import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModalController, IonIcon, IonButton } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, isObservable, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MovieModel } from '../../models/movie.model';
import { MovieDetailsComponent } from 'src/app/pages/movie-details/movie-details.component';

@Component({
  selector: 'app-movie-hero',
  imports: [IonButton, IonIcon, CommonModule, TranslateModule, RouterModule],
  templateUrl: './movie-hero.component.html',
  styleUrl: './movie-hero.component.scss',
})
export class MovieHeroComponent {
  private dialog = inject(ModalController);
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

  async navigateToMovieDetails(movie: MovieModel) {
    if (await this.dialog.getTop()) {
      this.dialog.dismiss();
    }
    if (event) {
      (event!.target! as HTMLElement).blur();
    }
    const dialogRef = await this.dialog.create({
      component: MovieDetailsComponent,
      componentProps: { movieId: movie.id, isInModal: true },
      initialBreakpoint: 1,
      backdropDismiss: false,
    });
    dialogRef.present();
    // this.router.navigate(['movies', this.movie()!.id]);
  }
}
