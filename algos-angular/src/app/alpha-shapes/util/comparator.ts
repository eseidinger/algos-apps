import constant from './constant';

/**
 * Comparator functions.
 *
 * @namespace
 */
namespace alphashape.util.comparator {
    /**
     * Give the sign of a numeric value.
     *
     * @param value - The value to give the sign for
     * @returns -1 if negative, 0 if 0, 1 if positive
     */
    export function sign(value: number): number {
        if (value < 0) {
            return -1;
        } else if (value === 0) {
            return 0;
        } else {
            return 1;
        }
    }

    /**
     * Compare two numeric values. Values are considered equal if their difference
     * is less than a certain tolerance.
     *
     * @param x - First value for comparison
     * @param y - Second value for comparison
     * @param tolerance - Tolerable difference (optional)
     * @returns 0 if |diff| < tolerance, -1 if x < y, 1 if x > y
     */
    export function compareWithTolerance(x: number, y: number, tolerance: number = constant.TOLERANCE): number {
        const diff = x - y;
        if (Math.abs(diff) < tolerance) {
            return 0;
        } else {
            return sign(diff);
        }
    }

    /**
     * Standard comparator for numerical values.
     *
     * @param x - First value for comparison
     * @param y - Second value for comparison
     * @returns 0 if x == y, -1 if x < y, 1 if x > y
     */
    export function compare(x: number, y: number): number {
        if (x === y) {
            return 0;
        } else if (x < y) {
            return -1;
        } else {
            return 1;
        }
    }
}

export default alphashape.util.comparator;