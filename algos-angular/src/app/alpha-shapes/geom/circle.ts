import { Vector } from './vector';
import { Rectangle } from './rectangle';
import { Arc } from './arc';
import { LineSegment } from './linesegment';
import constant from '../util/constant';
import comparator from '../util/comparator';
import arrayFunctions from '../util/array';
import { ConvexHull } from '../algo/convexhull';
import { PathElement } from './pathelement';

/**
 * A Circle.
 */
export class Circle implements PathElement {
    public readonly center: Vector;
    public readonly radius: number;
    public readonly start: Vector;

    /**
     * Constructor for the Circle class.
     *
     * @param center - The center of the circle
     * @param radius - The radius of the circle
     */
    constructor(center: Vector, radius: number) {
        this.center = center;
        this.radius = radius;
        this.start = new Vector(center.x + radius, center.y);
    }

    /**
     * Create possible circles given 2 points on it and a radius.
     *
     * @param point1 - First point on the circle
     * @param point2 - Second point on the circle
     * @param radius - Radius of the circle
     * @returns Array of possible circles (max 2, min 0)
     */
    public static createWith2PointsAndRadius(point1: Vector, point2: Vector, radius: number): Circle[] {
        const result: Circle[] = [];
        const circle1 = new Circle(point1, radius);
        const circle2 = new Circle(point2, radius);

        const intersections = circle1.getIntersections(circle2);
        intersections.forEach((intersection) => {
            const circle = new Circle(intersection, radius);
            result.push(circle);
        });

        return result;
    }

    /**
     * Create a circle given a point on it and its center.
     *
     * @param point - A point on the circle
     * @param center - The center of the circle
     * @returns A new Circle instance
     */
    public static createWithPointAndCenter(point: Vector, center: Vector): Circle {
        return new Circle(center, point.dist(center));
    }

    /**
     * Checks if this circle is equal to another circle.
     *
     * @param circle - The circle to compare with
     * @returns True if the circles are equal, false otherwise
     */
    public equals(circle: Circle): boolean {
        return (
            this.center.equals(circle.center) &&
            comparator.compareWithTolerance(this.radius, circle.radius) === 0
        );
    }

    /**
     * Defines an order on circles. Compares circles first by radius, then by center.
     *
     * @param other - The other circle to compare with
     * @returns 0 if circles are equal, 1 if other is less than this, -1 if this is less than other
     */
    public compareTo(other: Circle): number {
        const radiusComparison = comparator.compareWithTolerance(this.radius, other.radius);
        if (radiusComparison !== 0) {
            return radiusComparison;
        }
        return this.center.compareTo(other.center);
    }

    /**
     * Calculate the intersections of this circle and a given circle.
     *
     * @param circle - The circle to intersect with
     * @returns Array of intersection points (max 2, min 0)
     */
    public getIntersections(circle: Circle): Vector[] {
        const result: Vector[] = [];
        let circle1: Circle = this;
        let circle2: Circle = circle;

        if (this.center.x > circle.center.x) {
            circle1 = circle;
            circle2 = this;
        }

        const translation = circle1.center;
        circle1 = circle1.translate(translation.multiplyScalar(-1));
        circle2 = circle2.translate(translation.multiplyScalar(-1));
        const angle = circle2.center.getAngle();
        circle2 = circle2.rotateAroundOrigin(-angle);

        const R = circle1.radius;
        const r = circle2.radius;
        const d = circle1.center.sub(circle2.center).abs();
        const ySquared = (Math.pow(2 * d * R, 2) - Math.pow(d * d - r * r + R * R, 2)) / (4 * d * d);
        const x = (d * d - r * r + R * R) / (2 * d);

        if (comparator.compareWithTolerance(ySquared, 0) === -1) {
            return result;
        } else if (comparator.compareWithTolerance(ySquared, 0) === 0) {
            const onlyIntersection = new Vector(x, 0).rotate(angle).add(translation);
            result.push(onlyIntersection);
            return result;
        }

        const y1 = Math.sqrt(ySquared);
        const y2 = -y1;

        const intersection1 = new Vector(x, y1).rotate(angle).add(translation);
        const intersection2 = new Vector(x, y2).rotate(angle).add(translation);

        result.push(intersection1, intersection2);
        return result;
    }

    /**
     * Translate the circle's center by a given vector.
     *
     * @param vector - The translation vector
     * @returns A new translated Circle instance
     */
    public translate(vector: Vector): Circle {
        return new Circle(this.center.add(vector), this.radius);
    }

    /**
     * Rotate the circle clockwise around the origin.
     *
     * @param angle - The angle in radians
     * @returns A new rotated Circle instance
     */
    public rotateAroundOrigin(angle: number): Circle {
        return new Circle(this.center.rotate(angle), this.radius);
    }

    /**
     * Checks whether the circle contains a given point.
     *
     * @param point - The point to check
     * @returns True if the point is contained, false otherwise
     */
    public containsPoint(point: Vector): boolean {
        return comparator.compareWithTolerance(this.center.dist(point), this.radius) !== 1;
    }

    /**
     * Checks whether this circle lies entirely within a rectangle.
     *
     * @param rect - The rectangle to check
     * @returns True if the circle lies within the rectangle, false otherwise
     */
    public liesInRectangle(rect: Rectangle): boolean {
        if (rect.containsPoint(this.center)) {
            return (
                comparator.compareWithTolerance(
                    this.radius,
                    rect.getMinimumDistanceFromBorder(this.center)
                ) !== 1
            );
        }
        return false;
    }

