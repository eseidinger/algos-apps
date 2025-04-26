import { Vector } from './vector';
import { Rectangle } from './rectangle';
import { LineSegment } from './linesegment';
import { Polygon } from './polygon';
import constant from '../util/constant';
import comparator from '../util/comparator';

/**
 * A half plane. The normal to the border, pointing inside the plane, is oriented 90 degrees clockwise
 * (screen coordinates) to the border.
 */
export class HalfPlane {
    public readonly origin: Vector;
    public readonly border: Vector;

    /**
     * Constructor for the HalfPlane class.
     *
     * @param origin - A point on the border of the half plane
     * @param border - The direction of the border
     */
    constructor(origin: Vector, border: Vector) {
        this.origin = origin;
        this.border = border;
    }

    /**
     * Checks whether this half plane contains a rectangle.
     *
     * @param rect - The rectangle to check
     * @returns True if the half plane contains the rectangle, false otherwise
     */
    public containsRectangle(rect: Rectangle): boolean {
        const normal = this.border.rotate(Math.PI / 2);
        const origin = this.origin;

        return rect.corners.reduce((acc, point) => {
            return (
                acc &&
                comparator.compareWithTolerance(point.sub(origin).multiplyVector(normal), 0) !== -1
            );
        }, true);
    }

    /**
     * Crops a half plane to fit a rectangle. Returns the path in clockwise (screen coordinates) direction.
     *
     * @param rect - The rectangle to crop to
     * @returns A polygon representing the cropped half plane, or null if no valid polygon exists
     */
    public crop(rect: Rectangle): Polygon | null {
        const lineSegment = new LineSegment(
            this.origin.add(this.border.multiplyScalar(constant.INFINITY)),
            this.origin.sub(this.border.multiplyScalar(constant.INFINITY))
        );

        const intersections = rect.getIntersections(lineSegment);
        let path: Vector[] = [];

        if (intersections.length === 2) {
            const intsOrientation = intersections[1].sub(intersections[0]).normalize();
            const halfPlaneOrientation = this.border.normalize();

            if (intsOrientation.equals(halfPlaneOrientation)) {
                path = rect.getPathOnBorder(intersections[1], intersections[0]);
            } else {
                path = rect.getPathOnBorder(intersections[0], intersections[1]);
            }
        }

        if (path.length > 2) {
            return new Polygon(path, true);
        } else {
            return null;
        }
    }
}