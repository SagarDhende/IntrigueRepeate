import { TestBed } from '@angular/core/testing';

import { BusinessRuleService } from './business-rule.service';

describe('BusinessRuleService', () => {
  let service: BusinessRuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessRuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
