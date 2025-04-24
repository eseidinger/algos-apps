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
 import { PathElement } from '../geom/pathelement';
 
 /**
  * Interface for a Drawer.
  */
 export interface Drawer {
     /**
      * Draws points on the canvas.
      *
      * @param points - Array of points to draw
      * @param radius - Radius of the points
      * @param color - Color of the points
      * @param alpha - Transparency of the points
      */
     drawPoints(points: Vector[], radius: number, color: string, alpha: number): void;
 
     /**
      * Fills the entire canvas with a color.
      *
      * @param color - Fill color
      * @param alpha - Transparency of the fill
      */
     fillCanvas(color: string, alpha: number): void;
 
     /**
      * Draws path elements on the canvas.
      *
      * @param path - Array of path elements
      * @param lineWidth - Width of the lines
      * @param color - Color of the lines
      * @param alpha - Transparency of the lines
      */
     drawPathElements(path: PathElement[], lineWidth: number, color: string, alpha: number): void;
 
     /**
      * Fills path elements on the canvas.
      *
      * @param path - Array of path elements
      * @param color - Fill color
      * @param alpha - Transparency of the fill
      */
     fillPathElements(path: PathElement[], color: string, alpha: number): void;
 
     /**
      * Draws a path on the canvas.
      *
      * @param path - Array of path elements
      * @param lineWidth - Width of the lines
      * @param color - Color of the lines
      * @param alpha - Transparency of the lines
      */
     drawPath(path: PathElement[], lineWidth: number, color: string, alpha: number): void;
 
     /**
      * Fills a path on the canvas.
      *
      * @param path - Array of path elements
      * @param color - Fill color
      * @param alpha - Transparency of the fill
      */
     fillPath(path: PathElement[], color: string, alpha: number): void;
 
     /**
      * Fills a path inverted on the canvas.
      *
      * @param path - Array of path elements
      * @param color - Fill color
      * @param alpha - Transparency of the fill
      */
     fillPathInverted(path: PathElement[], color: string, alpha: number): void;
 }