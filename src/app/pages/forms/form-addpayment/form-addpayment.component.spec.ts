import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAddpaymentComponent } from './form-addpayment.component';

describe('FormAddpaymentComponent', () => {
  let component: FormAddpaymentComponent;
  let fixture: ComponentFixture<FormAddpaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAddpaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAddpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
