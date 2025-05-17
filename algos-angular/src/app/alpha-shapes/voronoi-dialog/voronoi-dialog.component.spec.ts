import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoronoiDialogComponent } from './voronoi-dialog.component';

describe('VoronoiDialogComponent', () => {
  let component: VoronoiDialogComponent;
  let fixture: ComponentFixture<VoronoiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoronoiDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoronoiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
