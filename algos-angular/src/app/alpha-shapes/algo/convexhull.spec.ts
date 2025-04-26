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

 import { Vector } from '../geom/vector';
 import { ConvexHull } from './convexhull';
 import arrayFunctions from '../util/array';
 
 describe('convex hull', () => {
     it('determines if three points make a right turn', () => {
         const p1 = new Vector(0, 0);
         const p2 = new Vector(1, 0);
         const p3 = new Vector(1, 1);
         const p4 = new Vector(1, -1);
         const p5 = new Vector(2, 0);
 
         expect(ConvexHull.makeRightTurn([p1, p2, p3])).toBe(true);
         expect(ConvexHull.makeRightTurn([p1, p2, p4])).toBe(false);
         expect(ConvexHull.makeRightTurn([p1, p2, p5])).toBe(false);
     });
 
     it('computes the convex hull', () => {
         let points: Vector[] = [
             new Vector(120, 20),
             new Vector(20, 120),
             new Vector(120, 120),
             new Vector(220, 120),
             new Vector(120, 220),
         ];
 
         let convexHull = ConvexHull.compute(points);
 
         let expConvexHull: Vector[] = [
             new Vector(20, 120),
             new Vector(120, 20),
             new Vector(220, 120),
             new Vector(120, 220),
         ];
 
         expect(arrayFunctions.equals(convexHull, expConvexHull)).toBe(true);
 
         points = [
             new Vector(0, 0),
             new Vector(10, 0),
             new Vector(10, 10),
             new Vector(0, 10),
             new Vector(5, 5),
         ];
 
         convexHull = ConvexHull.compute(points);
 
         expConvexHull = [
             new Vector(0, 0),
             new Vector(10, 0),
             new Vector(10, 10),
             new Vector(0, 10),
         ];
 
         expect(arrayFunctions.equals(convexHull, expConvexHull)).toBe(true);
     });
 });