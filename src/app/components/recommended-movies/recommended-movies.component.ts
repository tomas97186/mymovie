import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { IonButton, IonIcon } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { MovieListService } from 'src/app/services/movie-list.service';
import { MovieListComponent } from '../movie-list/movie-list.component';

@Component({
  selector: 'app-recommended-movies',
  imports: [CommonModule, TranslateModule, IonIcon, IonButton, CommonModule, RouterModule, MovieListComponent, MatButtonModule],
  templateUrl: './recommended-movies.component.html',
  styleUrl: './recommended-movies.component.scss'
})
export class RecommendedMoviesComponent {
  private router = inject(Router);
  private listService = inject(MovieListService);
  recommendedMovies = this.listService.getRecommendedMovies();
}