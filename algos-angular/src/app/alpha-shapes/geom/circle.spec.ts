import { Circle } from './circle';
import { Vector } from './vector';
import { Rectangle } from './rectangle';
import { LineSegment } from './linesegment';
import { Arc } from './arc';
import arrayFunctions from '../util/array';

describe('Circle', () => {
    it('checks if two circles are equal', () => {
        const circle1 = new Circle(new Vector(0, 0), 1);
        const circle2 = new Circle(new Vector(1, 0), 1);
        const circle3 = new Circle(new Vector(0, 0), 2);

        expect(circle1.equals(circle1)).toBe(true);
        expect(circle1.equals(circle2)).toBe(false);
        expect(circle1.equals(circle3)).toBe(false);
    });

    it('compares two circles', () => {
        const circle1 = new Circle(new Vector(0, 0), 1);
        const circle2 = new Circle(new Vector(1, 0), 1);
        const circle3 = new Circle(new Vector(0, 0), 2);

        expect(circle1.compareTo(circle1)).toBe(0);
        expect(circle1.compareTo(circle2)).toBe(-1);
        expect(circle2.compareTo(circle1)).toBe(1);
        expect(circle1.compareTo(circle3)).toBe(-1);
        expect(circle3.compareTo(circle1)).toBe(1);
    });

    it('creates circles given 2 points and a radius', () => {
        const point1 = new Vector(0, 0);
        const point2 = new Vector(10, 0);
        const radius1 = 3;
        const radius2 = 5;
        const radius3 = 10;

        let circles = Circle.createWith2PointsAndRadius(point1, point2, radius1);
        let expCircles: Circle[] = [];
        expect(arrayFunctions.compare(circles, expCircles, false)).toBe(0);

        circles = Circle.createWith2PointsAndRadius(point1, point2, radius2);
        expCircles = [new Circle(new Vector(5, 0), radius2)];
        expect(arrayFunctions.compare(circles, expCircles, false)).toBe(0);

        const y3_1 = Math.sqrt(Math.pow(radius3, 2) - Math.pow((point1.x - point2.x) / 2, 2));
        const y3_2 = -1 * y3_1;
        const x3 = (point1.x + point2.x) / 2;
        const center3_1 = new Vector(x3, y3_1);
        const center3_2 = new Vector(x3, y3_2);
        circles = Circle.createWith2PointsAndRadius(point1, point2, radius3);
        expCircles = [new Circle(center3_1, radius3), new Circle(center3_2, radius3)];
        expect(arrayFunctions.compare(circles, expCircles, false)).toBe(0);
    });

    it('creates a circle given a point on it and its center', () => {
        const center = new Vector(0, 0);
        const point = new Vector(10, 0);

        const circle = Circle.createWithPointAndCenter(point, center);
        const expCircle = new Circle(center, 10);

        expect(circle.equals(expCircle)).toBe(true);
    });

    it('calculates the intersections of two circles', () => {
        const center1 = new Vector(0, 0);
        const center2 = new Vector(10, 0);
        const radius1 = 3;
        const radius2 = 5;
        const radius3 = 10;
        const circle1_1 = new Circle(center1, radius1);
        const circle1_2 = new Circle(center2, radius1);
        const circle2_1 = new Circle(center1, radius2);
        const circle2_2 = new Circle(center2, radius2);
        const circle3_1 = new Circle(center1, radius3);
        const circle3_2 = new Circle(center2, radius3);

        let ints = circle1_1.getIntersections(circle1_2);
        expect(ints.length).toBe(0);

        ints = circle2_1.getIntersections(circle2_2);
        expect(ints.length).toBe(1);
        let expected = [new Vector(5, 0)];
        expect(arrayFunctions.compare(ints, expected, false)).toBe(0);

        ints = circle3_1.getIntersections(circle3_2);
        expect(ints.length).toBe(2);
        const y3_1 = Math.sqrt(Math.pow(radius3, 2) - Math.pow((center1.x - center2.x) / 2, 2));
        const y3_2 = -1 * y3_1;
        const x3 = (center1.x + center2.x) / 2;
        expected = [new Vector(x3, y3_1), new Vector(x3, y3_2)];
        expect(arrayFunctions.compare(ints, expected, false)).toBe(0);
    });

    it('translates a circle\'s center', () => {
        const center = new Vector(0, 0);
        const trans = new Vector(1, 1);
        const circle = new Circle(center, 5);
        const translated = circle.translate(trans);
        const expected = new Circle(trans, 5);
        expect(translated.equals(expected)).toBe(true);
    });

    it('rotates a circle clockwise (screen coordinates) around the origin', () => {
        const center1 = new Vector(0, 0);
        const center2 = new Vector(1, 0);
        const expected1 = new Circle(new Vector(0, 0), 5);
        const expected2 = new Circle(new Vector(0, 1), 5);
        const circle1 = new Circle(new Vector(0, 0), 5);
        const circle2 = new Circle(new Vector(1, 0), 5);
        const rotated1 = circle1.rotateAroundOrigin(Math.PI / 2);
        const rotated2 = circle2.rotateAroundOrigin(Math.PI / 2);
        expect(expected1.equals(rotated1)).toBe(true);
        expect(expected2.equals(rotated2)).toBe(true);
    });

    it('checks if it contains a point', () => {
        const center = new Vector(0, 0);
        const circle = new Circle(center, 5);
        const point1 = new Vector(3, 0);
        const point2 = new Vector(5, 0);
        const point3 = new Vector(6, 0);

        expect(circle.containsPoint(point1)).toBe(true);
        expect(circle.containsPoint(point2)).toBe(true);
        expect(circle.containsPoint(point3)).toBe(false);
    });

    it('calculates the intersections with a rectangle', () => {
        const circle = new Circle(new Vector(0, 0), 1);
        const rect = new Rectangle(-Math.sqrt(0.5), -Math.sqrt(0.5), Math.sqrt(0.5), Math.sqrt(0.5));
        const ints = circle.getIntersectionsWithRectangle(rect);

        const expInts = [
            new Vector(-Math.sqrt(0.5), -Math.sqrt(0.5)),
            new Vector(-Math.sqrt(0.5), Math.sqrt(0.5)),
            new Vector(Math.sqrt(0.5), Math.sqrt(0.5)),
            new Vector(Math.sqrt(0.5), -Math.sqrt(0.5)),
            new Vector(-Math.sqrt(0.5), -Math.sqrt(0.5)),
            new Vector(-Math.sqrt(0.5), Math.sqrt(0.5)),
            new Vector(Math.sqrt(0.5), Math.sqrt(0.5)),
            new Vector(Math.sqrt(0.5), -Math.sqrt(0.5)),
        ];

        expect(arrayFunctions.compare(ints, expInts, false)).toBe(0);
    });

    it('determines whether it lies in a rectangle or not', () => {
        const circle = new Circle(new Vector(0, 0), 1);
        const rect1 = new Rectangle(-1, -1, 1, 1);
        const rect2 = new Rectangle(-0.99, -0.99, 0.99, 0.99);
        expect(circle.liesInRectangle(rect1)).toBe(true);
        expect(circle.liesInRectangle(rect2)).toBe(false);
    });

    it('determines whether it contains a rectangle or not', () => {
        const circle = new Circle(new Vector(0, 0), Math.sqrt(2));
        const rect1 = new Rectangle(-1, -1, 1, 1);
        const rect2 = new Rectangle(-0.99, -0.99, 0.99, 0.99);
        expect(circle.containsRectangle(rect2)).toBe(true);
        expect(circle.containsRectangle(rect1)).toBe(false);
    });

    it('crops a circle to fit a rectangle', () => {
        let circle = new Circle(new Vector(0, 0), 1);
        let rect = new Rectangle(0, 0, 2, 2);
        let path = circle.crop(rect);

        let expPath = [
            new Arc(new Vector(0, 0), new Vector(1, 0), new Vector(0, 1), true),
            new LineSegment(new Vector(0, 1), new Vector(0, 0)),
            new LineSegment(new Vector(0, 0), new Vector(1, 0)),
        ];

        expect(arrayFunctions.equals(path!, expPath)).toBe(true);

        circle = Circle.createWithPointAndCenter(new Vector(1, 0), new Vector(0, 1));
        rect = new Rectangle(0, 0, 2, 2);
        path = circle.crop(rect);

        expPath = [
            new Arc(new Vector(0, 1), new Vector(1, 0), new Vector(1, 2), true),
            new LineSegment(new Vector(1, 2), new Vector(0, 2)),
            new LineSegment(new Vector(0, 2), new Vector(0, 0)),
            new LineSegment(new Vector(0, 0), new Vector(1, 0)),
        ];

        expect(arrayFunctions.equals(path!, expPath)).toBe(true);

        circle = new Circle(new Vector(0, 0), 5);
        rect = new Rectangle(-4, -4, 4, 4);
        path = circle.crop(rect);

        expPath = [
            new Arc(new Vector(0, 0), new Vector(-4, -3), new Vector(-3, -4), true),
            new LineSegment(new Vector(-3, -4), new Vector(3, -4)),
            new Arc(new Vector(0, 0), new Vector(3, -4), new Vector(4, -3), true),
            new LineSegment(new Vector(4, -3), new Vector(4, 3)),
            new Arc(new Vector(0, 0), new Vector(4, 3), new Vector(3, 4), true),
            new LineSegment(new Vector(3, 4), new Vector(-3, 4)),
            new Arc(new Vector(0, 0), new Vector(-3, 4), new Vector(-4, 3), true),
            new LineSegment(new Vector(-4, 3), new Vector(-4, -3)),
        ];

        expect(arrayFunctions.equals(path!, expPath)).toBe(true);

        circle = new Circle(new Vector(3, 3), 1);
        rect = new Rectangle(-1, -1, 1, 1);
        path = circle.crop(rect);
        expect(path).toBe(null);
    });
});