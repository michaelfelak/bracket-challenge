import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersComponent } from './winners.component';

describe('WinnersComponent', () => {
  let component: WinnersComponent;
  let fixture: ComponentFixture<WinnersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WinnersComponent]
    });
    fixture = TestBed.createComponent(WinnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
