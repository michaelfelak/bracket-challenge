import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSeedComponent } from './add-seed.component';

describe('AddSeedComponent', () => {
  let component: AddSeedComponent;
  let fixture: ComponentFixture<AddSeedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddSeedComponent]
    });
    fixture = TestBed.createComponent(AddSeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
