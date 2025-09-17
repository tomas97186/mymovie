import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, IonActionSheet, IonButton, IonIcon } from "@ionic/angular/standalone";
import { SearchItemModel } from '../../models/search-item.model';
import { MovieListService } from '../../services/movie-list.service';
import { TMDBService } from '../../services/tmdb.service';
import { MovieListsDialogComponent } from '../movie-lists-dialog/movie-lists-dialog.component';
import { MovieMenuComponent } from '../movie-menu/movie-menu.component';


@Component({
  selector: 'app-movie-card',
  imports: [IonIcon, IonButton, IonActionSheet, CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  movie = model<SearchItemModel>();
  isImgLoaded: boolean = false;
  private bottomSheet = inject(MatBottomSheet);
  private actionSheetCtrl = inject(ActionSheetController);
  private movieService = inject(MovieListService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  tmdbService = inject(TMDBService);
  movieListService = inject(MovieListService);


  ngOnInit() {
  }

  openMovieMenu(movie: SearchItemModel) {
    this.bottomSheet.open(MovieMenuComponent, {
      data: { movie },
    });
  }

  navigateToMovieDetails(): void {
    this.bottomSheet.dismiss(true);
    this.router.navigate(['movies', this.movie()!.id]);
  }

  openListDialog(): void {
    const dialogRef = this.dialog.open(MovieListsDialogComponent, {
      width: "90%",
      maxWidth: "400px",
      data: {
        movie: this.movie()!,
      },
    });
    this.bottomSheet.dismiss(true);
  }

  addMovieToList(listId: string): void {
    this.movieService.addMovie(this.movie()!, listId).then(() => {
      this._snackBar.open('Film aggiunto alla lista con successo', 'Chiudi', {
        duration: 3000,
      });
      this.bottomSheet.dismiss();
    }).catch(error => {
      this._snackBar.open('Errore nell\'aggiungere il film alla lista', 'Chiudi', {
        duration: 3000,
      });
      console.error('Errore nell\'aggiungere il film alla lista:', error);
    });
  }

  removeMovieFromList(listId: string): void {
    this.movieService.removeMovie(this.movie()!.id, listId).then(() => {
      this._snackBar.open('Film rimosso dalla lista.', 'Chiudi', {
        duration: 3000,
      });
      this.bottomSheet.dismiss();
    }).catch(error => {
      this._snackBar.open('Errore nel rimuover il film alla lista', 'Chiudi', {
        duration: 3000,
      });
      console.error('Errore nel rimuovere il film alla lista:', error);
    });
  }

  setAsWatched(listId: string): void {
    this.movieService.setMovieAsWatched(this.movie()!.id, listId).then(() => {
      this._snackBar.open('Film segnato come visto.', 'Chiudi', {
        duration: 3000,
      });
      this.bottomSheet.dismiss();
    }).catch(error => {
      this._snackBar.open('Errore! Impossibile segnare il film come visto.', 'Chiudi', {
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
