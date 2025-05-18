import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SharedData } from './application/shareddata';
import array from './util/array';
import { Vector } from './geom/vector';
import { DrawingController, VoronoiState } from './canvas/drawingcontroller';
import { CanvasDrawer } from './canvas/canvasdrawer';
import { VoronoiDialogComponent } from './voronoi-dialog/voronoi-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HeaderEvent, HeaderEventService } from '../header-event.service';
import { AlphaShapesService } from './alpha-shapes.service';
import { Router } from '@angular/router';
import { Apps, getAppName } from '../app.routes';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-alpha-shapes',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './alpha-shapes.component.html',
  styleUrl: './alpha-shapes.component.scss',
})
export class AlphaShapesComponent implements OnInit, AfterViewInit {
  readonly dialog = inject(MatDialog);
  dialogRef: MatDialogRef<VoronoiDialogComponent> | undefined = undefined;
  voronoiState: VoronoiState | undefined = undefined;
  private destroy$ = new Subject<void>();
  private eventsInitialized = false;

  @ViewChild('alphashape') canvas!: ElementRef;

  dragState = { position: { x: 0, y: 0 }, dist: 0, selected: false };
  minMoveDist = 3;
  minMoveDistTouch = 15;
  maxPointDist = 5;
  maxPointDistTouch = 25;

  moveAlphaDisc = false;

  constructor(
    private router: Router,
    private headerEventService: HeaderEventService,
    private alphaShapesService: AlphaShapesService
  ) { }

