import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphaShapesComponent } from './alpha-shapes.component';

describe('AlphaShapesComponent', () => {
  let component: AlphaShapesComponent;
  let fixture: ComponentFixture<AlphaShapesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphaShapesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlphaShapesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
