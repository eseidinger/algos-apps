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
import { DrawingController, AlphaShapesInputState } from '../canvas/drawingcontroller';
import { EdgeList } from '../ds/dcel';

export interface ComputationOutput {
    convexHull: Polygon[];
    voronoiMin: LineSegment[];
    voronoiMinBeachLine: Bezier[];
    delaunayMin: LineSegment[];
    voronoiMax: LineSegment[];
    voronoiMaxTriangles: LineSegment[][];
    voronoiMaxCenters: Vector[];
    voronoiMaxCircles: PathElement[][];
    smallestCircle: PathElement[];
    delaunayMax: LineSegment[];
    significantAlphas: number[];
    alphaShapeEdges: LineSegment[];
    alphaShapeVertices: Vector[];
    alphaHull: PathElement[][];
}

export class Computations {

    /**
     * Compute alpha shape and hull including diagrams they are based on.
     *
     * @param points - Points to compute geometry from
     * @param alpha - Alpha value to compute alpha shape for
     * @param minX - Minimum x coordinate of the viewport
     * @param minY - Minimum y coordinate of the viewport
     * @param maxX - Maximum x coordinate of the viewport
     * @param maxY - Maximum y coordinate of the viewport
     * @param sweepLine - Sweep line position
     */
    static compute(minX: number, minY: number, maxX: number, maxY: number, alphaShapesInputState: AlphaShapesInputState): ComputationOutput {
        const computationOutput: ComputationOutput = {
            convexHull: [],
            voronoiMin: [],
            voronoiMinBeachLine: [],
            delaunayMin: [],
            voronoiMax: [],
            voronoiMaxTriangles: [],
            voronoiMaxCenters: [],
            voronoiMaxCircles: [],
            smallestCircle: [],
            delaunayMax: [],
            significantAlphas: [],
            alphaShapeEdges: [],
            alphaShapeVertices: [],
            alphaHull: [],
        };
        const rect = new Rectangle(minX, minY, maxX, maxY);

        const relevantPoints = alphaShapesInputState.points.filter((point) => rect.containsPoint(point));

        const sweepLine = Math.round(alphaShapesInputState.sweepLinePercentage / 100 * maxY);

        const convexHull = ConvexHull.compute(relevantPoints);
        if (convexHull.length > 0) {
            computationOutput.convexHull.push(new Polygon(convexHull, true));
        }
        let voronoiMin: EdgeList | null = null;
        let voronoiMax: EdgeList | null = null;

        if (
            DrawingController.displayAlphaHull ||
            DrawingController.displayAlphaShape ||
            alphaShapesInputState.showBeachLine ||
            alphaShapesInputState.showDelaunayMin ||
            alphaShapesInputState.showVoronoiMin
        ) {
            const fortuneResults = Fortune.computeVoronoiDiagram(relevantPoints, sweepLine);
            voronoiMin = fortuneResults.voronoiDiagram;

            voronoiMin.getLineSegments().forEach((lineSegment) => {
                const cropped = lineSegment.crop(rect);
                if (cropped !== null) {
                    computationOutput.voronoiMin.push(cropped);
                }
            });

            if (
                fortuneResults.constructionBeachLine.length === 1 &&
                fortuneResults.constructionBeachLine[0] instanceof FortuneArc
            ) {
                computationOutput.voronoiMinBeachLine.push(
                    fortuneResults.constructionBeachLine[0].toBezier(minX, maxX, sweepLine)!
                );
            } else {
                let lastX = minX;
                fortuneResults.constructionBeachLine.forEach((bp, i, arr) => {
                    if (bp instanceof FortuneBreakpoint) {
                        const bpLocation = bp.getLocation(sweepLine);
                        const xMin = lastX;
                        const xMax = bpLocation.x > maxX ? maxX : bpLocation.x;
                        lastX = xMax;
                        const bezier = bp.leftArc.toBezier(xMin, xMax, sweepLine);
                        if (bezier !== null) {
                            computationOutput.voronoiMinBeachLine.push(bezier);
                        }
                        if (i === arr.length - 1) {
                            const bezier = bp.rightArc.toBezier(lastX, maxX, sweepLine);
                            if (bezier !== null) {
                                computationOutput.voronoiMinBeachLine.push(bezier);
                            }
                        }
                    }
                });
            }
            computationOutput.delaunayMin = VoronoiDelaunay.computeDelaunay(voronoiMin).getLineSegments();
        }

        if (
            DrawingController.displayAlphaHull ||
            DrawingController.displayAlphaShape ||
            alphaShapesInputState.showTriangles ||
            alphaShapesInputState.showDelaunayMax ||
            alphaShapesInputState.showVoronoiMax ||
            DrawingController.displaySmallestCircle
        ) {
            const skyumResults = Skyum.computeVoronoiDiagram(convexHull);

            computationOutput.voronoiMaxTriangles = skyumResults.voronoiTriangles.map((triangle) =>
                triangle.getLineSegments()
            );
            computationOutput.voronoiMaxCircles = skyumResults.voronoiTriangles.map((triangle) =>
                triangle.getCircumcircle().crop(rect)!
            );
            const voronoiMaxCenters = skyumResults.voronoiTriangles.map((triangle) => {
                const center = triangle.getCircumcircle().center;
                return rect.containsPoint(center) ? center : null;
            });
            computationOutput.voronoiMaxCenters = voronoiMaxCenters.filter((center) => center !== null);

            if (skyumResults.smallestCircle !== null) {
                computationOutput.smallestCircle = skyumResults.smallestCircle.crop(rect)!;
            }

            voronoiMax = skyumResults.voronoiDiagram;
            voronoiMax.getLineSegments().forEach((lineSegment) => {
                const cropped = lineSegment.crop(rect);
                if (cropped !== null) {
                    computationOutput.voronoiMax.push(cropped);
                }
            });
            computationOutput.delaunayMax = VoronoiDelaunay.computeDelaunay(voronoiMax).getLineSegments();
        }

        if (DrawingController.displayAlphaHull || DrawingController.displayAlphaShape) {
            if (voronoiMin !== null && voronoiMax !== null) {
                const spectra = AlphaShape.computeShapeSpectra(voronoiMin, voronoiMax);
                computationOutput.significantAlphas = spectra.significantAlphas;

                const alphaShape = AlphaShape.computeAlphaShape(
                    alphaShapesInputState.alpha,
                    spectra.vertexSpectrum,
                    spectra.edgeSpectrum
                );
                computationOutput.alphaShapeEdges = alphaShape.edges;
                computationOutput.alphaShapeVertices = alphaShape.vertices;

                const alphaHull = AlphaShape.computeAlphaHull(alphaShapesInputState.alpha, spectra.edgeSpectrum);

                alphaHull.forEach((hullElement) => {
                    if (hullElement instanceof Circle) {
                        const path = hullElement.crop(rect);
                        if (path !== null) {
                            computationOutput.alphaHull.push(path);
                        }
                    } else if (hullElement instanceof HalfPlane) {
                        const path = hullElement.crop(rect);
                        if (path !== null) {
                            computationOutput.alphaHull.push([path]);
                        }
                    }
                });
            }
        }

        return computationOutput;
    }
}