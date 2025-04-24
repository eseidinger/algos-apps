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
 import { PathElement } from './pathelement';
 
 /**
  * A polygon.
  */
 export class Polygon extends PathElement {
     public readonly start: Vector;
     public readonly points: Vector[];
     public readonly closed: boolean;
     public readonly pathType: string = 'polygon';
 
     /**
      * Constructor for the Polygon class.
      *
      * @param points - An array of points defining the polygon
      * @param closed - Whether the polygon is closed
      */
     constructor(points: Vector[], closed: boolean) {
         super();
         this.start = points[0];
         this.points = points.slice(1);
         this.closed = closed;
     }
 }