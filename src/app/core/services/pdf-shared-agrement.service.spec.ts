import { TestBed } from '@angular/core/testing';

import { PdfSharedAgrementService } from './pdf-shared-agrement.service';

describe('PdfSharedAgrementService', () => {
  let service: PdfSharedAgrementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfSharedAgrementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
