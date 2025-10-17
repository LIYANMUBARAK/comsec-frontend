import { TestBed } from '@angular/core/testing';

import { PdfAoBService } from './pdf-ao-b.service';

describe('PdfAoBService', () => {
  let service: PdfAoBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfAoBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
