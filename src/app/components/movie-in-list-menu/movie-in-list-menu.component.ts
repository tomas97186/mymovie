import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { MovieListService } from '../../services/movie-list.service';
import { MatDialog } from '@angular/material/dialog';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { MovieModel } from '../../models/movie.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movie-in-list-menu',
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  templateUrl: './movie-in-list-menu.component.html',
  styleUrl: './movie-in-list-menu.component.scss'
})
export class MovieInListMenuComponent {
  private movieService = inject(MovieListService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  bottomSheet = inject(MatBottomSheet);

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { movie: MovieModel, listId: string }, private _snackBar: MatSnackBar) {

  }

  navigateToMovieDetails(): void {
    this.bottomSheet.dismiss(true);
    this.router.navigate(['movies', this.data.movie.id]);
  }

  removeMovieFromList(): void {
    this.movieService.removeMovie(this.data.movie.id, this.data.listId).then(() => {
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

  setAsWatched(): void {
    this.movieService.setMovieAsWatched(this.data.movie.id, this.data.listId).then(() => {
      this._snackBar.open('Film impostato come visto.', 'Chiudi', {
        duration: 3000,
      });
      this.bottomSheet.dismiss();
    }).catch(error => {
      this._snackBar.open('Errore! Impossibile impostare il film come visto.', 'Chiudi', {
        duration: 3000,
      });
      console.error('Errore nel segnare il film come visto', error);
    });
  }

}
