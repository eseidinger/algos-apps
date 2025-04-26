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
import { LineSegment } from '../geom/linesegment';
import { Polygon } from '../geom/polygon';
import { PathElement } from '../geom/pathelement';
import { Rectangle } from '../geom/rectangle';
import { Bezier } from '../geom/bezier';
import { Circle } from '../geom/circle';
import { HalfPlane } from '../geom/halfplane';
import { AlphaShape } from '../algo/alphashape';
import { VoronoiDelaunay } from '../algo/voronoidelaunay';
import { Skyum } from '../algo/skyum';
import { Fortune, FortuneArc, FortuneBreakpoint } from '../algo/fortune';
import { ConvexHull } from '../algo/convexhull';
import { DrawingController } from '../canvas/drawingcontroller';
import { EdgeList } from '../ds/dcel';
import { Arc } from '../geom/arc';

export class Computations {
    static convexHull: Polygon[] = [];
    static voronoiMin: LineSegment[] = [];
    static voronoiMinBeachLine: Bezier[] = [];
    static delaunayMin: LineSegment[] = [];
    static voronoiMax: LineSegment[] = [];
    static voronoiMaxTriangles: LineSegment[][] = [];
    static voronoiMaxCenters: Vector[] = [];
    static voronoiMaxCircles: PathElement[][] = [];
    static smallestCircle: PathElement[] = [];
    static delaunayMax: LineSegment[] = [];
    static significantAlphas: number[] = [];
    static alphaShapeEdges: LineSegment[] = [];
    static alphaShapeVertices: Vector[] = [];
    static alphaHull: PathElement[][] = [];

    /**
     * Initialize the computation result arrays.
     */
    static init(): void {
        this.convexHull = [];
        this.voronoiMin = [];
        this.voronoiMinBeachLine = [];
        this.delaunayMin = [];
        this.voronoiMax = [];
        this.voronoiMaxTriangles = [];
        this.voronoiMaxCenters = [];
        this.voronoiMaxCircles = [];
        this.smallestCircle = [];
        this.delaunayMax = [];
        this.significantAlphas = [];
        this.alphaShapeEdges = [];
        this.alphaShapeVertices = [];
        this.alphaHull = [];
    }

    /**
     * Compute alpha shape and hull including diagrams they are based on.
     *
     * @param points - Points to compute geometry from
     * @param alpha - Alpha value to compute alpha shape for
     * @param minX - Minimum x coordinate of the viewport
     * @param minY - Minimum y coordinate of the viewport
     * @param maxX - Maximum x coordinate of the viewport
     * @param maxY - Maximum y coordinate of the viewport
     * @param ly - Sweep line position
     */
    static compute(points: Vector[], alpha: number, minX: number, minY: number, maxX: number, maxY: number, ly: number): void {
        this.init();

        const rect = new Rectangle(minX, minY, maxX, maxY);

        const convexHull = ConvexHull.compute(points);
        this.convexHull.push(new Polygon(convexHull, true));
        let voronoiMin: EdgeList | null = null;
        let voronoiMax: EdgeList | null = null;

        if (
            DrawingController.displayAlphaHull ||
            DrawingController.displayAlphaShape ||
            DrawingController.displayBeachLine ||
            DrawingController.displayDelaunayMin ||
            DrawingController.displayVoronoiMin
        ) {
            const fortuneResults = Fortune.computeVoronoiDiagram(points, ly);
            voronoiMin = fortuneResults.voronoiDiagram;

            voronoiMin.getLineSegments().forEach((lineSegment) => {
                const cropped = lineSegment.crop(rect);
                if (cropped !== null) {
                    this.voronoiMin.push(cropped);
                }
            });

            if (
                fortuneResults.constructionBeachLine.length === 1 &&
                fortuneResults.constructionBeachLine[0] instanceof FortuneArc
            ) {
                this.voronoiMinBeachLine.push(
                    fortuneResults.constructionBeachLine[0].toBezier(minX, maxX, ly)!
                );
            } else {
                let lastX = minX;
                fortuneResults.constructionBeachLine.forEach((bp, i, arr) => {
                    if (bp instanceof FortuneBreakpoint) {
                        const bpLocation = bp.getLocation(ly);
                        const xMin = lastX;
                        const xMax = bpLocation.x > maxX ? maxX : bpLocation.x;
                        lastX = xMax;
                        const bezier = bp.leftArc.toBezier(xMin, xMax, ly);
                        if (bezier !== null) {
                            this.voronoiMinBeachLine.push(bezier);
                        }
                        if (i === arr.length - 1) {
                            const bezier = bp.rightArc.toBezier(lastX, maxX, ly);
                            if (bezier !== null) {
                                this.voronoiMinBeachLine.push(bezier);
                            }
                        }
                    }
                });
            }
            this.delaunayMin = VoronoiDelaunay.computeDelaunay(voronoiMin).getLineSegments();
        }

        if (
            DrawingController.displayAlphaHull ||
            DrawingController.displayAlphaShape ||
            DrawingController.displayTriangles ||
            DrawingController.displayDelaunayMax ||
            DrawingController.displayVoronoiMax ||
            DrawingController.displaySmallestCircle
        ) {
            const skyumResults = Skyum.computeVoronoiDiagram(convexHull);

            this.voronoiMaxTriangles = skyumResults.voronoiTriangles.map((triangle) =>
                triangle.getLineSegments()
            );
            this.voronoiMaxCircles = skyumResults.voronoiTriangles.map((triangle) =>
                triangle.getCircumcircle().crop(rect)!
            );
            const voronoiMaxCenters = skyumResults.voronoiTriangles.map((triangle) => {
                const center = triangle.getCircumcircle().center;
                return rect.containsPoint(center) ? center : null;
            });
            this.voronoiMaxCenters = voronoiMaxCenters.filter((center) => center !== null);

            if (skyumResults.smallestCircle !== null) {
                this.smallestCircle = skyumResults.smallestCircle.crop(rect)!;
            }

            voronoiMax = skyumResults.voronoiDiagram;
            voronoiMax.getLineSegments().forEach((lineSegment) => {
                const cropped = lineSegment.crop(rect);
                if (cropped !== null) {
                    this.voronoiMax.push(cropped);
                }
            });
            this.delaunayMax = VoronoiDelaunay.computeDelaunay(voronoiMax).getLineSegments();
        }

        if (DrawingController.displayAlphaHull || DrawingController.displayAlphaShape) {
            if (voronoiMin !== null && voronoiMax !== null) {
                const spectra = AlphaShape.computeShapeSpectra(voronoiMin, voronoiMax);
                this.significantAlphas = spectra.significantAlphas;

                const alphaShape = AlphaShape.computeAlphaShape(
                    alpha,
                    spectra.vertexSpectrum,
                    spectra.edgeSpectrum
                );
                this.alphaShapeEdges = alphaShape.edges;
                this.alphaShapeVertices = alphaShape.vertices;

                const alphaHull = AlphaShape.computeAlphaHull(alpha, spectra.edgeSpectrum);

                alphaHull.forEach((hullElement) => {
                    if (hullElement instanceof Circle) {
                        const path = hullElement.crop(rect);
                        if (path !== null) {
                            this.alphaHull.push(path);
                        }
                    } else if (hullElement instanceof HalfPlane) {
                        const path = hullElement.crop(rect);
                        if (path !== null) {
                            this.alphaHull.push([path]);
                        }
                    }
                });
            }
        }
    }
}