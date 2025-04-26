import { HalfPlane } from './halfplane';
import { Rectangle } from './rectangle';
import { Vector } from './vector';
import arrayFunctions from '../util/array';

describe('Half plane', () => {
    it('checks whether it contains a rectangle', () => {
        const halfPlane = new HalfPlane(new Vector(0, 0), new Vector(1, 0));

        let rect = new Rectangle(0, 0, 1, 1);
        expect(halfPlane.containsRectangle(rect)).toBe(true);

        rect = new Rectangle(0, 0, -1, -1);
        expect(halfPlane.containsRectangle(rect)).toBe(false);
    });

    it('crops a half plane to fit a rectangle', () => {
        let halfPlane = new HalfPlane(new Vector(0, 0), new Vector(1, 0));
        const rect = new Rectangle(-1, -1, 1, 1);

        let polygon = halfPlane.crop(rect);
        let path = [polygon!.start, ...polygon!.points];
        let expPath = [
            new Vector(1, 0),
            new Vector(1, 1),
            new Vector(-1, 1),
            new Vector(-1, 0),
        ];

        expect(arrayFunctions.compare(path, expPath, true)).toBe(0);

        halfPlane = new HalfPlane(new Vector(0, 0), new Vector(-1, 0));
        polygon = halfPlane.crop(rect);
        path = [polygon!.start, ...polygon!.points];

        expPath = [
            new Vector(-1, 0),
            new Vector(-1, -1),
            new Vector(1, -1),
            new Vector(1, 0),
        ];

        expect(arrayFunctions.compare(path, expPath, true)).toBe(0);

        halfPlane = new HalfPlane(new Vector(0, 1), new Vector(-1, 0));
        polygon = halfPlane.crop(rect);
        path = [polygon!.start, ...polygon!.points];

        expPath = [
            new Vector(-1, 1),
            new Vector(-1, -1),
            new Vector(1, -1),
            new Vector(1, 1),
        ];

        expect(arrayFunctions.compare(path, expPath, true)).toBe(0);

        halfPlane = new HalfPlane(new Vector(0, 1), new Vector(1, 0));
        polygon = halfPlane.crop(rect);

        expect(polygon).toBe(null);
    });
});