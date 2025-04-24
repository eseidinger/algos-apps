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

 import { Rectangle } from './rectangle';
 import { Vector } from './vector';
 import { LineSegment } from './linesegment';
 import arrayFunctions from '../util/array';
 import comparator from '../util/comparator';
 
 describe('Rectangle', () => {
     it('calculates intersection points with line', () => {
         const rect = new Rectangle(0, 0, 1, 1);
         const start1 = new Vector(0, 0.5);
         const start2 = new Vector(0.5, 0);
         const end1 = new Vector(1, 0.5);
         const end2 = new Vector(0.5, 1);
         const line1 = new LineSegment(start1, end1);
         const line2 = new LineSegment(start2, end2);
 
         let ints = rect.getIntersections(line1);
         let expInts = [new Vector(0, 0.5), new Vector(1, 0.5)];
         expect(arrayFunctions.compare(ints, expInts, false)).toBe(0);
 
         ints = rect.getIntersections(line2);
         expInts = [new Vector(0.5, 0), new Vector(0.5, 1)];
         expect(arrayFunctions.compare(ints, expInts, false)).toBe(0);
     });
 
     it('calculates the minimum distance of a point to the rectangle', () => {
         const point = new Vector(1, 1);
         const rect = new Rectangle(0, 0, 3, 3);
         expect(rect.getMinimumDistanceFromBorder(point)).toBe(1);
     });
 
     it('calculates the maximum distance of a point to the rectangle', () => {
         const point = new Vector(0, 0);
         const rect = new Rectangle(0, 0, 1, 1);
         const maxDist = rect.getMaximumDistanceFromBorder(point);
         expect(comparator.compareWithTolerance(maxDist, Math.sqrt(2))).toBe(0);
     });
 
     it('determines if a point lies inside', () => {
         const rect = new Rectangle(0, 0, 1, 1);
         const point1 = new Vector(0, 0);
         const point2 = new Vector(0.5, 0.5);
         const point3 = new Vector(-1, 0);
 
         expect(rect.containsPoint(point1)).toBe(true);
         expect(rect.containsPoint(point2)).toBe(true);
         expect(rect.containsPoint(point3)).toBe(false);
     });
 
     it('determines if a point lies on the border', () => {
         const rect = new Rectangle(0, 0, 1, 1);
         const point1 = new Vector(0, 0);
         const point2 = new Vector(0.5, 0.5);
         const point3 = new Vector(-1, 0);
 
         expect(rect.liesOnBorder(point1)).toBe(true);
         expect(rect.liesOnBorder(point2)).toBe(false);
         expect(rect.liesOnBorder(point3)).toBe(false);
     });
 
     it('determines a path on its border from a starting to an endpoint in clockwise direction (screen coordinates)', () => {
         const rect = new Rectangle(0, 0, 10, 10);
 
         let start = new Vector(0, 1);
         let end = new Vector(0, 2);
         let expPath = [start, rect.points[0], rect.points[1], rect.points[2], rect.points[3], end];
 
         let path = rect.getPathOnBorder(start, end);
         expect(arrayFunctions.equals(path, expPath)).toBe(true);
 
         start = new Vector(2, 0);
         end = new Vector(1, 0);
         expPath = [start, rect.points[1], rect.points[2], rect.points[3], rect.points[0], end];
 
         path = rect.getPathOnBorder(start, end);
         expect(arrayFunctions.equals(path, expPath)).toBe(true);
 
         start = new Vector(10, 2);
         end = new Vector(10, 1);
         expPath = [start, rect.points[2], rect.points[3], rect.points[0], rect.points[1], end];
 
         path = rect.getPathOnBorder(start, end);
         expect(arrayFunctions.equals(path, expPath)).toBe(true);
 
         start = new Vector(1, 10);
         end = new Vector(2, 10);
         expPath = [start, rect.points[3], rect.points[0], rect.points[1], rect.points[2], end];
 
         path = rect.getPathOnBorder(start, end);
         expect(arrayFunctions.equals(path, expPath)).toBe(true);
     });
 });