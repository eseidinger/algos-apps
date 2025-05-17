import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Apps, getAppName } from './app.routes';
import { AlphaShapesControlsComponent } from "./alpha-shapes/alpha-shapes-controls/alpha-shapes-controls.component";

@Component({
  selector: 'app-root',
  imports: [RouterModule, MatSidenavModule, MatListModule, MatToolbarModule, AlphaShapesControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'algos-angular';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.title = getAppName(this.router.url.split('/')[1]);
    });
  }

  isAlphaShapes(): boolean {
    return this.title === Apps.ALPHA_SHAPES;
  }
}
