import { PathElement } from './pathelement';
import { Vector } from './vector';

/**
 * A Bezier curve.
 */
export class Bezier implements PathElement {
    public readonly start: Vector;
    public readonly end: Vector;
    public readonly controlPoints: Vector[];

    /**
     * Constructor for the Bezier curve.
     *
     * @param start - Start point of the curve
     * @param end - End point of the curve
     * @param controlPoints - Control points of the curve
     */
    constructor(start: Vector, end: Vector, controlPoints: Vector[]) {
        this.start = start;
        this.end = end;
        this.controlPoints = controlPoints;
    }
}