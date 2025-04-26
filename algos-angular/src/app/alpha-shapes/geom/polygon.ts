import { Vector } from './vector';
import { PathElement } from './pathelement';

/**
 * A polygon.
 */
export class Polygon extends PathElement {
    public readonly start: Vector;
    public readonly points: Vector[];
    public readonly closed: boolean;

    /**
     * Constructor for the Polygon class.
     *
     * @param points - An array of points defining the polygon
     * @param closed - Whether the polygon is closed
     */
    constructor(points: Vector[], closed: boolean) {
        super();
        this.start = points[0];
        this.points = points.slice(1);
        this.closed = closed;
    }
}