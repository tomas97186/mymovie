import { Component, inject, input, OnInit } from '@angular/core';
import {
  ModalController,
  IonTitle,
  IonHeader,
  IonContent,
  IonButton,
  IonModal,
  IonList,
  IonItem,
  IonToolbar,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { MovieListService } from 'src/app/services/movie-list.service';

@Component({
  selector: 'app-movie-review-dialog',
  templateUrl: './movie-review-dialog.component.html',
  styleUrls: ['./movie-review-dialog.component.scss'],
  imports: [IonButton, TranslateModule],
})
export class MovieReviewDialogComponent {
  private listService = inject(MovieListService);
  dialog = inject(ModalController);
  movie = input.required<{ id: string; poster_path: string, title: string }>();

  constructor() {}

  async reviewFilm(value: -1 | 1) {
    await this.listService.reviewMovie(this.movie(), value);
    await this.dialog.dismiss(value, 'confirm');
  }
}
