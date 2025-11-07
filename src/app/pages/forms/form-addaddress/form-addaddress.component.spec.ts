import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAddaddressComponent } from './form-addaddress.component';

describe('FormAddaddressComponent', () => {
  let component: FormAddaddressComponent;
  let fixture: ComponentFixture<FormAddaddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAddaddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAddaddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
