import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorEditModalComponent } from './director-edit-modal.component';

describe('DirectorEditModalComponent', () => {
  let component: DirectorEditModalComponent;
  let fixture: ComponentFixture<DirectorEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectorEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
