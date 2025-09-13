import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { SearchItemModel } from '../../models/search-item.model';
import { MovieCardComponent } from "../movie-card/movie-card.component";

@Component({
  selector: 'app-movie-list',
  imports: [CommonModule, MatGridListModule, MovieCardComponent, MatProgressSpinnerModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent {

  movies = model<SearchItemModel[]>();
  isLoading = model<boolean>(false);
  loadData = output();
  isHorizontal = model<boolean>(false);
  paddingTop = input<number>();
  
  ngOnInit() {
    if (!this.isHorizontal()) {
      window.addEventListener('scroll', this.scroll, true);
    }
  }

  ngOnDestroy() {
    if (!this.isHorizontal()) {
      window.removeEventListener('scroll', this.scroll, true);
    }
  }

  scroll = (event: any): void => {
    // Here scroll is a variable holding the anonymous function 
    // this allows scroll to be assigned to the event during onInit
    // and removed onDestroy
    // To see what changed:
    if (!this.isHorizontal() && (window.innerHeight + event.srcElement.scrollTop) >= event.srcElement.scrollHeight) {
      this.loadData.emit();
    }
  };

  // @HostListener("window:scroll", ['$event'])
  // onScroll(): void {
  //   console.log('Scroll event detected:', window.innerHeight, window.scrollY, document.body.offsetHeight);
  //   if (!this.isHorizontal() && (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
  //     this.loadData.emit();
  //   }
  // }

}
