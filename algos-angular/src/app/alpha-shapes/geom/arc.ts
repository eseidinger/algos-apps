import { Vector } from './vector';
import { Rectangle } from './rectangle';
import { PathElement } from './pathelement';

/**
 * A circular arc.
 */
export class Arc implements PathElement {
    public readonly center: Vector;
    public readonly start: Vector;
    public readonly end: Vector;
    public readonly startAngle: number;
    public readonly endAngle: number;
    public readonly clockwise: boolean;
    public readonly radius: number;

    /**
     * Constructor for the Arc class.
     *
     * @param center - The center of the arc
     * @param start - The starting point of the arc
     * @param end - The ending point of the arc
     * @param clockwise - Whether the arc is drawn clockwise
     */
    constructor(center: Vector, start: Vector, end: Vector, clockwise: boolean) {
        this.center = center;
        this.start = start;
        this.end = end;
        this.startAngle = Arc.calcAngle(center, start);
        this.endAngle = Arc.calcAngle(center, end);
        this.clockwise = clockwise;
        this.radius = this.center.sub(this.start).abs();
    }

    /**
     * Calculate the clockwise angle of a point on the arc to the leftmost point on the arc's circle.
     *
     * @param center - The center of the arc
     * @param point - A point on the arc
     * @returns The angle in radians
     */
    public static calcAngle(center: Vector, point: Vector): number {
        let angle = point.sub(center).getAngle();
        if (angle < 0) {
            angle = 2 * Math.PI + angle;
        }
        return angle;
    }

    /**
     * Determines the middle of the arc.
     *
     * @returns The middle point of the arc
     */
    public arcMiddle(): Vector {
        let angleDiff: number;
        if (this.clockwise) {
            angleDiff = this.endAngle - this.startAngle;
        } else {
            angleDiff = this.startAngle - this.endAngle;
        }
        if (angleDiff < 0) {
            angleDiff += 2 * Math.PI;
        }

        let vector: Vector;
        let middleVector: Vector;
        if (this.clockwise) {
            vector = this.start.sub(this.center);
            middleVector = vector.rotate(angleDiff / 2);
        } else {
            vector = this.end.sub(this.center);
            middleVector = vector.rotate(angleDiff / 2);
        }
        return middleVector.add(this.center);
    }

    /**
     * Determines whether this arc lies in a given rectangle.
     *
     * @param rect - The rectangle to check
     * @returns True if the arc lies within the rectangle, false otherwise
     */
    public liesInRectangle(rect: Rectangle): boolean {
        return (
            rect.containsPoint(this.start) &&
            rect.containsPoint(this.end) &&
            rect.containsPoint(this.arcMiddle())
        );
    }

    /**
     * Checks two arcs for equality.
     *
     * @param arc - The arc to compare with
     * @returns True if the arcs are equal, false otherwise
     */
    public equals(arc: Arc): boolean {
        if (this.center.equals(arc.center)) {
            if (this.start.equals(arc.start) && this.end.equals(arc.end)) {
                return this.clockwise === arc.clockwise;
            } else if (this.start.equals(arc.end) && this.end.equals(arc.start)) {
                return this.clockwise !== arc.clockwise;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}