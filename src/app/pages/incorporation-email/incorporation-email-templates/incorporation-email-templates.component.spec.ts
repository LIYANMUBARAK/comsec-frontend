import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncorporationEmailTemplatesComponent } from './incorporation-email-templates.component';

describe('IncorporationEmailTemplatesComponent', () => {
  let component: IncorporationEmailTemplatesComponent;
  let fixture: ComponentFixture<IncorporationEmailTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncorporationEmailTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncorporationEmailTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
