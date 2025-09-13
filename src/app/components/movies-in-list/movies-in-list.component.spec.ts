import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviesInListComponent } from './movies-in-list.component';

describe('MoviesInListComponent', () => {
  let component: MoviesInListComponent;
  let fixture: ComponentFixture<MoviesInListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviesInListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoviesInListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
