import { Vector } from './vector';
import { LineSegment } from './linesegment';
import { Rectangle } from './rectangle';
import comparator from '../util/comparator';

describe('Line segment', () => {
    it('checks another line segment for equality', () => {
        const nullVect = new Vector(0, 0);
        const xAxis = new Vector(1, 0);
        const yAxis = new Vector(0, 1);

        const ls1 = new LineSegment(nullVect, xAxis);
        const ls2 = new LineSegment(xAxis, nullVect);
        const ls3 = new LineSegment(yAxis, yAxis.add(xAxis));

        expect(ls1.equals(ls1)).toBe(true);
        expect(ls1.equals(ls2)).toBe(false);
        expect(ls1.equals(ls3)).toBe(false);
    });

    it('defines an order', () => {
        const nullVect = new Vector(0, 0);
        const xAxis = new Vector(1, 0);
        const yAxis = new Vector(0, 1);

        const ls1 = new LineSegment(nullVect, xAxis);
        const ls2 = new LineSegment(xAxis, yAxis);
        const ls3 = new LineSegment(yAxis, xAxis);

        expect(ls1.compareTo(ls1)).toBe(0);
        expect(ls1.compareTo(ls2)).toBe(-1);
        expect(ls2.compareTo(ls1)).toBe(1);
        expect(ls2.compareTo(ls3)).toBe(1);
        expect(ls3.compareTo(ls2)).toBe(-1);
    });

    it('gives its center', () => {
        const start = new Vector(0, 0);
        const end = new Vector(1, 0);
        const center = new Vector(0.5, 0);

        const ls = new LineSegment(start, end);
        expect(ls.getCenter().equals(center)).toBe(true);
    });

    it('gives its length', () => {
        const start = new Vector(0, 0);
        const end = new Vector(1, 0);

        const ls = new LineSegment(start, end);
        expect(comparator.compareWithTolerance(ls.getLength(), 1)).toBe(0);
    });

    it('projects a point on itself', () => {
        const start = new Vector(0, 0);
        const end = new Vector(1, 0);
        const line = new LineSegment(start, end);

        let point = new Vector(0.5, 1);
        let expected = new Vector(0.5, 0);
        let projection = line.pointProjection(point);
        expect(expected.equals(projection!)).toBe(true);

        point = new Vector(0.5, 0);
        expected = new Vector(0.5, 0);
        projection = line.pointProjection(point);
        expect(expected.equals(projection!)).toBe(true);

        point = new Vector(-1, 1);
        projection = line.pointProjection(point);
        expect(projection).toBe(null);

        point = new Vector(1.5, 1);
        projection = line.pointProjection(point);
        expect(projection).toBe(null);
    });

    it('checks if it contains a point', () => {
        let start = new Vector(0, 0);
        let end = new Vector(0, 0);
        let ls = new LineSegment(start, end);

        let out = new Vector(0.1, 0.1);
        expect(ls.containsPoint(start)).toBe(true);
        expect(ls.containsPoint(out)).toBe(false);

        end = new Vector(1, 1);
        ls = new LineSegment(start, end);
        out = new Vector(2, 2);
        expect(ls.containsPoint(start)).toBe(true);
        expect(ls.containsPoint(end)).toBe(true);
        expect(ls.containsPoint(out)).toBe(false);

        end = new Vector(0, 1);
        ls = new LineSegment(start, end);
        out = new Vector(0, 2);
        expect(ls.containsPoint(start)).toBe(true);
        expect(ls.containsPoint(end)).toBe(true);
        expect(ls.containsPoint(out)).toBe(false);

        end = new Vector(1, 0);
        ls = new LineSegment(start, end);
        out = new Vector(2, 0);
        expect(ls.containsPoint(start)).toBe(true);
        expect(ls.containsPoint(end)).toBe(true);
        expect(ls.containsPoint(out)).toBe(false);
    });

    it('calculates intersection with another line segment', () => {
        const nullVect = new Vector(0, 0);
        const xAxis = new Vector(1, 0);
        const yAxis = new Vector(0, 1);
        const middleIntOrigin = new Vector(0.5, 0.5);
        const noIntOrigin = new Vector(1.5, 1.5);
        const int1 = new Vector(0.5, 0);
        const int2 = new Vector(0, 0.5);

        const ls1 = new LineSegment(nullVect, xAxis);

        let int = ls1.getIntersection(new LineSegment(yAxis, yAxis.add(xAxis)));
        expect(int).toBe(null);

        int = ls1.getIntersection(new LineSegment(yAxis, yAxis));
        expect(int).toBe(null);

        int = ls1.getIntersection(new LineSegment(middleIntOrigin, middleIntOrigin.add(yAxis.multiplyScalar(-1))));
        expect(int!.equals(int1)).toBe(true);

        int = ls1.getIntersection(new LineSegment(middleIntOrigin, middleIntOrigin.add(yAxis)));
        expect(int).toBe(null);

        int = ls1.getIntersection(new LineSegment(noIntOrigin, noIntOrigin.add(yAxis.multiplyScalar(-1))));
        expect(int).toBe(null);

        const ls2 = new LineSegment(nullVect, yAxis);

        int = ls2.getIntersection(new LineSegment(middleIntOrigin, middleIntOrigin.add(xAxis.multiplyScalar(-1))));
        expect(int!.equals(int2)).toBe(true);

        int = ls2.getIntersection(new LineSegment(middleIntOrigin, middleIntOrigin.add(xAxis)));
        expect(int).toBe(null);

        int = ls2.getIntersection(new LineSegment(noIntOrigin, noIntOrigin.add(xAxis.multiplyScalar(-1))));
        expect(int).toBe(null);
    });

    it('creates a new line segment with sorted endpoints', () => {
        const nullVect = new Vector(0, 0);
        const xAxis = new Vector(1, 0);

        const ls1 = new LineSegment(nullVect, xAxis);
        const ls2 = new LineSegment(xAxis, nullVect);

        expect(ls1.equals(ls2)).toBe(false);
        expect(ls1.sortedEndpoints().equals(ls2.sortedEndpoints())).toBe(true);
    });

    it('creates a line segment which fits in a rectangle', () => {
        const rect = new Rectangle(0, 0, 1, 1);
        const lineSegment = new LineSegment(new Vector(-1, 0.5), new Vector(2, 0.5));
        const cropExpect = new LineSegment(new Vector(0, 0.5), new Vector(1, 0.5));
        const cropped = lineSegment.crop(rect);
        expect(cropped!.sortedEndpoints().equals(cropExpect.sortedEndpoints())).toBe(true);
    });
});