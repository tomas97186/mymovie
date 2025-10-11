import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  ActionSheetButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { MovieDetailsComponent } from 'src/app/pages/movie-details/movie-details.component';
import { SettingsService } from 'src/app/services/settings.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { SearchItemModel } from '../../models/search-item.model';
import { MovieListService } from '../../services/movie-list.service';
import { TMDBService } from '../../services/tmdb.service';
import { MovieListsDialogComponent } from '../movie-lists-dialog/movie-lists-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MovieReviewDialogComponent } from '../movie-review-dialog/movie-review-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-movie-card',
  imports: [IonIcon, CommonModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  private readonly MESSAGE_LABELS = 'components.movieCard.messages.';
  private readonly BUTTON_LABELS = 'dialogs.movieMenu.buttons.';

  movie = model<SearchItemModel>();
  isImgLoaded: boolean = false;
  private actionSheetCtrl = inject(ActionSheetController);
  private movieService = inject(MovieListService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private dialog = inject(ModalController);
  private _snackBar = inject(ToastService);
  readonly settings = inject(SettingsService);

  tmdbService = inject(TMDBService);
  movieListService = inject(MovieListService);
  imageUrl = environment.posterUrl;

  async navigateToMovieDetails(event?: Event) {
    if (await this.dialog.getTop()) {
      this.dialog.dismiss();
    }
    if (event) {
      (event!.target! as HTMLElement).blur();
    }
    const dialogRef = await this.dialog.create({
      component: MovieDetailsComponent,
      componentProps: { movieId: this.movie()!.id, isInModal: true },
      initialBreakpoint: 1,
      backdropDismiss: false,
    });
    dialogRef.present();
    // this.router.navigate(['movies', this.movie()!.id]);
  }

  async openListDialog() {
    const dialogRef = await this.dialog.create({
      component: MovieListsDialogComponent,
      componentProps: { movie: this.movie(), showName: true },
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.25, 0.5],
      expandToScroll: false,
    });
    dialogRef.present();
  }

  removeMovieFromList(listId: string): void {
    this.movieService
      .removeMovie(this.movie()!.id, listId)
      .then(() => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'rimosso.successo'),
          {
            duration: 3000,
          }
        );
      })
      .catch((error) => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'rimosso.errore'),
          {
            duration: 3000,
          }
        );
        console.error('Errore nel rimuovere il film alla lista:', error);
      });
  }

  async openReviewModal() {
    this.actionSheetCtrl.dismiss();
    const ref = await this.dialog.create({
      component: MovieReviewDialogComponent,
      componentProps: {
        movie: this.movie(),
      },
      cssClass: 'central-modal',
    });
    ref.present();
    const { role } = await ref.onWillDismiss();
    return role;
  }

  async setAsWatched(listId: string) {
    const role = await this.openReviewModal();
    if (role === 'confirm') {
      this.__setAsWatched(listId);
    }
  }

  __setAsWatched(listId: string): void {
    this.movieService
      .setMovieAsWatched(this.movie()!.id, listId)
      .then(() => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'visto.successo'),
          {
            duration: 3000,
          }
        );
      })
      .catch((error) => {
        this._snackBar.open(
          this.translate.instant(this.MESSAGE_LABELS + 'visto.errore'),
          {
            duration: 3000,
          }
        );
        console.error('Errore nel segnare il film come visto', error);
      });
  }

  onClick($event: Event) {
    if (this.settings.openFilmOnClick.value) {
      this.navigateToMovieDetails($event);
    } else {
      this.presentActionSheet();
    }
  }

  async presentActionSheet() {
    const movie = this.movie()!;
    const listId = this.route.snapshot.params['listId'];
    const review = await firstValueFrom(
      this.movieListService.getUserReview(movie.id)
    );
    const buttons: ActionSheetButton[] = [];
    buttons.push(
      ...[
        {
          text: this.translate.instant(this.BUTTON_LABELS + 'dettagli'),
          icon: 'search',
          handler: () => this.navigateToMovieDetails(),
        },
      ]
    );
    buttons.push({
      text:
        this.translate.instant(
          this.BUTTON_LABELS + (review ? 'modificaVoto' : 'vota')
        ) +
        (review
          ? ' (' +
            this.translate.instant(
              this.BUTTON_LABELS +
                (review!.review === 1 ? 'consigliato' : 'nonConsigliato')
            ) +
            ')'
          : ''),
      icon: 'thumbs-up-sharp',
      handler: () => this.openReviewModal().then((_) => true),
    });
    if (listId) {
      if (!movie.watched) {
        buttons.push({
          text: this.translate.instant(this.BUTTON_LABELS + 'visto'),
          icon: 'eye',
          handler: () => this.setAsWatched(listId),
        });
      }
      buttons.push({
        text: this.translate.instant(this.BUTTON_LABELS + 'rimuovi'),
        icon: 'trash',
        cssClass: 'danger',
        handler: () => this.removeMovieFromList(listId),
      });
    } else {
      buttons.push({
        text: this.translate.instant(this.BUTTON_LABELS + 'aggiungi'),
        icon: 'add-circle',
        handler: this.openListDialog.bind(this),
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: movie.title,
      buttons: buttons,
    });
    await actionSheet.present();
  }
}
