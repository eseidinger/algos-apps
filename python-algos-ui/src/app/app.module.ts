import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PyodideComponent } from './pyodide/pyodide.component';
import { MazeComponent } from './maze/maze.component';
import { StackComponent } from './stack/stack.component';

@NgModule({
  declarations: [
    AppComponent,
    PyodideComponent,
    MazeComponent,
    StackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
