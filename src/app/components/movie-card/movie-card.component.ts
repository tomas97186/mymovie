import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from 'src/app/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, IonActionSheet, IonButton, IonIcon, ModalController } from "@ionic/angular/standalone";
import { SearchItemModel } from '../../models/search-item.model';
import { MovieListService } from '../../services/movie-list.service';
import { TMDBService } from '../../services/tmdb.service';
import { MovieListsDialogComponent } from '../movie-lists-dialog/movie-lists-dialog.component';


@Component({
  selector: 'app-movie-card',
  imports: [IonIcon, IonButton, IonActionSheet, CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  movie = model<SearchItemModel>();
  isImgLoaded: boolean = false;
  private actionSheetCtrl = inject(ActionSheetController);
  private movieService = inject(MovieListService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(ModalController);
  private _snackBar = inject(ToastService);

  tmdbService = inject(TMDBService);
  movieListService = inject(MovieListService);


 navigateToMovieDetails(): void {
    //    const dialogRef = await this.dialog.create({
    //   component: MovieDetailsComponent,
    //   componentProps: { movieId: this.movie().id },
    //   initialBreakpoint: .5,
    //   breakpoints: [0, .25, .5, 1],
    // });
    // dialogRef.present();
    // this.router.navigate(['movies', this.movie()!.id]);
  }

  async openListDialog() {
    const dialogRef = await this.dialog.create({
      component: MovieListsDialogComponent,
      componentProps: { movie: this.movie() },
      initialBreakpoint: .5,
      breakpoints: [0, .25, .5],
    });
    dialogRef.present();
  }
  
  removeMovieFromList(listId: string): void {
    this.movieService.removeMovie(this.movie()!.id, listId).then(() => {
      this._snackBar.open('Film rimosso dalla lista.', {
        duration: 3000,
      });
    }).catch(error => {
      this._snackBar.open('Errore nel rimuover il film alla lista', {
        duration: 3000,
      });
      console.error('Errore nel rimuovere il film alla lista:', error);
    });
  }

  setAsWatched(listId: string): void {
    this.movieService.setMovieAsWatched(this.movie()!.id, listId).then(() => {
      this._snackBar.open('Film segnato come visto.', {
        duration: 3000,
      });
    }).catch(error => {
      this._snackBar.open('Errore! Impossibile segnare il film come visto.', {
        duration: 3000,
      });
      console.error('Errore nel segnare il film come visto', error);
    });
  }
  async presentActionSheet() {
    const movie = this.movie()!;
    const listId = this.route.snapshot.params['listId'];
    const buttons = [];
    if (listId) {
      if (!movie.watched) {
        buttons.push(
          {
            text: 'Segna come visto',
            icon: 'eye',
            handler: () => this.setAsWatched(listId),
          });
      }
      buttons.push(
        {
          text: 'Rimuovi dalla lista',
          icon: 'trash',
          handler: () => this.removeMovieFromList(listId),
        });
    } else {
      buttons.push(
        {
          text: 'Aggiungi ad una lista',
          icon: 'add-circle',
          handler: this.openListDialog.bind(this),
        });
    }

    buttons.push(...[
      {
        text: 'Visualizza Dettagli',
        icon: 'search',
        handler: this.navigateToMovieDetails.bind(this),
      }]);
    const actionSheet = await this.actionSheetCtrl.create({
      header: movie.title,
      buttons: buttons
    });
    await actionSheet.present();
  }
}
