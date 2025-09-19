import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  input,
  model,
  output,
  ViewChild,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatGridListModule,
    MovieCardComponent,
    MatProgressSpinnerModule,
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

  scroll = (event: any): void => {
    // Here scroll is a variable holding the anonymous function
    // this allows scroll to be assigned to the event during onInit
    // and removed onDestroy
    // To see what changed:
    if (
      !this.isHorizontal() &&
      window.innerHeight + event.srcElement.scrollTop >=
        event.srcElement.scrollHeight
    ) {
      this.loadData.emit();
    }
  };
}
