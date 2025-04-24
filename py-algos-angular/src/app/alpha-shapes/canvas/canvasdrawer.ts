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
import { Circle } from '../geom/circle';
import { Drawer } from './drawer';
import { LineSegment } from '../geom/linesegment';
import { Arc } from '../geom/arc';
import { Bezier } from '../geom/bezier';
import { Polygon } from '../geom/polygon';

/**
 * Implements the Drawer interface using canvas methods.
 */
export class CanvasDrawer implements Drawer {
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    drawPoints(points: Vector[], radius: number, color: string, alpha: number): void {
        const drawPoints = points.map((pt) => new Circle(pt, radius));
        this.fillPathElements(drawPoints, color, alpha);
    }

    fillCanvas(color: string, alpha: number): void {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.canvas.width, 0);
            ctx.lineTo(this.canvas.width, this.canvas.height);
            ctx.lineTo(0, this.canvas.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    private drawPathElement(pathElement: PathElement, ctx: CanvasRenderingContext2D): void {
        if (pathElement instanceof LineSegment) {
            ctx.lineTo(pathElement.end.x, pathElement.end.y);
        } else if (pathElement instanceof Arc) {
            ctx.arc(
                pathElement.center.x,
                pathElement.center.y,
                pathElement.radius,
                pathElement.startAngle,
                pathElement.endAngle,
                !pathElement.clockwise
            );
        } else if (pathElement instanceof Circle) {
            ctx.arc(
                pathElement.center.x,
                pathElement.center.y,
                pathElement.radius,
                0,
                2 * Math.PI,
                false
            );
        } else if (pathElement instanceof Bezier) {
            ctx.quadraticCurveTo(
                pathElement.controlPoints[0].x,
                pathElement.controlPoints[0].y,
                pathElement.end.x,
                pathElement.end.y
            );
        } else if (pathElement instanceof Polygon) {
            pathElement.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
            });
            if (pathElement.closed) {
                ctx.lineTo(pathElement.start.x, pathElement.start.y);
            }
        }
    }

    drawPathElements(path: PathElement[], lineWidth: number, color: string, alpha: number): void {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = lineWidth;
            path.forEach((element) => {
                ctx.beginPath();
                ctx.moveTo(element.start.x, element.start.y);
                this.drawPathElement(element, ctx);
                ctx.stroke();
            });
        }
    }

    fillPathElements(path: PathElement[], color: string, alpha: number): void {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            path.forEach((element) => {
                ctx.beginPath();
                ctx.moveTo(element.start.x, element.start.y);
                this.drawPathElement(element, ctx);
                ctx.fill();
            });
        }
    }

    drawPath(path: PathElement[], lineWidth: number, color: string, alpha: number): void {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            if (path.length > 0) {
                ctx.moveTo(path[0].start.x, path[0].start.y);
            }
            path.forEach((element) => {
                this.drawPathElement(element, ctx);
            });
            ctx.stroke();
        }
    }

    fillPath(path: PathElement[], color: string, alpha: number): void {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (path.length > 0) {
                ctx.moveTo(path[0].start.x, path[0].start.y);
            }
            path.forEach((element) => {
                this.drawPathElement(element, ctx);
            });
            ctx.fill();
        }
    }

    fillPathInverted(path: PathElement[], color: string, alpha: number): void {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, this.canvas.height);
            ctx.lineTo(this.canvas.width, this.canvas.height);
            ctx.lineTo(this.canvas.width, 0);
            ctx.closePath();
            if (path.length > 0) {
                ctx.moveTo(path[0].start.x, path[0].start.y);
            }
            path.forEach((element) => {
                this.drawPathElement(element, ctx);
            });
            ctx.fill();
        }
    }
}