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

import { Drawer } from './drawer';
import { Vector } from '../geom/vector';
import { PathElement } from '../geom/pathelement';
import { LineSegment } from '../geom/linesegment';
import { ComputationOutput } from '../application/computations';

export interface AlphaShapesInputState {
    showVoronoiMax: boolean;
    showVoronoiMin: boolean;
    showTriangles: boolean;
    selectedTriangle: number;
    showBeachLine: boolean;
    sweepLinePercentage: number;
    showDelaunayMax: boolean;
    showDelaunayMin: boolean;
    showAlphaShape: boolean;
    showAlphaHull: boolean;
    showAlphaDisc: boolean;
    showSmallestCircle: boolean;
    showConvexHull: boolean;
    alpha: number;
    alphaDiscCenter: Vector;
    points: Vector[];
}

export class DrawingController {
    // Constants for diagram appearance
    static convexHullLineWidth = 2;
    static convexHullColor = '#000000';
    static convexHullOpacity = 1;
    static smallestCircleLineWidth = 2;
    static smallestCircleColor = '#000000';
    static smallestCircleOpacity = 1;
    static voronoiLineWidth = 2;
    static voronoiColor = '#0000ff';
    static voronoiOpacity = 0.5;
    static beachLineLineWidth = 2;
    static beachLineColor = '#008000';
    static beachLineOpacity = 0.5;
    static trianglesLineWidth = 2;
    static trianglesColor = '#008000';
    static trianglesOpacity = 0.5;
    static delaunayLineWidth = 2;
    static delaunayColor = '#ff0000';
    static delaunayOpacity = 0.5;
    static alphaShapeLineWidth = 10;
    static alphaShapePointSize = 12;
    static alphaShapeColor = '#ff0000';
    static alphaShapeOpacity = 0.2;
    static alphaHullColor = '#008000';
    static alphaHullOpacity = 0.2;

    /**
     * Draw diagrams using the given canvas drawer.
     *
     * @param canvasDrawer - The drawer to use for drawing
     */
    static drawDiagrams(canvasDrawer: Drawer, canvasWidth: number, canvasHeight: number, alphaShapesInputState: AlphaShapesInputState, computationOutput: ComputationOutput): void {
        const sweepLinePosition = Math.round(alphaShapesInputState.sweepLinePercentage / 100 * canvasHeight);
        if (alphaShapesInputState.showAlphaHull) {
            this.drawAlphaHull(canvasDrawer, computationOutput, alphaShapesInputState);
        }
        if (alphaShapesInputState.showDelaunayMin) {
            canvasDrawer.drawPathElements(
                computationOutput.delaunayMin,
                this.delaunayLineWidth,
                this.delaunayColor,
                this.delaunayOpacity
            );
        }
        if (alphaShapesInputState.showVoronoiMin) {
            canvasDrawer.drawPathElements(
                computationOutput.voronoiMin,
                this.voronoiLineWidth,
                this.voronoiColor,
                this.voronoiOpacity
            );
        }
        if (alphaShapesInputState.showBeachLine) {
            const sweepLine = new LineSegment(
                new Vector(0, sweepLinePosition),
                new Vector(canvasWidth, sweepLinePosition)
            );
            canvasDrawer.drawPathElements(
                [sweepLine],
                this.beachLineLineWidth,
                this.beachLineColor,
                this.beachLineOpacity
            );
            canvasDrawer.drawPath(
                computationOutput.voronoiMinBeachLine,
                this.beachLineLineWidth,
                this.beachLineColor,
                this.beachLineOpacity
            );
        }
        if (alphaShapesInputState.showDelaunayMax) {
            canvasDrawer.drawPathElements(
                computationOutput.delaunayMax,
                this.delaunayLineWidth,
                this.delaunayColor,
                this.delaunayOpacity
            );
        }
        if (alphaShapesInputState.showVoronoiMax) {
            canvasDrawer.drawPathElements(
                computationOutput.voronoiMax,
                this.voronoiLineWidth,
                this.voronoiColor,
                this.voronoiOpacity
            );
        }
        if (alphaShapesInputState.showTriangles) {
            if (alphaShapesInputState.selectedTriangle > -1) {
                canvasDrawer.drawPathElements(
                    computationOutput.voronoiMaxTriangles[alphaShapesInputState.selectedTriangle],
                    this.trianglesLineWidth,
                    this.trianglesColor,
                    this.trianglesOpacity
                );
                if (computationOutput.voronoiMaxCenters[alphaShapesInputState.selectedTriangle] !== null) {
                    canvasDrawer.drawPoints(
                        [computationOutput.voronoiMaxCenters[alphaShapesInputState.selectedTriangle]!],
                        10,
                        this.trianglesColor,
                        0.5
                    );
                }
                canvasDrawer.drawPathElements(
                    computationOutput.voronoiMaxCircles[alphaShapesInputState.selectedTriangle],
                    this.trianglesLineWidth,
                    this.trianglesColor,
                    this.trianglesOpacity
                );
            }
        }
        if (alphaShapesInputState.showSmallestCircle) {
            canvasDrawer.drawPathElements(computationOutput.smallestCircle, 1, 'black', 1);
        }
        if (alphaShapesInputState.showConvexHull) {
            canvasDrawer.drawPathElements(computationOutput.convexHull, 1, 'black', 1);
        }
        if (alphaShapesInputState.showAlphaShape) {
            this.drawAlphaShape(canvasDrawer, computationOutput);
        }
        canvasDrawer.drawPoints(alphaShapesInputState.points, 5, 'black', 1);
        if (alphaShapesInputState.showAlphaDisc) {
            this.drawAlphaDisc(canvasDrawer, alphaShapesInputState);
        }
    }

