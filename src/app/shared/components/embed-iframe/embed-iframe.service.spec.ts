import { TestBed } from '@angular/core/testing';

import { EmbedIframeService } from './embed-iframe.service';

describe('EmbedIframeService', () => {
  let service: EmbedIframeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmbedIframeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
