import { TestBed } from '@angular/core/testing';

import { DashboardIntegratedContainerService } from './dashboard-integrated-container.service';

describe('DashboardIntegratedContainerService', () => {
  let service: DashboardIntegratedContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardIntegratedContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
