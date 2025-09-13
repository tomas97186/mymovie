import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieInListMenuComponent } from './movie-in-list-menu.component';

describe('MovieInListMenuComponent', () => {
  let component: MovieInListMenuComponent;
  let fixture: ComponentFixture<MovieInListMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieInListMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieInListMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
