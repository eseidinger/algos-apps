/**
 Copyright 2013-2014 Emanuel Seidinger

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { Vector } from '../geom/vector';
import { PathElement } from '../geom/pathelement';
import { Drawer } from './drawer';
import { LineSegment } from '../geom/linesegment';
import { Arc } from '../geom/arc';
import { Circle } from '../geom/circle';
import { Bezier } from '../geom/bezier';
import { Polygon } from '../geom/polygon';

/**
 * Implements the Drawer interface using SVG methods with Raphael.
 */
export class SvgDrawer implements Drawer {
    private paper: any; // Raphael paper object

    constructor(paper: any) {
        this.paper = paper;
    }

    drawPoints(points: Vector[], radius: number, color: string, alpha: number): void {
        const drawPoints = points.map((pt) => new Circle(pt, radius));
        this.fillPathElements(drawPoints, color, alpha);
    }

    fillCanvas(color: string, alpha: number): void {
        const element = this.paper.rect(0, 0, this.paper.width, this.paper.height);
        element.attr('fill', color);
        element.attr('fill-opacity', alpha);
    }

    private createPathString(element: PathElement): string {
        let pathString = '';
        if (element instanceof LineSegment) {
            pathString = `L${element.end.x},${element.end.y}`;
        } else if (element instanceof Arc) {
            const angleDiff = element.clockwise
                ? element.endAngle - element.startAngle
                : element.startAngle - element.endAngle;
            const sweepFlag = element.clockwise ? 1 : 0;
            const largeArcFlag = Math.abs(angleDiff) > Math.PI ? 1 : 0;
            pathString = `A${element.radius},${element.radius},0,${largeArcFlag},${sweepFlag},${element.end.x},${element.end.y}`;
        } else if (element instanceof Circle) {
            pathString = `a${element.radius},${element.radius},0,1,1,0,-1`;
        } else if (element instanceof Bezier) {
            pathString = `Q${element.controlPoints[0].x},${element.controlPoints[0].y},${element.end.x},${element.end.y}`;
        } else if (element instanceof Polygon) {
            element.points.forEach((point) => {
                pathString += `L${point.x},${point.y}`;
            });
            if (element.closed) {
                pathString += `L${element.start.x},${element.start.y}`;
            }
        }
        return pathString;
    }

    private drawPathString(pathString: string, lineWidth: number, color: string, alpha: number): void {
        const element = this.paper.path(pathString);
        element.attr('stroke', color);
        element.attr('stroke-width', lineWidth);
        element.attr('stroke-opacity', alpha);
    }

    private fillPathString(pathString: string, color: string, alpha: number): void {
        const element = this.paper.path(pathString);
        element.attr('stroke', color);
        element.attr('stroke-opacity', alpha);
        element.attr('fill', color);
        element.attr('fill-opacity', alpha);
    }

    drawPathElements(path: PathElement[], lineWidth: number, color: string, alpha: number): void {
        path.forEach((element) => {
            let pathString = `M${element.start.x},${element.start.y}`;
            pathString += this.createPathString(element);
            this.drawPathString(pathString, lineWidth, color, alpha);
        });
    }

    fillPathElements(path: PathElement[], color: string, alpha: number): void {
        path.forEach((element) => {
            let pathString = `M${element.start.x},${element.start.y}`;
            pathString += this.createPathString(element) + 'Z';
            this.fillPathString(pathString, color, alpha);
        });
    }

    drawPath(path: PathElement[], lineWidth: number, color: string, alpha: number): void {
        if (path.length > 0) {
            let pathString = `M${path[0].start.x},${path[0].start.y}`;
            path.forEach((element) => {
                pathString += this.createPathString(element);
            });
            this.drawPathString(pathString, lineWidth, color, alpha);
        }
    }

    fillPath(path: PathElement[], color: string, alpha: number): void {
        if (path.length > 0) {
            let pathString = `M${path[0].start.x},${path[0].start.y}`;
            path.forEach((element) => {
                pathString += this.createPathString(element);
            });
            pathString += 'Z';
            this.fillPathString(pathString, color, alpha);
        }
    }

    fillPathInverted(path: PathElement[], color: string, alpha: number): void {
        if (path.length > 0) {
            const h = this.paper.height;
            const w = this.paper.width;
            let pathString = 'M0,0';
            pathString += `L0,${h}`;
            pathString += `L${w},${h}`;
            pathString += `L${w},0`;
            pathString += 'Z';
            pathString += `M${path[0].start.x},${path[0].start.y}`;
            path.forEach((element) => {
                pathString += this.createPathString(element);
            });
            pathString += 'Z';
            this.fillPathString(pathString, color, alpha);
        }
    }
}