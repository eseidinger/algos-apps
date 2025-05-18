import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Apps, getAppName } from './app.routes';
import { HeaderEvent, HeaderEventService } from './header-event.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterModule, MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'algos-angular';

  constructor(private router: Router, private headerEventService: HeaderEventService) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.title = getAppName(this.router.url.split('/')[1]);
    });
  }

  isAlphaShapes(): boolean {
    return this.title === Apps.ALPHA_SHAPES;
  }

  openVoronoiDialog() {
    this.headerEventService.emitHeaderEvent(HeaderEvent.VoronoiDialog);
  }
}
