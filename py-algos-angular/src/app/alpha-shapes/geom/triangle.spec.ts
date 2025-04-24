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
 import { Triangle } from './triangle';
 import { Circle } from './circle';
 import comparator from '../util/comparator';
 
 describe('Triangle', () => {
     it('calculates its circumcircle', () => {
         let p1 = new Vector(0, 0);
         let p2 = new Vector(0, 1);
         let p3 = new Vector(1, 1);
 
         let triangle = new Triangle(p1, p2, p3);
 
         let circle = triangle.getCircumcircle();
         let expected = new Circle(new Vector(0.5, 0.5), Math.SQRT2 / 2);
         expect(circle.equals(expected)).toBe(true);
 
         p1 = new Vector(0, 0);
         p2 = new Vector(0, 1);
         p3 = new Vector(0, 2);
 
         triangle = new Triangle(p1, p2, p3);
 
         circle = triangle.getCircumcircle();
         expected = new Circle(new Vector(0, 1), 1);
         expect(circle.equals(expected)).toBe(true);
 
         triangle = new Triangle(p1, p2, p1);
 
         circle = triangle.getCircumcircle();
         expected = new Circle(new Vector(0, 0.5), 0.5);
         expect(circle.equals(expected)).toBe(true);
 
         triangle = new Triangle(p1, p2, p2);
 
         circle = triangle.getCircumcircle();
         expected = new Circle(new Vector(0, 0.5), 0.5);
         expect(circle.equals(expected)).toBe(true);
     });
 
     it('calculates its middle angle', () => {
         const p1 = new Vector(0, 0);
         const p2 = new Vector(0, 1);
         const p3 = new Vector(1, 1);
         const p5 = new Vector(0, 2);
 
         let triangle = new Triangle(p1, p2, p3);
 
         let angle = triangle.getMiddleAngle();
         expect(comparator.compareWithTolerance(angle, Math.PI / 2)).toBe(0);
 
         triangle = new Triangle(p1, p2, p5);
         angle = triangle.getMiddleAngle();
         expect(comparator.compareWithTolerance(angle, Math.PI)).toBe(0);
 
         triangle = new Triangle(p1, p2, p1);
         angle = triangle.getMiddleAngle();
         expect(comparator.compareWithTolerance(angle, 0)).toBe(0);
 
         triangle = new Triangle(p3, p2, p1);
         angle = triangle.getMiddleAngle();
         expect(comparator.compareWithTolerance(angle, Math.PI / 2)).toBe(0);
     });
 
     it('checks whether a point is a corner of the triangle', () => {
         const p1 = new Vector(0, 0);
         const p2 = new Vector(0, 1);
         const p3 = new Vector(1, 1);
 
         const inPoint = new Vector(1, 1);
         const outPoint = new Vector(1, 0);
 
         const triangle = new Triangle(p1, p2, p3);
         expect(triangle.isCorner(inPoint)).toBe(true);
         expect(triangle.isCorner(outPoint)).toBe(false);
     });
 
     it('compares two triangles by radius and angle', () => {
         const p1 = new Vector(0, 0);
         const p2 = new Vector(0, 1);
         const p3 = new Vector(1, 1);
         const p4 = new Vector(-1, 1);
         const p5 = new Vector(0.5, 0.5);
 
         const triangle1 = new Triangle(p1, p2, p3);
         const triangle2 = new Triangle(p1, p2, p4);
         const triangle3 = new Triangle(p1, p5, p3);
         const triangle4 = new Triangle(p1, p5, p1);
 
         expect(Triangle.compare(triangle1, triangle2)).toBe(0);
         expect(Triangle.compare(triangle1, triangle3)).toBe(-1);
         expect(Triangle.compare(triangle1, triangle4)).toBe(1);
     });
 });