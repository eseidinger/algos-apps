import { Vector } from './vector';
import { LineSegment } from './linesegment';
import comparator from '../util/comparator';
import arrayFunctions from '../util/array';

/**
 * A rectangle.
 */
export class Rectangle {
    public readonly xMin: number;
    public readonly yMin: number;
    public readonly xMax: number;
    public readonly yMax: number;
    public readonly corners: Vector[];
    public readonly lineSegments: LineSegment[];

    /**
     * Constructor for the Rectangle class.
     *
     * @param xMin - Minimum x coordinate
     * @param yMin - Minimum y coordinate
     * @param xMax - Maximum x coordinate
     * @param yMax - Maximum y coordinate
     */
    constructor(xMin: number, yMin: number, xMax: number, yMax: number) {
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;

        this.corners = [
            new Vector(xMin, yMin),
            new Vector(xMax, yMin),
            new Vector(xMax, yMax),
            new Vector(xMin, yMax),
        ];

        this.lineSegments = [
            new LineSegment(this.corners[0], this.corners[1]),
            new LineSegment(this.corners[1], this.corners[2]),
            new LineSegment(this.corners[2], this.corners[3]),
            new LineSegment(this.corners[3], this.corners[0]),
        ];
    }

    /**
     * Calculate intersecting points of a line segment with this rectangle in clockwise orientation.
     *
     * @param line - The line segment to intersect with
     * @returns An array of intersecting points
     */
    public getIntersections(line: LineSegment): Vector[] {
        const intersections = this.lineSegments
            .map((ls) => ls.getIntersection(line))
            .filter((inter): inter is Vector => inter !== null);
        return arrayFunctions.makeElementsUnique(intersections);
    }

    /**
     * Determines if a point lies in this rectangle.
     *
     * @param point - The point to check
     * @returns True if the point lies in the rectangle, false otherwise
     */
    public containsPoint(point: Vector): boolean {
        return (
            comparator.compareWithTolerance(point.x, this.xMin) !== -1 &&
            comparator.compareWithTolerance(point.x, this.xMax) !== 1 &&
            comparator.compareWithTolerance(point.y, this.yMin) !== -1 &&
            comparator.compareWithTolerance(point.y, this.yMax) !== 1
        );
    }

    /**
     * Determines the minimum distance of a point from a border of this rectangle.
     *
     * @param point - The point to calculate the distance from
     * @returns The absolute minimum distance from the border
     */
    public getMinimumDistanceFromBorder(point: Vector): number {
        const distances = [
            Math.abs(point.x - this.xMin),
            Math.abs(point.x - this.xMax),
            Math.abs(point.y - this.yMin),
            Math.abs(point.y - this.yMax),
        ];
        distances.sort(comparator.compare);
        return distances[0];
    }

    /**
     * Determines the maximum distance of a point from a border of this rectangle.
     *
     * @param point - The point to calculate the distance from
     * @returns The absolute maximum distance from the border
     */
    public getMaximumDistanceFromBorder(point: Vector): number {
        const distances = this.corners.map((p) => p.sub(point).abs());
        distances.sort(comparator.compare);
        return distances[3];
    }

    /**
     * Crops a line segment to fit within this rectangle.
     *
     * @param lineSegment - The line segment to crop
     * @returns A cropped LineSegment instance, or null if no valid segment exists
     */
    public cropLineSegment(lineSegment: LineSegment): LineSegment | null {
        const point1 = lineSegment.start;
        const point2 = lineSegment.end;

        if (this.containsPoint(point1) && this.containsPoint(point2)) {
            return lineSegment;
        } else if (this.containsPoint(point1) && !this.containsPoint(point2)) {
            const intersections = this.getIntersections(lineSegment);
            return new LineSegment(point1, intersections[0]);
        } else if (!this.containsPoint(point1) && this.containsPoint(point2)) {
            const intersections = this.getIntersections(lineSegment);
            return new LineSegment(intersections[0], point2);
        } else {
            const intersections = this.getIntersections(lineSegment);
            if (intersections.length === 2) {
                return new LineSegment(intersections[0], intersections[1]);
            } else {
                return null;
            }
        }
    }

