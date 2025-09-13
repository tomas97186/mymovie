import { CommonModule } from '@angular/common';
import { Component, inject, model, output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { first, switchMap, tap } from 'rxjs';
import { SearchItemModel } from '../../models/search-item.model';
import { MovieListService } from '../../services/movie-list.service';
import { TMDBService } from '../../services/tmdb.service';
import { MovieMenuComponent } from '../movie-menu/movie-menu.component';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  movie = model<SearchItemModel>();
  isImgLoaded: boolean = false;
  private bottomSheet = inject(MatBottomSheet);

  tmdbService = inject(TMDBService);
  movieListService = inject(MovieListService);


  ngOnInit() {
  }

  openMovieMenu(movie: SearchItemModel) {
    this.bottomSheet.open(MovieMenuComponent, {
      data: { movie },
    });
  }
}
