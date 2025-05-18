import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CanvasDrawer } from '../canvas/canvasdrawer';
import { DrawingController, AlphaShapesInputState } from '../canvas/drawingcontroller';
import { Vector } from '../geom/vector';
import array from '../util/array';
import { AlphaShapesService } from '../alpha-shapes.service';
import { Computations } from '../application/computations';

@Component({
  selector: 'app-alpha-shapes-surface',
  imports: [],
  templateUrl: './alpha-shapes-surface.component.html',
  styleUrl: './alpha-shapes-surface.component.scss'
})
export class AlphaShapesSurfaceComponent implements AfterViewInit {

  @ViewChild('alphashape') canvas!: ElementRef;
  private destroy$ = new Subject<void>();

  alphaShapesInputState: AlphaShapesInputState | undefined = undefined;

  dragState = { position: { x: 0, y: 0 }, dist: 0, selected: false };
  minMoveDist = 3;
  minMoveDistTouch = 15;
  maxPointDist = 5;
  maxPointDistTouch = 25;

  moveAlphaDisc = false;

  constructor(
    private alphaShapesService: AlphaShapesService,
  ) { }

  ngAfterViewInit() {
    this.alphaShapesService.alphaShapesInput$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.alphaShapesInputState = state;
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
      this.alphaShapesService.getPoints(),
      new Vector(position.x, position.y),
      function (p1, p2) {
        return p1.dist(p2);
      },
      maxDist
    );

    if (pointIndex >= 0) {
      this.dragState.position.x = this.alphaShapesService.getPoints()[pointIndex].x;
      this.dragState.position.y = this.alphaShapesService.getPoints()[pointIndex].y;

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
    this.alphaShapesService.setAlphaDiscCenter(position.x, position.y);
  }

  dragMovePoint(position: { x: number; y: number }) {
    this.alphaShapesService.removePoint(
      this.dragState.position.x,
      this.dragState.position.y,
      1
    );
    this.alphaShapesService.addPoint(new Vector(position.x, position.y));
    var dist = new Vector(position.x, position.y).dist(
      new Vector(this.dragState.position.x, this.dragState.position.y)
    );
    this.dragState.dist += dist;
    this.dragState.position = position;
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
    this.alphaShapesService.setAlphaDiscCenter(position.x, position.y);
    this.dragState.selected = false;
  }

  dragEndPoint(position: { x: number; y: number }, minDist: number) {
    const dist =
      new Vector(position.x, position.y).dist(
        new Vector(this.dragState.position.x, this.dragState.position.y)
      ) + this.dragState.dist;
    if (this.dragState.selected && dist < this.minMoveDist) {
      this.alphaShapesService.removePoint(
        this.dragState.position.x,
        this.dragState.position.y,
        1
      );
    } else if (dist < minDist) {
      this.alphaShapesService.addPoint(new Vector(position.x, position.y));
    }
    this.dragState.selected = false;
  }

  refresh() {
    if (this.alphaShapesInputState) {
      const width = Math.round(
        this.canvas.nativeElement.getBoundingClientRect().width
      );
      const height = Math.round(
        this.canvas.nativeElement.getBoundingClientRect().height
      );
      const computationOutput = Computations.compute(0, 0, width, height, this.alphaShapesInputState);
      this.alphaShapesService.setComputationOutput(computationOutput);
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
      DrawingController.drawDiagrams(
        new CanvasDrawer(this.canvas.nativeElement),
        width,
        height,
        this.alphaShapesInputState,
        computationOutput,
      );
    }
  }
}
