import { Vector } from './vector';
import comparator from '../util/comparator';

describe('Vector', () => {
    it('checks vectors for equality', () => {
        const vector1 = new Vector(2, 0);
        const vector2 = new Vector(2, 0);
        const vector3 = new Vector(2, 1);

        expect(vector1.equals(vector2)).toBe(true);
        expect(vector1.equals(vector3)).toBe(false);
    });

    it('defines an order', () => {
        const vector1 = new Vector(2, 0);
        const vector2 = new Vector(2, 1);
        const vector3 = new Vector(2, 1);
        const vector4 = new Vector(1, 1);

        expect(Vector.compare(vector1, vector2)).toBe(-1);
        expect(Vector.compare(vector2, vector1)).toBe(1);
        expect(Vector.compare(vector2, vector3)).toBe(0);
        expect(Vector.compare(vector3, vector4)).toBe(1);
        expect(Vector.compare(vector4, vector3)).toBe(-1);

        expect(vector1.compareTo(vector2)).toBe(-1);
        expect(vector2.compareTo(vector1)).toBe(1);
        expect(vector2.compareTo(vector3)).toBe(0);
        expect(vector4.compareTo(vector3)).toBe(-1);
    });

    it('rotates a vector clockwise (screen coordinates)', () => {
        const vector0 = new Vector(1, 0);
        const vector90 = new Vector(0, 1);
        const vector180 = new Vector(-1, 0);
        const vector270 = new Vector(0, -1);
        const vector360 = new Vector(1, 0);

        expect(vector0.rotate(Math.PI / 2).equals(vector90)).toBe(true);
        expect(vector0.rotate(Math.PI).equals(vector180)).toBe(true);
        expect(vector0.rotate(3 * Math.PI / 2).equals(vector270)).toBe(true);
        expect(vector0.rotate(2 * Math.PI).equals(vector360)).toBe(true);
    });

    it('multiplies vector with scalar', () => {
        const vector = new Vector(-2, 1);
        const newVector = new Vector(4, -2);

        expect(vector.multiplyScalar(-2).equals(newVector)).toBe(true);
    });

    it('calculates the dot product', () => {
        const vector1 = new Vector(-2, 1);
        const vector2 = new Vector(3, -2);
        const result = vector1.multiplyVector(vector2);

        expect(comparator.compareWithTolerance(result, -8)).toBe(0);
    });

    it('subtracts vectors', () => {
        const vector1 = new Vector(5, 7);
        const vector2 = new Vector(1, 2);
        const expected = new Vector(4, 5);
        const result = vector1.sub(vector2);

        expect(expected.equals(result)).toBe(true);
    });

    it('adds vectors', () => {
        const vector1 = new Vector(5, 7);
        const vector2 = new Vector(1, 2);
        const expected = new Vector(6, 9);
        const result = vector1.add(vector2);

        expect(expected.equals(result)).toBe(true);
    });

    it('calculates the absolute value', () => {
        const vector = new Vector(2, -2);
        const expected = Math.sqrt(8);
        const result = vector.abs();

        expect(comparator.compareWithTolerance(expected, result)).toBe(0);
    });

    it('calculates the square of the absolute value', () => {
        const vector = new Vector(2, -2);
        const expected = 8;
        const result = vector.abssquare();

        expect(comparator.compareWithTolerance(expected, result)).toBe(0);
    });

    it('calculates the distance between two point vectors', () => {
        const vector1 = new Vector(0, 0);
        const vector2 = new Vector(2, 2);

        expect(comparator.compareWithTolerance(vector1.dist(vector2), Math.sqrt(8))).toBe(0);
    });

    it('calculates the square of the distance between two point vectors', () => {
        const vector1 = new Vector(0, 0);
        const vector2 = new Vector(2, 2);

        expect(comparator.compareWithTolerance(vector1.distSquare(vector2), 8)).toBe(0);
    });

    it('normalizes a vector', () => {
        const vector = new Vector(2, 0);
        const expected = new Vector(1, 0);
        const result = vector.normalize();

        expect(expected.equals(result)).toBe(true);
    });

    it('calculates clockwise angle (screen coordinates) of vector to x axis', () => {
        const vectors = [
            new Vector(1, 0),
            new Vector(1, 1),
            new Vector(0, 1),
            new Vector(-1, 1),
            new Vector(-1, 0),
            new Vector(-1, -1),
            new Vector(0, -1),
            new Vector(1, -1),
        ];

        const angles = [
            0,
            Math.PI / 4,
            Math.PI / 2,
            (3 * Math.PI) / 4,
            Math.PI,
            (-3 * Math.PI) / 4,
            -Math.PI / 2,
            -Math.PI / 4,
        ];

        for (let i = 0; i < vectors.length; i++) {
            expect(comparator.compareWithTolerance(vectors[i].getAngle(), angles[i])).toBe(0);
        }
    });

    it('calculates the determinant', () => {
        let vector1 = new Vector(0, 0);
        let vector2 = new Vector(0, 1);
        let vector3 = new Vector(1, 0);

        let det = Vector.calcDet(vector1, vector2, vector3);
        expect(comparator.compareWithTolerance(det, -1)).toBe(0);

        vector3 = new Vector(-1, 0);
        det = Vector.calcDet(vector1, vector2, vector3);
        expect(comparator.compareWithTolerance(det, 1)).toBe(0);

        vector3 = new Vector(0, 2);
        det = Vector.calcDet(vector1, vector2, vector3);
        expect(comparator.compareWithTolerance(det, 0)).toBe(0);
    });
});