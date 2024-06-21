import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportArchiveComponent } from './report-archive.component';

describe('ReportArchiveComponent', () => {
  let component: ReportArchiveComponent;
  let fixture: ComponentFixture<ReportArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportArchiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
