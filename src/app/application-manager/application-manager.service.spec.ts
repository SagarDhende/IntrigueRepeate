import { TestBed } from '@angular/core/testing';

import { ApplicationManagerService } from './application-manager.service';

describe('ApplicationManagerService', () => {
  let service: ApplicationManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
