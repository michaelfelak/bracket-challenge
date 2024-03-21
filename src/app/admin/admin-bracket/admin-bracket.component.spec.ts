import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBracketComponent } from './admin-bracket.component';

describe('AdminBracketComponent', () => {
  let component: AdminBracketComponent;
  let fixture: ComponentFixture<AdminBracketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminBracketComponent]
    });
    fixture = TestBed.createComponent(AdminBracketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
