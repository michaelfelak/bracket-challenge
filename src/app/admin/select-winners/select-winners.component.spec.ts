import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWinnersComponent } from './select-winners.component';

describe('SelectWinnersComponent', () => {
  let component: SelectWinnersComponent;
  let fixture: ComponentFixture<SelectWinnersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SelectWinnersComponent]
    });
    fixture = TestBed.createComponent(SelectWinnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
