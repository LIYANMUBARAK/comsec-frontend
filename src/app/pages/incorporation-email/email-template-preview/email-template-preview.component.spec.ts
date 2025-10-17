import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTemplatePreviewComponent } from './email-template-preview.component';

describe('EmailTemplatePreviewComponent', () => {
  let component: EmailTemplatePreviewComponent;
  let fixture: ComponentFixture<EmailTemplatePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplatePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTemplatePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
