import { CommonModule } from '@angular/common';
import { Component, effect, input, model, output } from '@angular/core';
import {
  InfiniteScrollCustomEvent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { SearchItemModel } from '../../models/search-item.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-list',
  imports: [
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    CommonModule,
    MovieCardComponent,
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
})
export class MovieListComponent {
  private infiniteScroll?: HTMLIonInfiniteScrollElement;

  movies = model<SearchItemModel[]>();
  isLoading = model<boolean>(false);
  loadData = output();
  total = input.required<number>();
  isHorizontal = model<boolean>(false);
  paddingTop = input<number>();
  private stopLoading = effect(() =>
    !this.isLoading() ? this.infiniteScroll?.complete() : undefined
  );

  loadMore(event: InfiniteScrollCustomEvent) {
    this.loadData.emit();
    this.infiniteScroll = event.target;
  }
}
