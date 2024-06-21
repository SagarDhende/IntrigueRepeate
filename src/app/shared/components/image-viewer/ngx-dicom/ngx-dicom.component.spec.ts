import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDicomComponent } from './ngx-dicom.component';

describe('NgxDicomComponent', () => {
  let component: NgxDicomComponent;
  let fixture: ComponentFixture<NgxDicomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxDicomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxDicomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
