import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum HeaderEvent {
  VoronoiDialog = 'VoronoiDialog',
  AlphaShapesDialog = 'AlphaShapesDialog',
}

@Injectable({
  providedIn: 'root'
})
export class HeaderEventService {
  private headerEventSource = new Subject<HeaderEvent>();
  headerEvent$ = this.headerEventSource.asObservable();

  emitHeaderEvent(event: HeaderEvent) {
    this.headerEventSource.next(event);
  }

  constructor() { }
}
