import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkAnalysisComponent } from './link-analysis.component';

describe('LinkAnalysisComponent', () => {
  let component: LinkAnalysisComponent;
  let fixture: ComponentFixture<LinkAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
