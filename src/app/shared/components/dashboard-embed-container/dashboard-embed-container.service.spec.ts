import { TestBed } from '@angular/core/testing';

import { DashboardEmbedContainerService } from './dashboard-embed-container.service';

describe('DashboardEmbedContainerService', () => {
  let service: DashboardEmbedContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardEmbedContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
