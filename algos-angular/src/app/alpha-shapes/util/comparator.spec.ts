import comparator from './comparator';
import constant from './constant';

describe('comparator functions', () => {
    it('gives the sign of a numeric value', () => {
        expect(comparator.sign(0)).toBe(0);
        expect(comparator.sign(-10)).toBe(-1);
        expect(comparator.sign(10)).toBe(1);
    });

    it('compares two numeric values given a certain tolerance', () => {
        expect(comparator.compareWithTolerance(1.0, 1.01, 0.001)).toBe(-1);
        expect(comparator.compareWithTolerance(1.01, 1.0, 0.001)).toBe(1);

        expect(comparator.compareWithTolerance(1.0, 1.01, 0.1)).toBe(0);
        expect(comparator.compareWithTolerance(1.01, 1.0, 0.1)).toBe(0);

        expect(comparator.compareWithTolerance(1.0, 1.0 + constant.TOLERANCE * 2)).toBe(-1);
        expect(comparator.compareWithTolerance(1.0 + constant.TOLERANCE * 2, 1.0)).toBe(1);

        expect(comparator.compareWithTolerance(1.0, 1.0 + constant.TOLERANCE / 2)).toBe(0);
        expect(comparator.compareWithTolerance(1.0 + constant.TOLERANCE / 2, 1.0)).toBe(0);
    });

    it('compares two numeric values', () => {
        expect(comparator.compare(1, 1)).toBe(0);
        expect(comparator.compare(1, 2)).toBe(-1);
        expect(comparator.compare(2, 1)).toBe(1);
    });
});