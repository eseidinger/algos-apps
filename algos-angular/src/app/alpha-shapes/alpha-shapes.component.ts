import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { VoronoiDialogComponent } from './voronoi-dialog/voronoi-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HeaderEvent, HeaderEventService } from '../header-event.service';
import { Router } from '@angular/router';
import { Apps, getAppName } from '../app.routes';
import { Subject, takeUntil } from 'rxjs';
import { AlphaShapesSurfaceComponent } from "./alpha-shapes-surface/alpha-shapes-surface.component";
import { AlphaShapesDialogComponent } from './alpha-shapes-dialog/alpha-shapes-dialog.component';

@Component({
  selector: 'app-alpha-shapes',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, AlphaShapesSurfaceComponent],
  templateUrl: './alpha-shapes.component.html',
  styleUrl: './alpha-shapes.component.scss',
})
export class AlphaShapesComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  voronoiDialogRef: MatDialogRef<VoronoiDialogComponent> | undefined = undefined;
  alphaShapesDialogRef: MatDialogRef<AlphaShapesDialogComponent> | undefined = undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private headerEventService: HeaderEventService,
  ) { }

  ngOnInit(): void {
    this.headerEventService.headerEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event === HeaderEvent.VoronoiDialog && !this.voronoiDialogRef) {
          this.voronoiDialogRef = this.dialog.open(VoronoiDialogComponent, {
            hasBackdrop: false,
          });
          this.voronoiDialogRef.afterClosed().subscribe(() => {
            this.voronoiDialogRef = undefined;
          });
        } else if (event === HeaderEvent.AlphaShapesDialog && !this.voronoiDialogRef) {
          this.alphaShapesDialogRef = this.dialog.open(AlphaShapesDialogComponent, {
            hasBackdrop: false,
          });
          this.alphaShapesDialogRef.afterClosed().subscribe(() => {
            this.voronoiDialogRef = undefined;
          });
        }
      });
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (getAppName(this.router.url.split('/')[1]) !== Apps.ALPHA_SHAPES) {
          if (this.voronoiDialogRef) {
            this.voronoiDialogRef.close();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
