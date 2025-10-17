import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInviteEmailTemplateEditorComponent } from './user-invite-email-template-editor.component';

describe('UserInviteEmailTemplateEditorComponent', () => {
  let component: UserInviteEmailTemplateEditorComponent;
  let fixture: ComponentFixture<UserInviteEmailTemplateEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInviteEmailTemplateEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInviteEmailTemplateEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
