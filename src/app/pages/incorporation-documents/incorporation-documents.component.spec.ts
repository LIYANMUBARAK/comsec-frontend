import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncorporationDocumentsComponent } from './incorporation-documents.component';

describe('IncorporationDocumentsComponent', () => {
  let component: IncorporationDocumentsComponent;
  let fixture: ComponentFixture<IncorporationDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncorporationDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncorporationDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
