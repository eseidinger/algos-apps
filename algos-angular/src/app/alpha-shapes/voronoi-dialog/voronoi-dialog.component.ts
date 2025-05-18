import { Component, computed, inject, Input, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatCheckbox } from '@angular/material/checkbox';
import { AlphaShapesInputState } from '../canvas/drawingcontroller';
import { AlphaShapesService } from '../alpha-shapes.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { ComputationOutput } from '../application/computations';

@Component({
  selector: 'app-voronoi-dialog',
  imports: [
    MatCheckbox,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CdkDrag,
    CdkDragHandle,
    MatSliderModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './voronoi-dialog.component.html',
  styleUrl: './voronoi-dialog.component.scss',
})
export class VoronoiDialogComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<VoronoiDialogComponent>);
  private destroy$ = new Subject<void>();
  alphaShapesInputState: AlphaShapesInputState | undefined = undefined;
  alphaShapesOutputState: ComputationOutput | undefined = undefined;

  triangleOptions: Signal<number[]> = computed(() => {
    const options: number[] = [];
    const count = 0;
    for (let i = 0; i < count; i++) {
      options.push(i);
    }
    return options;
  })

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

  getTriangleOptions(): number[] {
    const options: number[] = [];
    const count = this.alphaShapesOutputState?.voronoiMaxTriangles.length || 0;
    for (let i = 0; i < count; i++) {
      options.push(i);
    }
    return options;
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onVoronoiMinChange(checked: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      showVoronoiMin: checked,
    });
  }

  onVoronoiMaxChange(checked: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      showVoronoiMax: checked,
    });
  }

  onDelaunayMinChange(checked: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      showDelaunayMin: checked,
    });
  }

  onDelaunayMaxChange(checked: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      showDelaunayMax: checked,
    });
  }

  onBeachLineChange(checked: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      showBeachLine: checked,
    });
  }

  onSweepLinePercentageChange(event: any): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      sweepLinePercentage: event.srcElement.value,
    });
  }

  onShowTrianglesChanged(checked: boolean): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      showTriangles: checked,
    });
  }

  onSelectedTriangleChanged(triangleNumber: number): void {
    this.alphaShapesService.updateAlphaShapesInputState({
      selectedTriangle: triangleNumber,
    });
  }
}
