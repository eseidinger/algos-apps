/**
 Copyright 2013-2014 Emanuel Seidinger

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import arrayFunctions from './array';
import comparator from './comparator';

class EqualityObject {
    val: number;
    constructor(val: number) {
        this.val = val;
    }
    equals(v: EqualityObject): boolean {
        return this.val === v.val;
    }
    compareTo(v: EqualityObject): number {
        return comparator.compare(this.val, v.val);
    }
}

describe('array and comparator functions', () => {
    it('counts number of occurrences of an element in an array', () => {
        const array1 = [1, 2, 2];
        const array2 = [new EqualityObject(1), new EqualityObject(2), new EqualityObject(2)];
        const array3 = [{ val: 1 }, { val: 2 }, { val: 2 }];

        for (let i = 0; i < 3; i++) {
            expect(arrayFunctions.count(array1, i)).toBe(i);
            expect(
                arrayFunctions.count(array2, new EqualityObject(i))
            ).toBe(i);
            expect(
                arrayFunctions.count(array3, { val: i }, (v1, v2) => v1.val === v2.val)
            ).toBe(i);
        }
    });

    it('determines the index of an element in an array', () => {
        const array1 = [0, 1, 2];
        const array2 = [new EqualityObject(0), new EqualityObject(1), new EqualityObject(2)];
        const array3 = [{ val: 0 }, { val: 1 }, { val: 2 }];

        for (let i = 0; i < 3; i++) {
            expect(arrayFunctions.indexOf(array1, i)).toBe(i);
            expect(
                arrayFunctions.indexOf(array2, new EqualityObject(i))
            ).toBe(i);
            expect(
                arrayFunctions.indexOf(array3, { val: i }, (v1, v2) => v1.val === v2.val)
            ).toBe(i);
        }
    });

    it('checks if elements in two arrays are equal', () => {
        const array1 = [0, 1, 2];
        const array2 = [0, 1, 2];
        const array3 = [0, 2, 1];
        const array4 = [new EqualityObject(0), new EqualityObject(1), new EqualityObject(2)];
        const array5 = [{ val: 0 }, { val: 1 }, { val: 2 }];
        const array6 = [{ val: 0 }, { val: 2 }, { val: 1 }];

        array4.forEach((el) => { el.equals = function (v: any) { return this.val === v.val; }; });

        expect(arrayFunctions.equals(array1, array2)).toBe(true);
        expect(arrayFunctions.equals(array1, array3)).toBe(false);
        expect(arrayFunctions.equals(array4, array5)).toBe(true);
        expect(arrayFunctions.equals(array4, array6)).toBe(false);
        expect(arrayFunctions.equals(array5, array4, (v1, v2) => v1.val === v2.val)).toBe(true);
        expect(arrayFunctions.equals(array5, array6, (v1, v2) => v1.val === v2.val)).toBe(false);
    });

    it('sorts an array', () => {
        const array1 = [0, 2, 1];
        const array2 = [new EqualityObject(0), new EqualityObject(2), new EqualityObject(1)];

        const sorted1 = arrayFunctions.sort(array1, comparator.compare);
        const sorted2 = arrayFunctions.sort(array2);
        const sorted3 = arrayFunctions.sort(array2, (v1, v2) => comparator.compare(v1.val, v2.val));
        const exp1 = [0, 1, 2];
        const exp2 = [{ val: 0 }, { val: 1 }, { val: 2 }];

        expect(arrayFunctions.equals(sorted1, exp1)).toBe(true);
        expect(arrayFunctions.equals(sorted2, exp2)).toBe(true);
        expect(arrayFunctions.equals(sorted3, exp2)).toBe(true);
    });

    it('compares two arrays', () => {
        const array1 = [0, 1, 2];
        const array2 = [0, 1, 2];
        const array3 = [0, 2, 1];
        const array4 = [0, 1, 2, 3];
        const array5 = [new EqualityObject(0), new EqualityObject(1), new EqualityObject(2)];
        const array6 = [new EqualityObject(0), new EqualityObject(1), new EqualityObject(2)];
        const array7 = [new EqualityObject(0), new EqualityObject(2), new EqualityObject(1)];
        const array8 = [new EqualityObject(0), new EqualityObject(1), new EqualityObject(2), new EqualityObject(3)];

        expect(arrayFunctions.compare(array1, array2, true, comparator.compare)).toBe(0);
        expect(arrayFunctions.compare(array1, array3, true, comparator.compare)).toBe(-1);
        expect(arrayFunctions.compare(array1, array3, false, comparator.compare)).toBe(0);
        expect(arrayFunctions.compare(array3, array1, true, comparator.compare)).toBe(1);
        expect(arrayFunctions.compare(array3, array1, false, comparator.compare)).toBe(0);
        expect(arrayFunctions.compare(array1, array4, true, comparator.compare)).toBe(-1);
        expect(arrayFunctions.compare(array4, array1, true, comparator.compare)).toBe(1);

        expect(arrayFunctions.compare(array5, array6, true)).toBe(0);
        expect(arrayFunctions.compare(array5, array7, true)).toBe(-1);
        expect(arrayFunctions.compare(array5, array7, false)).toBe(0);
        expect(arrayFunctions.compare(array7, array5, true)).toBe(1);
        expect(arrayFunctions.compare(array7, array5, false)).toBe(0);
        expect(arrayFunctions.compare(array5, array8, true)).toBe(-1);
        expect(arrayFunctions.compare(array8, array5, true)).toBe(1);
    });

    it('determines the index of an element in an array with minimal distance to a given element', () => {
        const array = [0, 1, 2, 3, 4, 5];
        const element = 1.2;
        const distFct = (x: number, y: number) => Math.abs(x - y);
        let index = arrayFunctions.indexOfElementWithMinimalDistance(array, element, distFct);
        expect(index).toBe(1);

        const maxDist = 0.1;
        index = arrayFunctions.indexOfElementWithMinimalDistance(array, element, distFct, maxDist);
        expect(index).toBe(-1);
    });

    it('creates an array with unique elements', () => {
        const array1 = [0, 1, 2, 3];
        const array2 = [0, 1, 1, 2, 3];
        const array3 = [{ val: 0 }, { val: 1 }, { val: 2 }, { val: 3 }];
        const array4 = [new EqualityObject(0), new EqualityObject(1), new EqualityObject(1), new EqualityObject(2), new EqualityObject(3)];

        const eqFct = (v1: any, v2: any) => v1.val === v2.val;

        expect(arrayFunctions.equals(arrayFunctions.makeElementsUnique(array2), array1)).toBe(true);
        expect(arrayFunctions.equals(arrayFunctions.makeElementsUnique(array4), array3)).toBe(true);
        expect(arrayFunctions.equals(arrayFunctions.makeElementsUnique(array4, eqFct), array3, eqFct)).toBe(true);
    });
});