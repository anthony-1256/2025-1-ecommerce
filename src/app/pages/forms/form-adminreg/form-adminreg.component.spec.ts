import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAdminregComponent } from './form-adminreg.component';

describe('FormAdminregComponent', () => {
  let component: FormAdminregComponent;
  let fixture: ComponentFixture<FormAdminregComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAdminregComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAdminregComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
