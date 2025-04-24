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

 import { PathElement } from './pathelement';
import { Vector } from './vector';

 /**
  * A Bezier curve.
  */
 export class Bezier implements PathElement {
     public readonly start: Vector;
     public readonly end: Vector;
     public readonly controlPoints: Vector[];
     public readonly pathType: string = 'bezier';
 
     /**
      * Constructor for the Bezier curve.
      *
      * @param start - Start point of the curve
      * @param end - End point of the curve
      * @param controlPoints - Control points of the curve
      */
     constructor(start: Vector, end: Vector, controlPoints: Vector[]) {
         this.start = start;
         this.end = end;
         this.controlPoints = controlPoints;
     }
 }