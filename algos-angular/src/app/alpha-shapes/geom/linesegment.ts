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
 import { Line } from './line';
 import { Rectangle } from './rectangle';
 import comparator from '../util/comparator';
 import arrayFunctions from '../util/array';
import { PathElement } from './pathelement';
 
 /**
  * A finite line segment.
  */
 export class LineSegment implements PathElement {
     public readonly start: Vector;
     public readonly end: Vector;
     public readonly direction: Vector;
     public readonly pathType: string = 'line';
 
     /**
      * Constructor for the LineSegment class.
      *
      * @param start - The starting point of the line segment
      * @param end - The ending point of the line segment
      */
     constructor(start: Vector, end: Vector) {
         this.start = start;
         this.end = end;
         this.direction = end.sub(start);
     }
 
     /**
      * Checks if a given line segment equals this line segment, including direction.
      *
      * @param lineSegment - The line segment to compare with
      * @returns True if the line segments are equal, false otherwise
      */
     public equals(lineSegment: LineSegment): boolean {
         return this.start.equals(lineSegment.start) && this.end.equals(lineSegment.end);
     }
 
     /**
      * Defines an order on line segments. Line segments are compared first by their start, then by their endpoints.
      *
      * @param other - The line segment to compare with
      * @returns 0 if line segments are equal, -1 if this is less than the other, 1 if the other is less than this
      */
     public compareTo(other: LineSegment): number {
         const comp = this.start.compareTo(other.start);
         if (comp !== 0) {
             return comp;
         }
         return this.end.compareTo(other.end);
     }
 
     /**
      * Center of this line segment.
      *
      * @returns The center point of the line segment
      */
     public getCenter(): Vector {
         return this.start.add(this.direction.multiplyScalar(0.5));
     }
 
     /**
      * Length of this line segment.
      *
      * @returns The length of the line segment
      */
     public getLength(): number {
         return this.direction.abs();
     }
 
     /**
      * Projection of a point on this line segment.
      *
      * @param point - The point to project
      * @returns The projection of the point on this line segment, or null if not contained
      */
     public pointProjection(point: Vector): Vector | null {
         const line = new Line(this.start, this.direction);
         const projection = line.pointProjection(point);
         if (projection === null) {
             return null;
         }
         if (this.containsPoint(projection)) {
             return projection;
         } else {
             return null;
         }
     }
 
     /**
      * Checks whether or not a point is contained in this line segment.
      *
      * @param point - The point to check
      * @returns True if the point is contained, false otherwise
      */
     public containsPoint(point: Vector): boolean {
         const line = new Line(this.start, this.direction);
         const lambda = line.calculateLambda(point);
         if (lambda === null) {
             return false;
         }
         return (
             comparator.compareWithTolerance(lambda, 0) !== -1 &&
             comparator.compareWithTolerance(lambda, 1) !== 1
         );
     }
 
     /**
      * Calculates the intersection with another line segment.
      *
      * @param line - The line segment to intersect with
      * @returns The intersection point, or null if not existent
      */
     public getIntersection(line: LineSegment): Vector | null {
         const line1 = new Line(this.start, this.direction);
         const line2 = new Line(line.start, line.direction);
 
         const intersection = line1.getIntersection(line2);
         if (intersection !== null) {
             if (this.containsPoint(intersection) && line.containsPoint(intersection)) {
                 return intersection;
             }
         }
         return null;
     }
 
     /**
      * Calculate the minimal distance of a point to this line segment.
      *
      * @param point - The point to calculate the distance to
      * @returns The minimal distance
      */
     public getMinDist(point: Vector): number {
         const proj = this.pointProjection(point);
         if (proj !== null) {
             return proj.sub(point).abs();
         }
         const dist1 = this.start.sub(point).abs();
         const dist2 = this.end.sub(point).abs();
         return Math.min(dist1, dist2);
     }
 
     /**
      * Calculate the maximum distance of a point to this line segment.
      *
      * @param point - The point to calculate the distance to
      * @returns The maximum distance
      */
     public getMaxDist(point: Vector): number {
         const dist1 = this.start.sub(point).abs();
         const dist2 = this.end.sub(point).abs();
         return Math.max(dist1, dist2);
     }
 
     /**
      * Creates a new line segment with a starting point that is less than the endpoint according to Vector order.
      *
      * @returns A new sorted LineSegment instance
      */
     public sortedEndpoints(): LineSegment {
         const endpoints = arrayFunctions.sort([this.start, this.end]);
         return new LineSegment(endpoints[0], endpoints[1]);
     }
 
     /**
      * Crops the line segment to fit within a rectangle.
      *
      * @param rect - The rectangle to crop to
      * @returns A cropped LineSegment instance, or null if no valid segment exists
      */
     public crop(rect: Rectangle): LineSegment | null {
         const point1 = this.start;
         const point2 = this.end;
 
         if (rect.containsPoint(point1) && rect.containsPoint(point2)) {
             return new LineSegment(point1, point2);
         } else if (rect.containsPoint(point1) && !rect.containsPoint(point2)) {
             const ints = rect.getIntersections(this);
             return new LineSegment(point1, ints[0]);
         } else if (!rect.containsPoint(point1) && rect.containsPoint(point2)) {
             const ints = rect.getIntersections(this);
             return new LineSegment(ints[0], point2);
         } else {
             const ints = rect.getIntersections(this);
             if (ints.length === 2) {
                 return new LineSegment(ints[0], ints[1]);
             } else {
                 return null;
             }
         }
     }
 }