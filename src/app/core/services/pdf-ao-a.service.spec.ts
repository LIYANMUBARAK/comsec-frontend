import { TestBed } from '@angular/core/testing';

import { PdfAoAService } from './pdf-ao-a.service';

describe('PdfAoAService', () => {
  let service: PdfAoAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfAoAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
