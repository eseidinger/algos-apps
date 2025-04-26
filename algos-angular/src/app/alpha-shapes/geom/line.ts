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

 import { Vector } from './vector';
 import comparator from '../util/comparator';
 
 /**
  * An infinite line.
  */
 export class Line {
     public readonly origin: Vector;
     public readonly direction: Vector;
 
     /**
      * Constructor for the Line class.
      *
      * @param origin - A point on the line
      * @param direction - The direction of the line
      */
     constructor(origin: Vector, direction: Vector) {
         this.origin = origin;
         this.direction = direction;
     }
 
     /**
      * Projection of a point on this line.
      *
      * @param point - The point to project
      * @returns The projection of the point on this line, or null if not existent
      */
     public pointProjection(point: Vector): Vector | null {
         const nullVect = new Vector(0, 0);
         if (this.direction.equals(nullVect)) {
             return null;
         } else {
             return this.origin.add(
                 this.direction.multiplyScalar(
                     point.sub(this.origin).multiplyVector(this.direction) /
                         this.direction.abssquare()
                 )
             );
         }
     }
 
     /**
      * Calculates the factor lambda needed to multiply with the directional vector
      * of this line to reach a point from the origin of this line.
      *
      * @param point - The point to reach
      * @returns Lambda or null if not existent
      */
     public calculateLambda(point: Vector): number | null {
         const nullVect = new Vector(0, 0);
 
         // Point
         if (this.direction.equals(nullVect)) {
             if (!this.origin.equals(point)) {
                 return null;
             } else {
                 return 0;
             }
         }
 
         // Parallel to y-Axis
         if (comparator.compareWithTolerance(this.direction.x, 0) === 0) {
             if (comparator.compareWithTolerance(this.origin.x, point.x) !== 0) {
                 return null;
             }
             return (point.y - this.origin.y) / this.direction.y;
         }
 
         // Parallel to x-Axis
         if (comparator.compareWithTolerance(this.direction.y, 0) === 0) {
             if (comparator.compareWithTolerance(this.origin.y, point.y) !== 0) {
                 return null;
             }
             return (point.x - this.origin.x) / this.direction.x;
         }
 
         // General case
         const lambda1 = (point.x - this.origin.x) / this.direction.x;
         const lambda2 = (point.y - this.origin.y) / this.direction.y;
         if (comparator.compareWithTolerance(lambda1, lambda2) !== 0) {
             return null;
         } else {
             return lambda1;
         }
     }
 
     /**
      * Checks whether a point is contained on this line or not.
      *
      * @param point - The point to check
      * @returns True if the point is contained, false otherwise
      */
     public containsPoint(point: Vector): boolean {
         const lambda = this.calculateLambda(point);
         return lambda !== null;
     }
 
     /**
      * Determines the intersection of this line with another line.
      *
      * @param line - The line to intersect with
      * @returns The intersection point, or null if not existent
      */
     public getIntersection(line: Line): Vector | null {
         const directionSum = this.direction.normalize().add(line.direction.normalize());
         const nullVect = new Vector(0, 0);
         const doubleDir = this.direction.normalize().multiplyScalar(2);
 
         // Points
         if (line.direction.equals(nullVect) || this.direction.equals(nullVect)) {
             if (line.origin.equals(this.origin)) {
                 return line.origin;
             } else {
                 return null;
             }
         }
 
         // Parallels
         if (directionSum.equals(nullVect) || directionSum.equals(doubleDir)) {
             return null;
         }
 
         // Calculate lambda
         let lambda: number;
         if (comparator.compareWithTolerance(line.direction.x, 0) !== 0) {
             const num =
                 line.origin.y +
                 (this.origin.x - line.origin.x) * (line.direction.y / line.direction.x) -
                 this.origin.y;
             const denom =
                 this.direction.y - this.direction.x * (line.direction.y / line.direction.x);
             lambda = num / denom;
         } else {
             lambda = (line.origin.x - this.origin.x) / this.direction.x;
         }
 
         return this.origin.add(this.direction.multiplyScalar(lambda));
     }
 }