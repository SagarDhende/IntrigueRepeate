import { TestBed } from '@angular/core/testing';

import { LogWebSocketService } from './log-web-socket.service';

describe('LogWebSocketService', () => {
  let service: LogWebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogWebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
