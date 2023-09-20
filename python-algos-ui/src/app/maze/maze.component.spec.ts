import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MazeComponent } from './maze.component';

describe('MazeComponent', () => {
  let component: MazeComponent;
  let fixture: ComponentFixture<MazeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MazeComponent]
    });
    fixture = TestBed.createComponent(MazeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
