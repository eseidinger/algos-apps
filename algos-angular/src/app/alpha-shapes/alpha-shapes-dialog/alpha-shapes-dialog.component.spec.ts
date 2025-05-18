import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphaShapesDialogComponent } from './alpha-shapes-dialog.component';

describe('AlphaShapesDialogComponent', () => {
  let component: AlphaShapesDialogComponent;
  let fixture: ComponentFixture<AlphaShapesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphaShapesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlphaShapesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
