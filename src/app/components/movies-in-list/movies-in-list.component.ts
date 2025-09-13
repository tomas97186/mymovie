import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MovieListDynamicComponent } from "../movie-list-dynamic/movie-list-dynamic.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { MovieListService } from '../../services/movie-list.service';
import { map, of, tap } from 'rxjs';
import { SearchResultsModel } from '../../models/search-results.model';
import { SearchItemModel } from '../../models/search-item.model';
import { MovieListComponent } from "../movie-list/movie-list.component";

@Component({
  selector: 'app-movies-in-list',
  imports: [MovieListDynamicComponent, MovieListComponent],
  templateUrl: './movies-in-list.component.html',
  styleUrl: './movies-in-list.component.scss'
})
export class MoviesInListComponent {
  private listService = inject(MovieListService);
  title = "";
  currentId?: number;
  currentPage = signal<number>(1);
  moviesCount = input.required<number>();
  listId = input.required<string>();
  watched = input<boolean>(false);
  pageSize = input<number>(10);
  private currentIds = new Set<number>();
  currentList: SearchItemModel[] = [];

  private resultCriteria = computed(() => ({ currentPage: this.currentPage(), listId: this.listId(), watched: this.watched() }));
  private updateCurrentListEff = effect(() => this.result.hasValue() ? this.updateCurrentList(this.result.value()!) : null);

  result = rxResource({
    request: this.resultCriteria,
    loader: ({ request: query }) => {
      if (!query) return of(undefined);
      return this.listService.getListMovies(query.listId, query.watched).pipe(
        tap(res => this.currentId = res[res.length - 1].id),
        map(res => (<SearchResultsModel>{
          results: res,
          current_page: this.currentPage(),
          total_pages: Math.ceil(this.moviesCount() / this.pageSize()),
          total_results: this.moviesCount()
        })),
        tap(console.log)
      );
    }
  });
  ngOnDestroy() {
    this.updateCurrentListEff?.destroy();
  }

  loadMoreMovies() {
    if (this.result.hasValue() && this.currentPage() < this.result.value()!.total_pages) {
      this.currentPage.update(page => page + 1);
    }
  }
  private updateCurrentList(results: SearchResultsModel) {
    this.currentList = [...this.currentList, ...results.results.filter(
      res => {
        if (this.currentIds.has(res.id)) {
          return false
        } else {
          this.currentIds.add(res.id);
          return true;
        }
      }
    )];
  }

}
