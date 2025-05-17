import { TestBed } from '@angular/core/testing';

import { AlphaShapesService } from './alpha-shapes.service';

describe('AlphaShapesService', () => {
  let service: AlphaShapesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlphaShapesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
