import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphaShapesControlsComponent } from './alpha-shapes-controls.component';

describe('AlphaShapesControlsComponent', () => {
  let component: AlphaShapesControlsComponent;
  let fixture: ComponentFixture<AlphaShapesControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphaShapesControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlphaShapesControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
