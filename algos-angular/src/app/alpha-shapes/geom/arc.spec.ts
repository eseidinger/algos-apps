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

 import { Arc } from './arc';
 import { Vector } from './vector';
 import { Rectangle } from './rectangle';
 import comparator from '../util/comparator';
 
 describe('Arc', () => {
     it('calculates the middle of the arc', () => {
         const center = new Vector(0, 0);
         const point1 = new Vector(1, 0);
         const point2 = new Vector(0, 1);
 
         const arc1 = new Arc(center, point1, point2, true);
         const arc2 = new Arc(center, point1, point2, false);
 
         const expMiddle1 = new Vector(Math.sqrt(2) / 2, Math.sqrt(2) / 2);
         const expMiddle2 = new Vector(-Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
 
         const middle1 = arc1.arcMiddle();
         const middle2 = arc2.arcMiddle();
 
         expect(middle1.equals(expMiddle1)).toBe(true);
         expect(middle2.equals(expMiddle2)).toBe(true);
     });
 
     it('determines whether it lies in a given rectangle or not', () => {
         const center = new Vector(0, 0);
         const point1 = new Vector(0, 1);
         const point2 = new Vector(1, 0);
 
         const arc1 = new Arc(center, point1, point2, true);
         const arc2 = new Arc(center, point1, point2, false);
 
         expect(arc1.liesInRectangle(new Rectangle(0, 0, 2, 2))).toBe(false);
         expect(arc2.liesInRectangle(new Rectangle(0, 0, 2, 2))).toBe(true);
     });
 
     it('compares two arcs for equality', () => {
         const point1 = new Vector(1, 1);
         const point2 = new Vector(1, -1);
         const center = new Vector(0, 0);
 
         const arc1 = new Arc(center, point1, point2, true);
         const arc2 = new Arc(center, point1, point2, true);
         const arc3 = new Arc(center, point2, point1, false);
         const arc4 = new Arc(center, point2, point1, true);
 
         expect(arc1.equals(arc2)).toBe(true);
         expect(arc1.equals(arc3)).toBe(true);
         expect(arc1.equals(arc4)).toBe(false);
     });
 
     it('determines its start angle', () => {
         const center = new Vector(0, 0);
         const point1 = new Vector(1, 0);
         const point2 = new Vector(0, 1);
 
         const arc1 = new Arc(center, point1, point2, true);
         const arc2 = new Arc(center, point2, point1, false);
 
         expect(comparator.compareWithTolerance(arc1.startAngle, 0)).toBe(0);
         expect(comparator.compareWithTolerance(arc2.startAngle, Math.PI / 2)).toBe(0);
     });
 
     it('determines its end angle', () => {
         const center = new Vector(0, 0);
         const point1 = new Vector(1, 0);
         const point2 = new Vector(0, 1);
 
         const arc1 = new Arc(center, point1, point2, true);
         const arc2 = new Arc(center, point2, point1, false);
 
         expect(comparator.compareWithTolerance(arc2.endAngle, 0)).toBe(0);
         expect(comparator.compareWithTolerance(arc1.endAngle, Math.PI / 2)).toBe(0);
     });
 
     it('determines its radius', () => {
         const center = new Vector(0, 0);
         const point1 = new Vector(1, 0);
         const point2 = new Vector(0, 1);
 
         const arc1 = new Arc(center, point1, point2, true);
         const arc2 = new Arc(center, point2, point1, false);
 
         expect(comparator.compareWithTolerance(arc1.radius, 1)).toBe(0);
         expect(comparator.compareWithTolerance(arc2.radius, 1)).toBe(0);
     });
 });