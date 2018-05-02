import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryExplorerComponent } from './story-explorer.component';

describe('StoryExplorerComponent', () => {
  let component: StoryExplorerComponent;
  let fixture: ComponentFixture<StoryExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoryExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoryExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
