import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SharedData } from './application/shareddata';
import { VoronoiState } from './canvas/drawingcontroller';

@Injectable({
  providedIn: 'root',
})
export class AlphaShapesService {
  private voronoiStateSource = new BehaviorSubject<VoronoiState>({
    showVoronoiMax: false,
    showVoronoiMin: true,
    showTriangles: false,
    showBeachLine: false,
    sweepLinePercentage: 0,
    showDelaunayMax: false,
    showDelaunayMin: false,
  });

  voronoiState$ = this.voronoiStateSource.asObservable();

  updateVoronoiState(newState: Partial<VoronoiState>) {
    const currentState = this.voronoiStateSource.getValue();
    this.voronoiStateSource.next({ ...currentState, ...newState });
  }

  constructor() {}
}
