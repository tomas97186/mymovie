import { TestBed } from '@angular/core/testing';

import { SearchListCacheService } from './search-list-cache.service';

describe('SearchListCacheService', () => {
  let service: SearchListCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchListCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
