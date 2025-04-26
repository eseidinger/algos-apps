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
 import { Circle } from './circle';
 import { LineSegment } from './linesegment';
 import comparator from '../util/comparator';
 
 /**
  * A triangle.
  */
 export class Triangle {
     public readonly p1: Vector;
     public readonly p2: Vector;
     public readonly p3: Vector;
     private circumcircle: Circle | null = null;
     private angle: number | null = null;
 
     /**
      * Constructor for the Triangle class.
      *
      * @param p1 - First corner of the triangle
      * @param p2 - Second corner of the triangle
      * @param p3 - Third corner of the triangle
      */
     constructor(p1: Vector, p2: Vector, p3: Vector) {
         this.p1 = p1;
         this.p2 = p2;
         this.p3 = p3;
     }
 
     /**
      * Calculate the circumcircle of the triangle.
      *
      * @private
      * @returns The circumcircle of the triangle
      */
     private calcCircumcircle(): Circle {
         let center: Vector;
         let radius: number;
         const det = Vector.calcDet(this.p1, this.p2, this.p3);
 
         if (comparator.compareWithTolerance(det, 0) !== 0) {
             const numX =
                 (Math.pow(this.p1.x, 2) + Math.pow(this.p1.y, 2)) * (this.p2.y - this.p3.y) +
                 (Math.pow(this.p2.x, 2) + Math.pow(this.p2.y, 2)) * (this.p3.y - this.p1.y) +
                 (Math.pow(this.p3.x, 2) + Math.pow(this.p3.y, 2)) * (this.p1.y - this.p2.y);
 
             const numY =
                 (Math.pow(this.p1.x, 2) + Math.pow(this.p1.y, 2)) * (this.p3.x - this.p2.x) +
                 (Math.pow(this.p2.x, 2) + Math.pow(this.p2.y, 2)) * (this.p1.x - this.p3.x) +
                 (Math.pow(this.p3.x, 2) + Math.pow(this.p3.y, 2)) * (this.p2.x - this.p1.x);
 
             const denom =
                 this.p1.y * (this.p3.x - this.p2.x) +
                 this.p2.y * (this.p1.x - this.p3.x) +
                 this.p3.y * (this.p2.x - this.p1.x);
 
             const x = 0.5 * numX / denom;
             const y = 0.5 * numY / denom;
 
             center = new Vector(x, y);
             radius =
                 (this.p1.dist(this.p2) * this.p2.dist(this.p3) * this.p3.dist(this.p1)) /
                 (2 * Math.abs(det));
         } else {
             const ls1 = new LineSegment(this.p1, this.p2);
             const ls2 = new LineSegment(this.p1, this.p3);
             const ls3 = new LineSegment(this.p2, this.p3);
             const ls = [ls1, ls2, ls3];
             ls.sort((ls1, ls2) => comparator.compare(ls1.getLength(), ls2.getLength()));
             center = ls[2].getCenter();
             radius = ls[2].getLength() / 2;
         }
 
         return new Circle(center, radius);
     }
 
     /**
      * Get the circumcircle of the triangle.
      *
      * @returns The circumcircle of the triangle
      */
     public getCircumcircle(): Circle {
         if (this.circumcircle === null) {
             this.circumcircle = this.calcCircumcircle();
         }
         return this.circumcircle;
     }
 
     /**
      * Calculate the angle <p1, p2, p3>.
      *
      * @returns The angle <p1, p2, p3> in radians
      */
     public getMiddleAngle(): number {
         if (this.angle === null) {
             const num =
                 this.p1.distSquare(this.p2) +
                 this.p2.distSquare(this.p3) -
                 this.p1.distSquare(this.p3);
             const denom = 2 * this.p1.dist(this.p2) * this.p2.dist(this.p3);
 
             if (comparator.compareWithTolerance(denom, 0) === 0) {
                 this.angle = Math.PI;
             } else {
                 this.angle = Math.acos(num / denom);
             }
         }
         return this.angle;
     }
 
     /**
      * Checks whether a point is a corner of this triangle.
      *
      * @param p - The point to check
      * @returns True if the point is a corner, false otherwise
      */
     public isCorner(p: Vector): boolean {
         return this.p1.equals(p) || this.p2.equals(p) || this.p3.equals(p);
     }
 
     /**
      * Returns an array of line segments describing this triangle.
      *
      * @returns An array of line segments
      */
     public getLineSegments(): LineSegment[] {
         return [
             new LineSegment(this.p1, this.p2),
             new LineSegment(this.p2, this.p3),
             new LineSegment(this.p3, this.p1),
         ];
     }
 
     /**
      * Defines an order on triangles. Triangles are compared by circumcircle radius, then by angle <p1, p2, p3>.
      *
      * @param t1 - The first triangle
      * @param t2 - The second triangle
      * @returns 0 if t1 == t2, -1 if t1 < t2, 1 if t1 > t2
      */
     public static compare(t1: Triangle, t2: Triangle): number {
         const compR = comparator.compareWithTolerance(
             t1.getCircumcircle().radius,
             t2.getCircumcircle().radius
         );
         if (compR !== 0) {
             return compR;
         } else {
             return comparator.compareWithTolerance(t1.getMiddleAngle(), t2.getMiddleAngle());
         }
     }
 }