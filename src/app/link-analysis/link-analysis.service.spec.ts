import { TestBed } from '@angular/core/testing';

import { LinkAnalysisService } from './link-analysis.service';

describe('LinkAnalysisService', () => {
  let service: LinkAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