  ngOnInit(): void {
    this.headerEventService.headerEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event === HeaderEvent.VoronoiDialog && !this.dialogRef) {
          this.dialogRef = this.dialog.open(VoronoiDialogComponent, {
            hasBackdrop: false,
            width: this.canvas.nativeElement.getBoundingClientRect().width,
          });
          this.dialogRef.afterClosed().subscribe(() => {
            this.dialogRef = undefined;
          });
        }
      });
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (getAppName(this.router.url.split('/')[1]) !== Apps.ALPHA_SHAPES) {
          if (this.dialogRef) {
            this.dialogRef.close();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Optionally, remove event listeners if needed
  }


  ngAfterViewInit() {
    this.alphaShapesService.voronoiState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.voronoiState = state;
        this.refresh();
      });

    const canvas = this.canvas.nativeElement;
    canvas.addEventListener('mousedown', (event: MouseEvent) =>
      this.handleDragStart(event)
    );
    canvas.addEventListener('mousemove', (event: MouseEvent) =>
      this.handleDragMove(event)
    );
    canvas.addEventListener('mouseup', (event: MouseEvent) =>
      this.handleDragEnd(event)
    );
    canvas.addEventListener('touchstart', (event: TouchEvent) =>
      this.handleDragStartTouch(event)
    );
    canvas.addEventListener('touchmove', (event: TouchEvent) =>
      this.handleDragMoveTouch(event)
    );
    canvas.addEventListener('touchend', (event: TouchEvent) =>
      this.handleDragEndTouch(event)
    );
    window.addEventListener('resize', () => this.refresh());
    this.refresh();
  }

  getPosition(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);
    return { x, y };
  }

  getPositionTouch(event: TouchEvent): { x: number; y: number } {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const touch = event.touches[0];
    const x = Math.round(touch.clientX - rect.left);
    const y = Math.round(touch.clientY - rect.top);
    return { x, y };
  }

  handleDragStart(event: MouseEvent) {
    if (!this.dragState.selected) {
      const position = this.getPosition(event);
      if (this.moveAlphaDisc) {
        this.dragStartAlphaDisc(position);
      } else {
        this.dragStartPoint(position, this.maxPointDist);
      }
    }
    event.preventDefault();
  }

  handleDragStartTouch(event: TouchEvent) {
    if (!this.dragState.selected) {
      const position = this.getPositionTouch(event);
      if (this.moveAlphaDisc) {
        this.dragStartAlphaDisc(position);
      } else {
        this.dragStartPoint(position, this.maxPointDistTouch);
      }
    }
    event.preventDefault();
  }

  dragStartAlphaDisc(position: { x: number; y: number }) {
    this.dragState.selected = true;
  }

  dragStartPoint(position: { x: number; y: number }, maxDist: number) {
    var pointIndex = array.indexOfElementWithMinimalDistance(
      SharedData.points,
      new Vector(position.x, position.y),
      function (p1, p2) {
        return p1.dist(p2);
      },
      maxDist
    );

    if (pointIndex >= 0) {
      this.dragState.position.x = SharedData.points[pointIndex].x;
      this.dragState.position.y = SharedData.points[pointIndex].y;

      this.dragState.selected = true;
    } else {
      this.dragState.position = position;
    }
    this.dragState.dist = 0;
  }

  handleDragMove(event: MouseEvent) {
    if (this.dragState.selected) {
      const position = this.getPosition(event);
      if (this.moveAlphaDisc) {
        this.dragMoveAlphaDisc(position);
      } else {
        this.dragMovePoint(position);
      }
    }
    event.preventDefault();
  }

  handleDragMoveTouch(event: TouchEvent) {
    if (this.dragState.selected) {
      const position = this.getPositionTouch(event);
      if (this.moveAlphaDisc) {
        this.dragMoveAlphaDisc(position);
      } else {
        this.dragMovePoint(position);
      }
    }
    event.preventDefault();
  }

  dragMoveAlphaDisc(position: { x: number; y: number }) {
    SharedData.alphaDiscCenter = new Vector(position.x, position.y);
    this.refresh();
  }

  dragMovePoint(position: { x: number; y: number }) {
    SharedData.removePoint(
      this.dragState.position.x,
      this.dragState.position.y,
      1
    );
    SharedData.addPoint(position.x, position.y);
    var dist = new Vector(position.x, position.y).dist(
      new Vector(this.dragState.position.x, this.dragState.position.y)
    );
    this.dragState.dist += dist;
    this.dragState.position = position;
    this.refresh();
  }

  handleDragEnd(event: MouseEvent) {
    const position = this.getPosition(event);
    if (this.moveAlphaDisc) {
      this.dragEndAlphaDisc(position);
    } else {
      this.dragEndPoint(position, this.minMoveDist);
    }
    event.preventDefault();
  }

  handleDragEndTouch(event: TouchEvent) {
    const position = this.getPositionTouch(event);
    if (this.moveAlphaDisc) {
      this.dragEndAlphaDisc(position);
    } else {
      this.dragEndPoint(position, this.minMoveDistTouch);
    }
    event.preventDefault();
  }

  dragEndAlphaDisc(position: { x: number; y: number }) {
    SharedData.alphaDiscCenter = new Vector(position.x, position.y);
    this.dragState.selected = false;
    this.refresh();
  }

  dragEndPoint(position: { x: number; y: number }, minDist: number) {
    const dist =
      new Vector(position.x, position.y).dist(
        new Vector(this.dragState.position.x, this.dragState.position.y)
      ) + this.dragState.dist;
    if (this.dragState.selected && dist < this.minMoveDist) {
      SharedData.removePoint(
        this.dragState.position.x,
        this.dragState.position.y,
        1
      );
    } else if (dist < minDist) {
      SharedData.addPoint(position.x, position.y);
    }
    this.dragState.selected = false;
    this.refresh();
  }

  refresh() {
    if (this.voronoiState) {
      const width = Math.round(
        this.canvas.nativeElement.getBoundingClientRect().width
      );
      const height = Math.round(
        this.canvas.nativeElement.getBoundingClientRect().height
      );
      SharedData.update(width, height, this.voronoiState);
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
      DrawingController.drawDiagrams(
        new CanvasDrawer(this.canvas.nativeElement),
        width,
        height,
        this.voronoiState
      );
    }
  }
}
