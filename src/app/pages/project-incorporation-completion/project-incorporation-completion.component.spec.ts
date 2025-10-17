import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectIncorporationCompletionComponent } from './project-incorporation-completion.component';

describe('ProjectIncorporationCompletionComponent', () => {
  let component: ProjectIncorporationCompletionComponent;
  let fixture: ComponentFixture<ProjectIncorporationCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectIncorporationCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectIncorporationCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
