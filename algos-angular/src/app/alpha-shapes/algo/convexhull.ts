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
 import array from '../util/array';
 
 /**
  * Algorithm to construct the convex hull of a given set of points.
  */
 export class ConvexHull {
     /**
      * Determine whether a sequence of points makes a right turn given screen coordinates (y coordinate mirrored).
      *
      * @private
      * @param points - Array of three point vectors
      * @returns True if points make a right turn, false otherwise
      */
     public static makeRightTurn(points: Vector[]): boolean {
         const det = Vector.calcDet(points[0], points[1], points[2]);
         return det > 0;
     }
 
     /**
      * Calculate half convex hull polygon of a sorted array of points.
      *
      * @private
      * @param points - Sorted array of points (sorted first by x and then by y coordinate)
      * @returns Point vectors of the half convex hull polygon
      */
     private static computeHalfConvexHull(points: Vector[]): Vector[] {
         if (points.length > 1) {
             // Start with the first two elements in the point array
             const hull: Vector[] = points.slice(0, 2);
             for (let i = 2; i < points.length; i++) {
                 hull.push(points[i]);
                 // Check the last three points for a right turn
                 while (hull.length > 2 && !ConvexHull.makeRightTurn(hull.slice(-3))) {
                     // Remove the middle element if no right turn is detected
                     hull.splice(-2, 1);
                 }
             }
             return hull;
         } else {
             return points.slice(0);
         }
     }
 
     /**
      * Compute convex hull points of an array of points on a plane. Points are returned in clockwise
      * (screen coordinates) order. The first point is the left and top-most point of the convex hull.
      *
      * @param points - Array of points on a plane
      * @returns Corners of the contour polygon
      */
     public static compute(points: Vector[]): Vector[] {
         let convexHull: Vector[] = [];
 
         if (points.length > 1) {
             // Sort points by x and then by y coordinate
             let sorted = array.sort(points);
             const L_upper = ConvexHull.computeHalfConvexHull(sorted);
 
             // Sort points in reverse order
             sorted = array.sort(points, (p1, p2) => -1 * Vector.compare(p1, p2));
             const L_lower = ConvexHull.computeHalfConvexHull(sorted);
 
             // Combine upper and lower hulls
             convexHull = L_upper.concat(L_lower);
             convexHull = array.makeElementsUnique(convexHull);
         }
 
         return convexHull;
     }
 }