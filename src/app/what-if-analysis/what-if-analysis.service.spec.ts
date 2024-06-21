import { TestBed } from '@angular/core/testing';

import { WhatIfAnalysisService } from './what-if-analysis.service';

describe('WhatIfAnalysisService', () => {
  let service: WhatIfAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhatIfAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
