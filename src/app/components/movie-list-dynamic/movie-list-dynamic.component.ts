import { Component, effect, inject, input, model, signal } from '@angular/core';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SearchItemModel } from '../../models/search-item.model';
import { SearchResultsModel } from '../../models/search-results.model';
import { CommonModule, Location } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonContent, IonButton, IonIcon, IonFabButton, IonFab } from "@ionic/angular/standalone";

@Component({
  selector: 'app-movie-list-dynamic',
  imports: [IonIcon, IonButton, IonButtons, IonBackButton, IonTitle, IonToolbar, IonHeader,
    CommonModule,
    MovieListComponent,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    IonHeader, IonContent, IonFabButton, IonFab],
  templateUrl: './movie-list-dynamic.component.html',
  styleUrl: './movie-list-dynamic.component.scss',
})
export class MovieListDynamicComponent {
  location = inject(Location);

  private currentIds = new Set<number>();

  currentList: SearchItemModel[] = [];

  currentPage = model<number>(1);

  searchResult = input<SearchResultsModel>();

  title = input<string>();

  isLoading = input<boolean>(false);

  paddingTop = input<number>();

  private changedPage = false;

  private updateCurrentListEff = effect(() =>
    this.searchResult() ? this.updateCurrentList(this.searchResult()!) : null
  );

  private resetList = effect(() =>
    this.isLoading() && !this.changedPage ? this.resetPage() : null
  );

  scrollToTop() {
    const element = document.querySelector('ion-content');
    element?.scroll({ top: 0, behavior: 'smooth' });
  }
  loadMoreMovies() {
    if (
      this.searchResult() &&
      this.currentPage() < this.searchResult()!.total_pages
    ) {
      this.currentPage.update((page) => page + 1);
      this.changedPage = true;
    }
  }
  ngOnDestroy() {
    this.updateCurrentListEff.destroy();
  }
  private resetPage() {
    this.currentList = [];
    this.currentIds = new Set<number>();
    this.scrollToTop();
  }
  private updateCurrentList(results: SearchResultsModel) {
    if (this.changedPage) {
      this.currentList = [
        ...this.currentList,
        ...this.searchResult()!.results.filter((res) => {
          if (this.currentIds.has(res.id)) {
            return false;
          } else {
            this.currentIds.add(res.id);
            return true;
          }
        }),
      ];
      this.changedPage = false;
    } else {
      console.log('RESET LIST 2');
      this.currentList = [];
      this.currentIds = new Set<number>();
      this.currentList = this.searchResult()!.results.filter((res) => {
        if (this.currentIds.has(res.id)) {
          return false;
        } else {
          this.currentIds.add(res.id);
          return true;
        }
      });
    }
  }
}
