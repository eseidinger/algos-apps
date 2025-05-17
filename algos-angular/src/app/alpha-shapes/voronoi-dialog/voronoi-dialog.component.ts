import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatCheckbox } from '@angular/material/checkbox';
import { VoronoiState } from '../canvas/drawingcontroller';
import { AlphaShapesService } from '../alpha-shapes.service';
import { MatSliderModule } from '@angular/material/slider';

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
  ],
  templateUrl: './voronoi-dialog.component.html',
  styleUrl: './voronoi-dialog.component.scss',
})
export class VoronoiDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<VoronoiDialogComponent>);
  voronoiState: VoronoiState | undefined = undefined;

  constructor(private alphaShapesService: AlphaShapesService) {}

  ngOnInit(): void {
    this.alphaShapesService.voronoiState$.subscribe((state) => {
      this.voronoiState = state;
    });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onVoronoiMinChange(checked: boolean): void {
    this.alphaShapesService.updateVoronoiState({
      showVoronoiMin: checked,
    });
  }

  onVoronoiMaxChange(checked: boolean): void {
    this.alphaShapesService.updateVoronoiState({
      showVoronoiMax: checked,
    });
  }

  onDelaunayMinChange(checked: boolean): void {
    this.alphaShapesService.updateVoronoiState({
      showDelaunayMin: checked,
    });
  }

  onDelaunayMaxChange(checked: boolean): void {
    this.alphaShapesService.updateVoronoiState({
      showDelaunayMax: checked,
    });
  }

  onBeachLineChange(checked: boolean): void {
    this.alphaShapesService.updateVoronoiState({
      showBeachLine: checked,
    });
  }

  onSweepLinePercentageChange(value: number): void {
    this.alphaShapesService.updateVoronoiState({
      sweepLinePercentage: value,
    });
  }
}