    /**
     * Checks whether this circle contains a rectangle.
     *
     * @param rect - The rectangle to check
     * @returns True if the circle contains the rectangle, false otherwise
     */
    public containsRectangle(rect: Rectangle): boolean {
        if (rect.containsPoint(this.center)) {
            return (
                comparator.compareWithTolerance(
                    this.radius,
                    rect.getMaximumDistanceFromBorder(this.center)
                ) === 1
            );
        }
        return false;
    }

    /**
     * Crops the circle to fit within a rectangle.
     *
     * @param rect - The rectangle to crop to
     * @returns An array of path elements representing the cropped circle
     */
    public crop(rect: Rectangle): (Circle | Arc | LineSegment)[] | null {
        let path: (Circle | Arc | LineSegment)[] = [];
        let intersections = this.getIntersectionsWithRectangle(rect);
        intersections = arrayFunctions.makeElementsUnique(intersections);
        const intersectionsClockwise = ConvexHull.compute(intersections);

        if (intersectionsClockwise.length === 0) {
            if (this.liesInRectangle(rect)) {
                path.push(this);
            } else if (this.containsRectangle(rect)) {
                path = path.concat(rect.lineSegments);
            } else {
                return null;
            }
        } else if (intersectionsClockwise.length === 2) {
            const arc1 = new Arc(this.center, intersectionsClockwise[0], intersectionsClockwise[1], true);
            const arc2 = new Arc(this.center, intersectionsClockwise[1], intersectionsClockwise[0], true);

            if (arc1.liesInRectangle(rect)) {
                if (arc1.radius > constant.INFINITY / 2) {
                    path.push(new LineSegment(intersectionsClockwise[0], intersectionsClockwise[1]));
                } else {
                    path.push(arc1);
                }
                const rectPath = rect.getPathOnBorder(intersectionsClockwise[1], intersectionsClockwise[0]);
                for (let i = 0; i < rectPath.length - 1; i++) {
                    path.push(new LineSegment(rectPath[i], rectPath[i + 1]));
                }
            } else if (arc2.liesInRectangle(rect)) {
                if (arc2.radius > constant.INFINITY / 2) {
                    path.push(new LineSegment(intersectionsClockwise[1], intersectionsClockwise[0]));
                } else {
                    path.push(arc2);
                }
                const rectPath = rect.getPathOnBorder(intersectionsClockwise[0], intersectionsClockwise[1]);
                for (let i = 0; i < rectPath.length - 1; i++) {
                    path.push(new LineSegment(rectPath[i], rectPath[i + 1]));
                }
            }
        } else {
            for (let i = 0; i < intersectionsClockwise.length; i++) {
                const arc = new Arc(
                    this.center,
                    intersectionsClockwise[i],
                    intersectionsClockwise[(i + 1) % intersectionsClockwise.length],
                    true
                );
                if (arc.liesInRectangle(rect)) {
                    path.push(arc);
                } else {
                    const rectPath = rect.getPathOnBorder(
                        intersectionsClockwise[i],
                        intersectionsClockwise[(i + 1) % intersectionsClockwise.length]
                    );
                    for (let j = 0; j < rectPath.length - 1; j++) {
                        path.push(new LineSegment(rectPath[j], rectPath[j + 1]));
                    }
                }
            }
        }
        return path;
    }

    /**
     * Calculates the intersections of this circle with a rectangle.
     *
     * @param rect - The rectangle to intersect with
     * @returns An array of intersection points
     */
    public getIntersectionsWithRectangle(rect: Rectangle): Vector[] {
        const intersections: Vector[] = [];

        const calcInt = (
            r: number,
            coord: number,
            offsetCoord: number,
            offsetOther: number,
            min: number,
            max: number
        ): number[] => {
            const result: number[] = [];
            const sqrtArg = r * r - (coord - offsetCoord) * (coord - offsetCoord);
            if (sqrtArg > 0) {
                const sqrt = Math.sqrt(sqrtArg);
                const res1 = sqrt + offsetOther;
                const res2 = -sqrt + offsetOther;
                if (
                    comparator.compareWithTolerance(res1, max) !== 1 &&
                    comparator.compareWithTolerance(res1, min) !== -1
                ) {
                    result.push(res1);
                }
                if (
                    comparator.compareWithTolerance(res2, max) !== 1 &&
                    comparator.compareWithTolerance(res2, min) !== -1
                ) {
                    result.push(res2);
                }
            }
            return result;
        };

        let result = calcInt(this.radius, rect.xMin, this.center.x, this.center.y, rect.yMin, rect.yMax);
        result.forEach((y) => intersections.push(new Vector(rect.xMin, y)));

        result = calcInt(this.radius, rect.xMax, this.center.x, this.center.y, rect.yMin, rect.yMax);
        result.forEach((y) => intersections.push(new Vector(rect.xMax, y)));

        result = calcInt(this.radius, rect.yMin, this.center.y, this.center.x, rect.xMin, rect.xMax);
        result.forEach((x) => intersections.push(new Vector(x, rect.yMin)));

        result = calcInt(this.radius, rect.yMax, this.center.y, this.center.x, rect.xMin, rect.xMax);
        result.forEach((x) => intersections.push(new Vector(x, rect.yMax)));

        return intersections;
    }
}