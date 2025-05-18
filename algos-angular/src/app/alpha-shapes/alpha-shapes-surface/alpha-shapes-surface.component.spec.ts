import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphaShapesSurfaceComponent } from './alpha-shapes-surface.component';

describe('AlphaShapesSurfaceComponent', () => {
  let component: AlphaShapesSurfaceComponent;
  let fixture: ComponentFixture<AlphaShapesSurfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphaShapesSurfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlphaShapesSurfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
