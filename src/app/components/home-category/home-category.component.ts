import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { SearchResultsModel } from '../../models/search-results.model';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { DiscoverMovieRequestModel } from '../../models/discover-movie-request.model';
import { MatButtonModule } from '@angular/material/button';
import { IonButton, IonIcon } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-category',
  imports: [TranslateModule, IonIcon, IonButton, CommonModule, RouterModule, MovieListComponent, MatButtonModule],
  templateUrl: './home-category.component.html',
  styleUrl: './home-category.component.scss'
})
export class HomeCategoryComponent {
  private router = inject(Router);
  settings = input.required<HomeCategorySettings>();

  navigateToAll() {
    if (!this.settings().filter) {
      this.router.navigate(['/collection', 'movie', this.settings().url]);
    } else {
      this.router.navigate(['/discovery', 'movie'], { queryParams: {title: this.settings().title,  ...this.settings().filter} })
    }
  }

}

export interface HomeCategorySettings {
  title: string,
  url?: string,
  filter?: DiscoverMovieRequestModel,
  data$: Observable<SearchResultsModel>
}