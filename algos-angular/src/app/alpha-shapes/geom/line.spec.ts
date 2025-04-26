import { Vector } from './vector';
import { Line } from './line';

describe('Line', () => {
    it('projects a point on itself', () => {
        const origin = new Vector(0, 0);
        const direction = new Vector(1, 0);
        const line = new Line(origin, direction);

        let point = new Vector(0.5, 1);
        let expected = new Vector(0.5, 0);
        let projection = line.pointProjection(point);
        expect(expected.equals(projection!)).toBe(true);

        point = new Vector(0.5, 0);
        expected = new Vector(0.5, 0);
        projection = line.pointProjection(point);
        expect(expected.equals(projection!)).toBe(true);

        point = new Vector(-1, 1);
        expected = new Vector(-1, 0);
        projection = line.pointProjection(point);
        expect(expected.equals(projection!)).toBe(true);

        point = new Vector(1.5, 1);
        expected = new Vector(1.5, 0);
        projection = line.pointProjection(point);
        expect(expected.equals(projection!)).toBe(true);
    });

    it('calculates lambda to reach a point', () => {
        let origin = new Vector(0, 0);
        let direction = new Vector(0, 0);
        let line = new Line(origin, direction);
        let start = new Vector(0, 0);
        let out = new Vector(0.1, 0.1);
        expect(line.calculateLambda(start)).toBe(0);
        expect(line.calculateLambda(out)).toBe(null);

        // General
        direction = new Vector(1, 1);
        line = new Line(origin, direction);
        let contained = new Vector(3, 3);
        out = new Vector(2, 3);
        expect(line.calculateLambda(start)).toBe(0);
        expect(line.calculateLambda(contained)).toBe(3);
        expect(line.calculateLambda(out)).toBe(null);

        // Parallel to y-Axis
        direction = new Vector(0, 1);
        line = new Line(origin, direction);
        contained = new Vector(0, 2);
        out = new Vector(1, 2);
        expect(line.calculateLambda(contained)).toBe(2);
        expect(line.calculateLambda(out)).toBe(null);

        // Parallel to x-Axis
        direction = new Vector(1, 0);
        line = new Line(origin, direction);
        contained = new Vector(2, 0);
        out = new Vector(2, 1);
        expect(line.calculateLambda(contained)).toBe(2);
        expect(line.calculateLambda(out)).toBe(null);
    });

    it('checks if it contains a point', () => {
        let origin = new Vector(0, 0);
        let direction = new Vector(0, 0);
        let line = new Line(origin, direction);
        let start = new Vector(0, 0);
        let out = new Vector(0.1, 0.1);
        expect(line.containsPoint(start)).toBe(true);
        expect(line.containsPoint(out)).toBe(false);

        // General
        direction = new Vector(1, 1);
        line = new Line(origin, direction);
        let contained = new Vector(3, 3);
        out = new Vector(2, 3);
        expect(line.containsPoint(start)).toBe(true);
        expect(line.containsPoint(contained)).toBe(true);
        expect(line.containsPoint(out)).toBe(false);

        // Parallel to y-Axis
        direction = new Vector(0, 1);
        line = new Line(origin, direction);
        contained = new Vector(0, 2);
        out = new Vector(1, 2);
        expect(line.containsPoint(contained)).toBe(true);
        expect(line.containsPoint(out)).toBe(false);

        // Parallel to x-Axis
        direction = new Vector(1, 0);
        line = new Line(origin, direction);
        contained = new Vector(2, 0);
        out = new Vector(2, 1);
        expect(line.containsPoint(contained)).toBe(true);
        expect(line.containsPoint(out)).toBe(false);
    });

    it('calculates intersection with another line', () => {
        const nullVect = new Vector(0, 0);
        const xAxis = new Vector(1, 0);
        const yAxis = new Vector(0, 1);
        const intOrigin = new Vector(0.5, 0.5);
        const int1 = new Vector(0.5, 0);
        const int2 = new Vector(0, 0.5);

        let line = new Line(nullVect, xAxis);

        // Parallels
        let inter = line.getIntersection(new Line(yAxis, xAxis));
        expect(inter).toBe(null);

        inter = line.getIntersection(new Line(yAxis, nullVect));
        expect(inter).toBe(null);

        // Points
        inter = line.getIntersection(new Line(nullVect, nullVect));
        expect(inter!.equals(nullVect)).toBe(true);
        inter = line.getIntersection(new Line(xAxis, nullVect));
        expect(inter).toBe(null);

        line = new Line(nullVect, nullVect);
        inter = line.getIntersection(new Line(nullVect, xAxis));
        expect(inter!.equals(nullVect)).toBe(true);
        inter = line.getIntersection(new Line(yAxis, xAxis));
        expect(inter).toBe(null);

        // General
        line = new Line(nullVect, xAxis);
        inter = line.getIntersection(new Line(intOrigin, yAxis.multiplyScalar(-1)));
        expect(inter!.equals(int1)).toBe(true);

        inter = line.getIntersection(new Line(intOrigin, yAxis));
        expect(inter!.equals(int1)).toBe(true);
    });
});