import { Routes } from '@angular/router';
import { AlphaShapesComponent } from './alpha-shapes/alpha-shapes.component';
import { ComplexityComponent } from './complexity/complexity.component';
import { HomeComponent } from './home/home.component';

export enum Apps {
    HOME = "Algorithms in Angular",
    ALPHA_SHAPES = "Alpha Shapes",
    COMPLEXITY = "Complexity",
}

export const appList = [
    { title: Apps.HOME, path: "", component: HomeComponent },
    { title: Apps.ALPHA_SHAPES, path: "alpha-shapes", component: AlphaShapesComponent },
    { title: Apps.COMPLEXITY, path: "complexity", component: ComplexityComponent },
];

export function getAppName(path: string): Apps {
    const app = appList.find(app => app.path === path);
    if (app) {
        return app.title;
    } else {
        throw new Error(`App not found for path: ${path}`);
    }
}

const appRoutes: Routes = appList.map(app => (app));

export const routes: Routes = [
    ...appRoutes,
    { path: "**", redirectTo: "/" },
];
