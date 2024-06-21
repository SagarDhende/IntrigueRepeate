import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatIfAnalysisComponent } from './what-if-analysis.component';

describe('WhatIfAnalysisComponent', () => {
  let component: WhatIfAnalysisComponent;
  let fixture: ComponentFixture<WhatIfAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatIfAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatIfAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
