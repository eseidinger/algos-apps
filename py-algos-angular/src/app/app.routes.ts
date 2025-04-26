import { Routes } from '@angular/router';
import { AlphaShapesComponent } from './alpha-shapes/alpha-shapes.component';
import { ComplexityComponent } from './complexity/complexity.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "alpha-shapes", component: AlphaShapesComponent },
    { path: "complexity", component: ComplexityComponent },
    { path: "**", redirectTo: "/" },
];
