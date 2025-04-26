'use strict';

import constant from '../util/constant';
import comparator from '../util/comparator';
import array from '../util/array';
import { EdgeList } from '../ds/dcel';
import { Circle } from '../geom/circle';
import { HalfPlane } from '../geom/halfplane';
import { LineSegment } from '../geom/linesegment';
import { Vector } from '../geom/vector';
import { VoronoiCell, VoronoiNeighbours, VoronoiDelaunay } from './voronoidelaunay';

/**
 * Calculation of the alpha shape, inverse alpha hull, and significant values for alpha.
 */
export class AlphaShape {
    /**
     * Compute the shape spectra from given Voronoi diagrams.
     *
     * @param closestPointVoronoiDiagram - The closest point Voronoi diagram
     * @param farthestPointVoronoiDiagram - The farthest point Voronoi diagram
     * @returns An object containing vertexSpectrum, edgeSpectrum, and significantAlphas
     */
    public static computeShapeSpectra(
        closestPointVoronoiDiagram: EdgeList,
        farthestPointVoronoiDiagram: EdgeList
    ): {
        vertexSpectrum: VoronoiCell[];
        edgeSpectrum: VoronoiNeighbours[];
        significantAlphas: number[];
    } {
        const farthestVoronoiNeighbours = VoronoiDelaunay.computeVoronoiNeighbours(
            farthestPointVoronoiDiagram
        );
        const farthestVoronoiRegions = VoronoiDelaunay.computeVoronoiCells(
            farthestPointVoronoiDiagram
        );
        const closestVoronoiNeighbours = VoronoiDelaunay.computeVoronoiNeighbours(
            closestPointVoronoiDiagram
        );
        const closestVoronoiRegions = VoronoiDelaunay.computeVoronoiCells(
            closestPointVoronoiDiagram
        );

        let significantAlphas: number[] = [];

        closestVoronoiNeighbours.forEach((neighbour) => {
            const alphaMin = neighbour.getMinDist();
            const alphaMax = neighbour.getMaxDist();
            neighbour.alphaMin = alphaMin;
            if (alphaMax < constant.INFINITY / 2) {
                significantAlphas.push(alphaMax);
                neighbour.alphaMax = alphaMax;
            } else {
                neighbour.alphaMax = constant.INFINITY;
            }
            significantAlphas.push(alphaMin);
        });

        farthestVoronoiNeighbours.forEach((neighbour) => {
            const alphaMin = -1 * neighbour.getMaxDist();
            const alphaMax = -1 * neighbour.getMinDist();
            neighbour.alphaMax = alphaMax;
            if (alphaMin > -1 * constant.INFINITY / 2) {
                neighbour.alphaMin = alphaMin;
                significantAlphas.push(alphaMin);
            } else {
                neighbour.alphaMin = -1 * constant.INFINITY;
            }
            significantAlphas.push(alphaMax);
        });

        closestVoronoiRegions.forEach((region) => {
            const alphaMin = region.getMinDist();
            const alphaMax = region.getMaxDist();
            region.alphaMin = alphaMin;
            if (alphaMax < constant.INFINITY / 2) {
                significantAlphas.push(alphaMax);
                region.alphaMax = alphaMax;
            } else {
                region.alphaMax = constant.INFINITY;
            }
            significantAlphas.push(alphaMin);
        });

        farthestVoronoiRegions.forEach((region) => {
            const alphaMin = -1 * region.getMaxDist();
            const alphaMax = -1 * region.getMinDist();
            region.alphaMax = alphaMax;
            if (alphaMin > -1 * constant.INFINITY / 2) {
                region.alphaMin = alphaMin;
                significantAlphas.push(alphaMin);
            } else {
                region.alphaMin = -1 * constant.INFINITY;
            }
            significantAlphas.push(alphaMax);
        });

        const voronoiNeighbours = farthestVoronoiNeighbours.concat(closestVoronoiNeighbours);
        const voronoiCells = farthestVoronoiRegions.concat(closestVoronoiRegions);

        significantAlphas = array.makeElementsUnique(
            significantAlphas,
            (el1, el2) => comparator.compareWithTolerance(el1, el2) === 0
        );

        return {
            vertexSpectrum: voronoiCells,
            edgeSpectrum: voronoiNeighbours,
            significantAlphas,
        };
    }

