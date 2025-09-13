import { Injectable } from '@angular/core';
import { SearchItemModel } from '../models/search-item.model';

@Injectable({
  providedIn: 'root'
})
export class SearchListCacheService {
  currentList?: SearchItemModel[];
  elementId: number = 0;

  constructor() { }
}
