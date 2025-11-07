import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalStorageInfoComponent } from './local-storage-info.component';

describe('LocalStorageInfoComponent', () => {
  let component: LocalStorageInfoComponent;
  let fixture: ComponentFixture<LocalStorageInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalStorageInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalStorageInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
