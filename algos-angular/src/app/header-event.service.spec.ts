import { TestBed } from '@angular/core/testing';

import { HeaderEventService } from './header-event.service';

describe('HeaderEventService', () => {
  let service: HeaderEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
