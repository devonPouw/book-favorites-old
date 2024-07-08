import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearFormFieldComponent } from './clear-form-field.component';

describe('ClearFormFieldComponent', () => {
  let component: ClearFormFieldComponent;
  let fixture: ComponentFixture<ClearFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearFormFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClearFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
