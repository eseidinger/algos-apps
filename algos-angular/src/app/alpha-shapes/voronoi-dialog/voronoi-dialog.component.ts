import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatCheckbox } from '@angular/material/checkbox';
import { VoronoiState } from '../canvas/drawingcontroller';
import { AlphaShapesService } from '../alpha-shapes.service';

@Component({
  selector: 'app-voronoi-dialog',
  imports: [
    MatCheckbox,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CdkDrag,
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

  onVoronoiMaxChange(checked: boolean): void {
    this.alphaShapesService.updateVoronoiState({
      showVoronoiMax: checked,
    });
  }
}
