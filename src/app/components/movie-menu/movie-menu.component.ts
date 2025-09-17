import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router, RouterModule } from '@angular/router';
import { tap } from 'rxjs';
import { MovieModel } from '../../models/movie.model';
import { MovieListService } from '../../services/movie-list.service';
import { MovieListsDialogComponent } from '../movie-lists-dialog/movie-lists-dialog.component';
import { IonActionSheet } from "@ionic/angular/standalone";
import { SearchItemModel } from 'src/app/models/search-item.model';

@Component({
  selector: 'app-movie-menu',
  imports: [IonActionSheet, CommonModule, RouterModule, MatListModule, MatIconModule],
  templateUrl: './movie-menu.component.html',
  styleUrl: './movie-menu.component.scss'
})
export class MovieMenuComponent {
  private movieService = inject(MovieListService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  bottomSheet = inject(MatBottomSheet);
  openedFromList: boolean = false;
  listId?: string;
  userLists = this.movieService.getUserLists().pipe(
    tap(res => {
      if (res.length === 1) {
        this.openedFromList = true;
        this.listId = res[0];
      }
    })
  );

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { movie: MovieModel, lists: string[] }, private _snackBar: MatSnackBar) {

  }

  ngOnInit() {
    if (this.router.url.startsWith('/lists')) {
      this.listId = this.router.url.slice(this.router.url.lastIndexOf('/') + 1, this.router.url.length);
      this.openedFromList = true;
    }
  }

  navigateToMovieDetails(): void {
    this.bottomSheet.dismiss(true);
    this.router.navigate(['movies', this.data.movie.id]);
  }

  openListDialog(): void {
    const dialogRef = this.dialog.open(MovieListsDialogComponent, {
      width: "90%",
      maxWidth: "400px",
      data: {
        movie: this.data.movie,
      },
    });
    this.bottomSheet.dismiss(true);
  }

  // addMovieToList(listId: string): void {
  //   this.movieService.addMovie(this.data.movie as SearchItemModel, listId).then(() => {
  //     this._snackBar.open('Film aggiunto alla lista con successo', 'Chiudi', {
  //       duration: 3000,
  //     });
  //     this.bottomSheet.dismiss();
  //   }).catch(error => {
  //     this._snackBar.open('Errore nell\'aggiungere il film alla lista', 'Chiudi', {
  //       duration: 3000,
  //     });
  //     console.error('Errore nell\'aggiungere il film alla lista:', error);
  //   });
  // }

  removeMovieFromList(listId: string): void {
    this.movieService.removeMovie(this.data.movie.id, listId).then(() => {
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
    this.movieService.setMovieAsWatched(this.data.movie.id, listId).then(() => {
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


}
