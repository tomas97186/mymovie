import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinListDialogComponent } from './join-list-dialog.component';

describe('JoinListDialogComponent', () => {
  let component: JoinListDialogComponent;
  let fixture: ComponentFixture<JoinListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinListDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