    /**
     * Compute the alpha shape from given alpha and shape spectra.
     *
     * @param alpha - The alpha value
     * @param vertexSpectrum - The vertex spectrum
     * @param edgeSpectrum - The edge spectrum
     * @returns An object containing edges and vertices
     */
    public static computeAlphaShape(
        alpha: number,
        vertexSpectrum: VoronoiCell[],
        edgeSpectrum: VoronoiNeighbours[]
    ): { edges: LineSegment[]; vertices: Vector[] } {
        const edges: LineSegment[] = [];
        const vertices: Vector[] = [];

        edgeSpectrum.forEach((edgeSpectrum) => {
            if (
                comparator.compareWithTolerance(alpha, edgeSpectrum.alphaMin) !== -1 &&
                comparator.compareWithTolerance(alpha, edgeSpectrum.alphaMax) !== 1
            ) {
                edges.push(edgeSpectrum.delaunayEdge);
            }
        });

        vertexSpectrum.forEach((vertexSpectrum) => {
            if (comparator.compareWithTolerance(alpha, vertexSpectrum.alphaMax) !== 1) {
                vertices.push(vertexSpectrum.center);
            }
        });

        return { edges, vertices };
    }

    /**
     * Compute the alpha hull from given alpha and edge spectra.
     *
     * @param alpha - The alpha value
     * @param edgeSpectrum - The edge spectrum
     * @returns An array of alpha discs
     */
    public static computeAlphaHull(
        alpha: number,
        edgeSpectrum: VoronoiNeighbours[]
    ): (Circle | HalfPlane)[] {
        let alphaDiscs: (Circle | HalfPlane)[] = [];

        edgeSpectrum.forEach((neighbourPair) => {
            if (
                comparator.compareWithTolerance(alpha, neighbourPair.alphaMin) !== -1 &&
                comparator.compareWithTolerance(alpha, neighbourPair.alphaMax) !== 1
            ) {
                const discs = AlphaShape.computeAlphaDiscs(alpha, neighbourPair);
                alphaDiscs = alphaDiscs.concat(discs);
            }
            if (alpha > 0 && neighbourPair.alphaMax > 0) {
                const discs = AlphaShape.computeBiggestDiscs(alpha, neighbourPair);
                alphaDiscs = alphaDiscs.concat(discs);
            }
        });

        return alphaDiscs;
    }

    /**
     * Compute the biggest possible alpha discs on Voronoi edge with a radius greater or equal to alpha.
     *
     * @param alpha - The alpha value
     * @param neighbourPair - The Voronoi neighbours
     * @returns An array of alpha discs
     */
    private static computeBiggestDiscs(
        alpha: number,
        neighbourPair: VoronoiNeighbours
    ): (Circle | HalfPlane)[] {
        const discs: (Circle | HalfPlane)[] = [];

        const point1 = neighbourPair.delaunayEdge.start;
        const point2 = neighbourPair.delaunayEdge.end;
        const center1 = neighbourPair.commonBorder.start;
        const center2 = neighbourPair.commonBorder.end;
        const circle1 = Circle.createWithPointAndCenter(point1, center1);
        const circle2 = Circle.createWithPointAndCenter(point1, center2);
        const circles = [circle1, circle2];

        circles.forEach((circle) => {
            if (comparator.compareWithTolerance(alpha, circle.radius) !== 1) {
                if (circle.radius < constant.INFINITY / 2) {
                    discs.push(circle);
                } else {
                    const halfPlaneBorder = point2.sub(point1).normalize();
                    const normal = halfPlaneBorder.rotate(Math.PI / 2);
                    const orientation = circle.center.sub(point1).normalize();
                    const product = normal.multiplyVector(orientation);
                    if (product < 0) {
                        halfPlaneBorder.multiplyScalar(-1);
                    }
                    const halfPlane = new HalfPlane(point1, halfPlaneBorder);
                    discs.push(halfPlane);
                }
            }
        });

        return discs;
    }

    /**
     * Compute the alpha discs with the centers of the Voronoi neighbours on their border.
     *
     * @param alpha - The alpha value
     * @param neighbourPair - The Voronoi neighbours
     * @returns An array of alpha discs
     */
    private static computeAlphaDiscs(
        alpha: number,
        neighbourPair: VoronoiNeighbours
    ): Circle[] {
        const discs: Circle[] = [];

        const alphaAbs = Math.abs(alpha);
        const point1 = neighbourPair.delaunayEdge.start;
        const point2 = neighbourPair.delaunayEdge.end;

        const circles = Circle.createWith2PointsAndRadius(point1, point2, alphaAbs);
        if (circles.length === 1) {
            discs.push(circles[0]);
        } else if (circles.length === 2) {
            circles.forEach((circle) => {
                if (neighbourPair.commonBorder.containsPoint(circle.center)) {
                    discs.push(circle);
                }
            });
        }

        return discs;
    }
}