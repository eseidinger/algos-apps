'use strict';

import constant from './constant';

/**
 * Array utility functions.
 *
 * @namespace
 */
namespace alphashape.util.array {
    /**
     * Count the number of occurrences of an element in an array.
     *
     * @param array - Array to scan for element occurrences
     * @param element - Element occurrences to count in the array
     * @param equalityFunction - Function used to determine equality (optional)
     * @returns Number of occurrences of the element in the array
     */
    export function count<T>(array: T[], element: T, equalityFunction?: (a: T, b: T) => boolean): number {
        if (!equalityFunction) {
            if (!(element as any).equals) {
                return array.reduce((count, el) => (element === el ? count + 1 : count), 0);
            } else {
                return array.reduce((count, el) => ((element as any).equals(el) ? count + 1 : count), 0);
            }
        } else {
            return array.reduce((count, el) => (equalityFunction(element, el) ? count + 1 : count), 0);
        }
    }

    /**
     * Determine the index of an element in an array.
     *
     * @param array - Array to scan for element occurrences
     * @param element - Element to find index of in the array
     * @param equalityFunction - Function used to determine equality (optional)
     * @returns Index of the element in the array, or -1 if not found
     */
    export function indexOf<T>(array: T[], element: T, equalityFunction?: (a: T, b: T) => boolean): number {
        if (!equalityFunction) {
            if (!(element as any).equals) {
                return array.indexOf(element);
            } else {
                for (let i = 0; i < array.length; i++) {
                    if ((element as any).equals(array[i])) {
                        return i;
                    }
                }
            }
        } else {
            for (let i = 0; i < array.length; i++) {
                if (equalityFunction(element, array[i])) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Check if all elements of two arrays are equal.
     *
     * @param array1 - First array to compare
     * @param array2 - Second array to compare
     * @param equalityFunction - Function used to determine equality (optional)
     * @returns True if arrays are equal, false otherwise
     */
    export function equals<T>(
        array1: T[],
        array2: T[],
        equalityFunction?: (a: T, b: T) => boolean
    ): boolean {
        if (array1.length !== array2.length) {
            return false;
        }
        if (array1.length === 0) {
            return true;
        }
        if (!equalityFunction) {
            for (let i = 0; i < array1.length; i++) {
                if (!(array1[i] as any).equals) {
                    if (array1[i] !== array2[i]) {
                        return false;
                    }
                } else {
                    if (!(array1[i] as any).equals(array2[i])) {
                        return false;
                    }
                }
            }
        } else {
            for (let i = 0; i < array1.length; i++) {
                if (!equalityFunction(array1[i], array2[i])) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Sorts an array without side effects.
     *
     * @param array - Array to sort
     * @param compareFunction - Function to use for comparison (optional)
     * @returns Sorted array
     */
    export function sort<T>(array: T[], compareFunction?: (a: T, b: T) => number): T[] {
        const sortArray = [...array];
        if (!compareFunction) {
            sortArray.sort((el1, el2) => (el1 as any).compareTo(el2));
        } else {
            sortArray.sort(compareFunction);
        }
        return sortArray;
    }

    /**
     * Compare two arrays.
     *
     * @param array1 - First array to compare
     * @param array2 - Second array to compare
     * @param respectOrder - True to leave order, false to sort
     * @param compareFunction - Function to use for comparison (optional)
     * @returns 1 if array1 is bigger, -1 if array2 is bigger, 0 if equal
     */
    export function compare<T>(
        array1: T[],
        array2: T[],
        respectOrder: boolean,
        compareFunction?: (a: T, b: T) => number
    ): number {
        if (array1.length < array2.length) {
            return -1;
        } else if (array1.length > array2.length) {
            return 1;
        } else if (array1.length === 0) {
            return 0;
        } else {
            let compArray1: T[];
            let compArray2: T[];
            if (!compareFunction) {
                if (respectOrder) {
                    compArray1 = array1;
                    compArray2 = array2;
                } else {
                    compArray1 = sort(array1);
                    compArray2 = sort(array2);
                }
                for (let i = 0; i < array1.length; i++) {
                    const comp = (compArray1[i] as any).compareTo(compArray2[i]);
                    if (comp !== 0) {
                        return comp;
                    }
                }
                return 0;
            } else {
                if (respectOrder) {
                    compArray1 = array1;
                    compArray2 = array2;
                } else {
                    compArray1 = sort(array1, compareFunction);
                    compArray2 = sort(array2, compareFunction);
                }
                for (let i = 0; i < array1.length; i++) {
                    const comp = compareFunction(compArray1[i], compArray2[i]);
                    if (comp !== 0) {
                        return comp;
                    }
                }
                return 0;
            }
        }
    }

    /**
     * Find the index of an element in an array having a minimal distance smaller than a given maximum to a given
     * element according to a given distance function.
     *
     * @param array - The array to scan for the element
     * @param element - The element to compare array elements with
     * @param distFct - The distance function
     * @param maxDist - The maximum distance of elements to consider (optional)
     * @returns The index of the first element with minimum distance smaller than the maximum, or -1 if no such element exists
     */
    export function indexOfElementWithMinimalDistance<T>(
        array: T[],
        element: T,
        distFct: (a: T, b: T) => number,
        maxDist: number = constant.INFINITY
    ): number {
        let index = -1;
        let minDist: number | null = null;

        for (let i = 0; i < array.length; i++) {
            const dist = Math.abs(distFct(element, array[i]));
            if (dist < maxDist) {
                if (minDist === null || dist < minDist) {
                    minDist = dist;
                    index = i;
                }
            }
        }

        return index;
    }

    /**
     * Creates an array with unique values from a given array.
     *
     * @param array - Array with elements to make unique
     * @param equalityFunction - Function for array elements (optional)
     * @returns Array with unique elements
     */
    export function makeElementsUnique<T>(array: T[], equalityFunction?: (a: T, b: T) => boolean): T[] {
        const newArray: T[] = [];
        for (const curElement of array) {
            const index = indexOf(newArray, curElement, equalityFunction);
            if (index === -1) {
                newArray.push(curElement);
            }
        }
        return newArray;
    }

    /**
     * Creates an array where duplicates are removed.
     *
     * @param array - Array to remove duplicates from
     * @param equalityFunction - Function for array elements (optional)
     * @returns Array with unique elements
     */
    export function removeDuplicates<T>(array: T[], equalityFunction?: (a: T, b: T) => boolean): T[] {
        const newArray: T[] = [];
        array.forEach((el) => {
            if (count(array, el, equalityFunction) === 1) {
                newArray.push(el);
            }
        });
        return newArray;
    }
}

export default alphashape.util.array;