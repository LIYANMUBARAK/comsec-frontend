import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareholderEditModalComponent } from './shareholder-edit-modal.component';

describe('ShareholderEditModalComponent', () => {
  let component: ShareholderEditModalComponent;
  let fixture: ComponentFixture<ShareholderEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareholderEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareholderEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
