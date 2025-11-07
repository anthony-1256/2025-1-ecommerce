import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BootstrapCheatsheetComponent } from './bootstrap-cheatsheet.component';

describe('BootstrapCheatsheetComponent', () => {
  let component: BootstrapCheatsheetComponent;
  let fixture: ComponentFixture<BootstrapCheatsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BootstrapCheatsheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BootstrapCheatsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
