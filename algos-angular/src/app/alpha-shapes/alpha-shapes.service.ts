import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlphaShapesInputState } from './canvas/drawingcontroller';
import { Vector } from './geom/vector';
import array from './util/array';
import { ComputationOutput } from './application/computations';

@Injectable({
  providedIn: 'root',
})
export class AlphaShapesService {
  private alphaShapesInputStateSource = new BehaviorSubject<AlphaShapesInputState>({
    showVoronoiMax: false,
    showVoronoiMin: true,
    showTriangles: false,
    selectedTriangle: -1,
    showBeachLine: false,
    sweepLinePercentage: 0,
    showDelaunayMax: false,
    showDelaunayMin: false,
    showAlphaShape: false,
    showAlphaHull: false,
    showAlphaDisc: false,
    showSmallestCircle: false,
    showConvexHull: true,
    alpha: 75,
    alphaDiscCenter: new Vector(10, 10),
    points: [],
  });
  alphaShapesInput$ = this.alphaShapesInputStateSource.asObservable();

  private alphaShapesOutputSource = new BehaviorSubject<ComputationOutput | undefined>(undefined);
  computationOutput$ = this.alphaShapesOutputSource.asObservable();


  updateAlphaShapesInputState(newState: Partial<AlphaShapesInputState>) {
    const currentState = this.alphaShapesInputStateSource.getValue();
    this.alphaShapesInputStateSource.next({ ...currentState, ...newState });
  }

  setAlpha(sliderValue: number) {
    const currentState = this.alphaShapesInputStateSource.getValue();
    const { min, max } = this.getAlphaMinMax();
    if (sliderValue <= min) {
      currentState.alpha = -Infinity;
    } else if (sliderValue >= max) {
      currentState.alpha = Infinity;
    } else {
      currentState.alpha = sliderValue;
    }
    this.updateAlphaShapesInputState(currentState);
  }

  setAlphaDiscCenter(x: number, y: number) {
    const currentState = this.alphaShapesInputStateSource.getValue();
    currentState.alphaDiscCenter = new Vector(x, y);
    this.updateAlphaShapesInputState(currentState);
  }

  addPoint(point: Vector) {
    const currentState = this.alphaShapesInputStateSource.getValue();
    currentState.points.push(point);
    this.updateAlphaShapesInputState(currentState);
  }

  getPoints() {
    const currentState = this.alphaShapesInputStateSource.getValue();
    return currentState.points;
  }

  removePoint(x: number, y: number, maxDist: number) {
    const currentState = this.alphaShapesInputStateSource.getValue();
    const pointIndex = array.indexOfElementWithMinimalDistance(
      currentState.points,
      new Vector(x, y),
      (p1, p2) => p1.dist(p2),
      maxDist
    );

    if (pointIndex >= 0) {
      currentState.points.splice(pointIndex, 1);
    }
    this.updateAlphaShapesInputState(currentState);
  }

  setComputationOutput(output: ComputationOutput) {
    this.alphaShapesOutputSource.next(output);
  }

  getAlphaMinMax(): { min: number; max: number } {
    const significantAlphas = this.alphaShapesOutputSource.getValue()?.significantAlphas;
    if (!significantAlphas || significantAlphas.length === 0) {
      return { min: -100, max: 100 };
    }
    const sortedAlphas = significantAlphas.sort((a, b) => a - b);
    const minAlpha = Math.round(sortedAlphas[0]);
    const maxAlpha = Math.round(sortedAlphas[sortedAlphas.length - 1]);
    return { min: minAlpha - 10, max: maxAlpha + 10 };
  }

  constructor() { }
}