    /**
     * Determines whether a point lies on the border of this rectangle.
     *
     * @param point - The point to check
     * @returns True if the point lies on the border, false otherwise
     */
    public liesOnBorder(point: Vector): boolean {
        return this.lineSegments.some((border) => border.containsPoint(point));
    }

    /**
     * Determines a clockwise path on this rectangle from a given start to a given end point.
     *
     * @param start - The starting point of the path
     * @param end - The ending point of the path
     * @returns An array of points representing the path
     */
    public getPathOnBorder(start: Vector, end: Vector): Vector[] {
        const points: Vector[] = [];

        if (this.liesOnBorder(start) && this.liesOnBorder(end)) {
            points.push(start);

            if (comparator.compareWithTolerance(start.x, this.xMin) === 0) {
                if (
                    comparator.compareWithTolerance(end.x, this.xMin) === 0 &&
                    comparator.compareWithTolerance(start.y, end.y) === 1
                ) {
                    points.push(end);
                } else {
                    points.push(this.corners[0]);
                    if (comparator.compareWithTolerance(end.y, this.yMin) === 0) {
                        points.push(end);
                    } else {
                        points.push(this.corners[1]);
                        if (comparator.compareWithTolerance(end.x, this.xMax) === 0) {
                            points.push(end);
                        } else {
                            points.push(this.corners[2]);
                            if (comparator.compareWithTolerance(end.y, this.yMax) === 0) {
                                points.push(end);
                            } else {
                                points.push(this.corners[3]);
                                points.push(end);
                            }
                        }
                    }
                }
            } else if (comparator.compareWithTolerance(start.y, this.yMin) === 0) {
                if (
                    comparator.compareWithTolerance(end.y, this.yMin) === 0 &&
                    comparator.compareWithTolerance(end.x, start.x) === 1
                ) {
                    points.push(end);
                } else {
                    points.push(this.corners[1]);
                    if (comparator.compareWithTolerance(end.x, this.xMax) === 0) {
                        points.push(end);
                    } else {
                        points.push(this.corners[2]);
                        if (comparator.compareWithTolerance(end.y, this.yMax) === 0) {
                            points.push(end);
                        } else {
                            points.push(this.corners[3]);
                            if (comparator.compareWithTolerance(end.x, this.xMin) === 0) {
                                points.push(end);
                            } else {
                                points.push(this.corners[0]);
                                points.push(end);
                            }
                        }
                    }
                }
            } else if (comparator.compareWithTolerance(start.x, this.xMax) === 0) {
                if (
                    comparator.compareWithTolerance(end.x, this.xMax) === 0 &&
                    comparator.compareWithTolerance(end.y, start.y) === 1
                ) {
                    points.push(end);
                } else {
                    points.push(this.corners[2]);
                    if (comparator.compareWithTolerance(end.y, this.yMax) === 0) {
                        points.push(end);
                    } else {
                        points.push(this.corners[3]);
                        if (comparator.compareWithTolerance(end.x, this.xMin) === 0) {
                            points.push(end);
                        } else {
                            points.push(this.corners[0]);
                            if (comparator.compareWithTolerance(end.y, this.yMin) === 0) {
                                points.push(end);
                            } else {
                                points.push(this.corners[1]);
                                points.push(end);
                            }
                        }
                    }
                }
            } else if (comparator.compareWithTolerance(start.y, this.yMax) === 0) {
                if (
                    comparator.compareWithTolerance(end.y, this.yMax) === 0 &&
                    comparator.compareWithTolerance(start.x, end.x) === 1
                ) {
                    points.push(end);
                } else {
                    points.push(this.corners[3]);
                    if (comparator.compareWithTolerance(end.x, this.xMin) === 0) {
                        points.push(end);
                    } else {
                        points.push(this.corners[0]);
                        if (comparator.compareWithTolerance(end.y, this.yMin) === 0) {
                            points.push(end);
                        } else {
                            points.push(this.corners[1]);
                            if (comparator.compareWithTolerance(end.x, this.xMax) === 0) {
                                points.push(end);
                            } else {
                                points.push(this.corners[2]);
                                points.push(end);
                            }
                        }
                    }
                }
            }
        }

        return arrayFunctions.makeElementsUnique(points);
    }
}