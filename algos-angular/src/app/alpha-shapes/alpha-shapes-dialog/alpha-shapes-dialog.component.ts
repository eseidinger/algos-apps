import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { Subject, takeUntil } from 'rxjs';
import { ComputationOutput } from '../application/computations';
import { AlphaShapesInputState } from '../canvas/drawingcontroller';
import { AlphaShapesService } from '../alpha-shapes.service';

@Component({
  selector: 'app-alpha-shapes-dialog',
  imports: [
    MatCheckbox,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CdkDrag,
    CdkDragHandle,
    MatSliderModule,
  ],
  templateUrl: './alpha-shapes-dialog.component.html',
  styleUrl: './alpha-shapes-dialog.component.scss'
})
export class AlphaShapesDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AlphaShapesDialogComponent>);
  private destroy$ = new Subject<void>();
  alphaShapesInputState: AlphaShapesInputState | undefined = undefined;
  alphaShapesOutputState: ComputationOutput | undefined = undefined;

  constructor(private alphaShapesService: AlphaShapesService) { }

  ngOnInit(): void {
    this.alphaShapesService.alphaShapesInput$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.alphaShapesInputState = state;
      });
    this.alphaShapesService.computationOutput$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.alphaShapesOutputState = state;
      }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onAlphaChange(event: any): void {
    this.alphaShapesService.setAlpha(event.srcElement.value);
  }
  onAlphaShapeChange(value: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({ showAlphaShape: value });
  }
  onAlphaHullChange(value: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({ showAlphaHull: value });
  }
  onAlphaDiscChange(value: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({ showAlphaDisc: value });
  }
  onSmallestCircleChange(value: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({ showSmallestCircle: value });
  }
  onConvexHullChange(value: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({ showConvexHull: value });
  }

  getAlphaMin(): number {
    return this.alphaShapesService.getAlphaMinMax().min;
  }
  getAlphaMax(): number {
    return this.alphaShapesService.getAlphaMinMax().max;
  }
  getAlphaStep(): number {
    const { min, max } = this.alphaShapesService.getAlphaMinMax();
    const step = (max - min) / 100;
    return step;
  }

}
