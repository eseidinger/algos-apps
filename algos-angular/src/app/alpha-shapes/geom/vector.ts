import comparator from '../util/comparator';

/**
 * Represents a 2D vector.
 */
export class Vector {
    public readonly x: number;
    public readonly y: number;

    /**
     * Constructor for the Vector class.
     *
     * @param x - The x-coordinate
     * @param y - The y-coordinate
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Checks vector coordinates for equality.
     *
     * @param v - The vector to check for equality
     * @returns True if coordinates are equal, false otherwise
     */
    public equals(v: Vector): boolean {
        return Vector.compare(this, v) === 0;
    }

    /**
     * Defines an order on Vectors. Two vectors are considered equal if their coordinates are equal.
     * Vectors are first compared by their x, then by their y coordinate.
     *
     * @param other - The vector to compare with
     * @returns 0 if vectors are equal, -1 if this is less than the other, 1 if the other is less than this
     */
    public compareTo(other: Vector): number {
        return Vector.compare(this, other);
    }

    /**
     * Rotate clockwise in screen coordinates.
     *
     * @param angle - The angle in radians
     * @returns A rotated copy of this vector
     */
    public rotate(angle: number): Vector {
        const newX = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        const newY = this.y * Math.cos(angle) + this.x * Math.sin(angle);
        return new Vector(newX, newY);
    }

    /**
     * Scale vector.
     *
     * @param a - The scaling factor
     * @returns A scaled copy of this vector
     */
    public multiplyScalar(a: number): Vector {
        return new Vector(a * this.x, a * this.y);
    }

    /**
     * Dot product.
     *
     * @param v - The second factor for the dot product
     * @returns The dot product of this vector and v
     */
    public multiplyVector(v: Vector): number {
        return v.x * this.x + v.y * this.y;
    }

    /**
     * Vector subtraction.
     *
     * @param v - The subtrahend
     * @returns The difference of this vector and v
     */
    public sub(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    /**
     * Vector addition.
     *
     * @param v - The second summand
     * @returns The sum of this vector and v
     */
    public add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    /**
     * Absolute value.
     *
     * @returns The absolute value of this vector
     */
    public abs(): number {
        return Math.sqrt(this.multiplyVector(this));
    }

    /**
     * Square of absolute value.
     *
     * @returns The square of this vector's absolute value
     */
    public abssquare(): number {
        return this.multiplyVector(this);
    }

    /**
     * Calculate the distance between this and another point vector.
     *
     * @param v - The point vector
     * @returns The distance between the two points
     */
    public dist(v: Vector): number {
        return this.sub(v).abs();
    }

    /**
     * Calculate the square distance between this and another point vector.
     *
     * @param v - The point vector
     * @returns The square distance between the two points
     */
    public distSquare(v: Vector): number {
        return this.sub(v).abssquare();
    }

    /**
     * Vector normalization.
     *
     * @returns A normalized copy of this vector
     */
    public normalize(): Vector {
        return this.multiplyScalar(1 / this.abs());
    }

    /**
     * Calculate clockwise angle (screen coordinates) with the x-axis.
     *
     * @returns The clockwise angle with the x-axis
     */
    public getAngle(): number {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Defines an order on Vectors. Two vectors are considered equal if their coordinates are equal.
     * Vectors are first compared by their x, then by their y coordinate.
     *
     * @param vector1 - The first vector
     * @param vector2 - The second vector
     * @returns 0 if vectors are equal, -1 if vector1 is less than vector2, 1 if vector2 is less than vector1
     */
    public static compare(vector1: Vector, vector2: Vector): number {
        const comp = comparator.compareWithTolerance(vector1.x, vector2.x);
        if (comp === 0) {
            return comparator.compareWithTolerance(vector1.y, vector2.y);
        } else {
            return comp;
        }
    }

    /**
     * Calculate the determinant:
     * | 1 p.x p.y |
     * | 1 q.x q.y |
     * | 1 r.x r.y |
     *
     * @param p - The first vector
     * @param q - The second vector
     * @param r - The third vector
     * @returns The determinant
     */
    public static calcDet(p: Vector, q: Vector, r: Vector): number {
        return (
            q.x * r.y +
            p.x * q.y +
            p.y * r.x -
            q.y * r.x -
            p.x * r.y -
            p.y * q.x
        );
    }
}