    /**
     * Draw alpha shape using the given canvas drawer.
     *
     * @param canvasDrawer - The drawer to use for drawing
     */
    static drawAlphaShape(canvasDrawer: Drawer, computationOutput: ComputationOutput): void {
        canvasDrawer.drawPathElements(
            computationOutput.alphaShapeEdges,
            this.alphaShapeLineWidth,
            this.alphaShapeColor,
            this.alphaShapeOpacity
        );
        canvasDrawer.drawPoints(
            computationOutput.alphaShapeVertices,
            this.alphaShapePointSize,
            this.alphaShapeColor,
            this.alphaShapeOpacity
        );
    }

    /**
     * Draw alpha hull using the given canvas drawer.
     *
     * @param canvasDrawer - The drawer to use for drawing
     */
    static drawAlphaHull(canvasDrawer: Drawer, computationOutput: ComputationOutput, alphaShapesInputState: AlphaShapesInputState): void {
        if (alphaShapesInputState.points.length > 1) {
            canvasDrawer.fillCanvas(this.alphaHullColor, this.alphaHullOpacity);
            if (alphaShapesInputState.alpha < 0) {
                computationOutput.alphaHull.forEach((path: PathElement[]) => {
                    canvasDrawer.fillPathInverted(path, 'white', 1);
                });
            } else if (alphaShapesInputState.alpha > 0) {
                computationOutput.alphaHull.forEach((path: PathElement[]) => {
                    canvasDrawer.fillPath(path, 'white', 1);
                });
            }
        }
    }

    /**
     * Draw alpha disc using the given canvas drawer.
     *
     * @param canvasDrawer - The drawer to use for drawing
     */
    static drawAlphaDisc(canvasDrawer: Drawer, alphaShapesInputState: AlphaShapesInputState): void {
        let color = 'green';
        if (alphaShapesInputState.alpha < 0) {
            alphaShapesInputState.points.forEach((point: Vector) => {
                if (alphaShapesInputState.alphaDiscCenter.dist(point) > -alphaShapesInputState.alpha) {
                    color = 'red';
                }
            });
        } else {
            alphaShapesInputState.points.forEach((point: Vector) => {
                if (alphaShapesInputState.alphaDiscCenter.dist(point) < alphaShapesInputState.alpha) {
                    color = 'red';
                }
            });
        }
        canvasDrawer.drawPoints([alphaShapesInputState.alphaDiscCenter], 5, color, 0.2);
        if (alphaShapesInputState.alpha !== 0) {
            canvasDrawer.drawPoints(
                [alphaShapesInputState.alphaDiscCenter],
                Math.abs(alphaShapesInputState.alpha),
                color,
                0.2
            );
        }
    }
}