import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { HeaderEvent, HeaderEventService } from '../../header-event.service';

@Component({
  selector: 'app-alpha-shapes-controls',
  imports: [MatButtonModule],
  templateUrl: './alpha-shapes-controls.component.html',
  styleUrl: './alpha-shapes-controls.component.scss'
})
export class AlphaShapesControlsComponent {

  constructor(private headerEventService: HeaderEventService) { }

  openVoronoiDialog() {
    this.headerEventService.emitHeaderEvent(HeaderEvent.VoronoiDialog);
  }
}
