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

 import { Drawer } from './drawer';
 import { Vector } from '../geom/vector';
 import { PathElement } from '../geom/pathelement';
 import { LineSegment } from '../geom/linesegment';
 import { Computations } from '../application/computations';
 import { SharedData } from '../application/shareddata';
 
 export interface VoronoiState {
  showVoronoiMax: boolean;
  showVoronoiMin: boolean;
  showTriangles: boolean;
  showBeachLine: boolean;
  sweepLinePercentage: number;
  showDelaunayMax: boolean;
  showDelaunayMin: boolean;
}

 export class DrawingController {
     // Constants for diagram appearance
     static convexHullLineWidth = 2;
     static convexHullColor = '#000000';
     static convexHullOpacity = 1;
     static smallestCircleLineWidth = 2;
     static smallestCircleColor = '#000000';
     static smallestCircleOpacity = 1;
     static voronoiLineWidth = 2;
     static voronoiColor = '#0000ff';
     static voronoiOpacity = 0.5;
     static beachLineLineWidth = 2;
     static beachLineColor = '#008000';
     static beachLineOpacity = 0.5;
     static trianglesLineWidth = 2;
     static trianglesColor = '#008000';
     static trianglesOpacity = 0.5;
     static delaunayLineWidth = 2;
     static delaunayColor = '#ff0000';
     static delaunayOpacity = 0.5;
     static alphaShapeLineWidth = 10;
     static alphaShapePointSize = 12;
     static alphaShapeColor = '#ff0000';
     static alphaShapeOpacity = 0.2;
     static alphaHullColor = '#008000';
     static alphaHullOpacity = 0.2;
 
     // Variables to control which diagrams are displayed
     static displayAlphaShape = false;
     static displayAlphaHull = false;
     static displayAlphaDisc = false;
     static displaySmallestCircle = false;
     static displayConvexHull = true;
 

     /**
      * Draw diagrams using the given canvas drawer.
      *
      * @param canvasDrawer - The drawer to use for drawing
      */
     static drawDiagrams(canvasDrawer: Drawer, canvasWidth: number, canvasHeight: number, voronoiState: VoronoiState): void {
        const sweepLinePosition = Math.round(voronoiState.sweepLinePercentage / 100 * canvasHeight);
         if (this.displayAlphaHull) {
             this.drawAlphaHull(canvasDrawer);
         }
         if (voronoiState.showDelaunayMin) {
             canvasDrawer.drawPathElements(
                 Computations.delaunayMin,
                 this.delaunayLineWidth,
                 this.delaunayColor,
                 this.delaunayOpacity
             );
         }
         if (voronoiState.showVoronoiMin) {
             canvasDrawer.drawPathElements(
                 Computations.voronoiMin,
                 this.voronoiLineWidth,
                 this.voronoiColor,
                 this.voronoiOpacity
             );
         }
         if (voronoiState.showBeachLine) {
             const sweepLine = new LineSegment(
                 new Vector(0, sweepLinePosition),
                 new Vector(canvasWidth, sweepLinePosition)
             );
             canvasDrawer.drawPathElements(
                 [sweepLine],
                 this.beachLineLineWidth,
                 this.beachLineColor,
                 this.beachLineOpacity
             );
             canvasDrawer.drawPath(
                 Computations.voronoiMinBeachLine,
                 this.beachLineLineWidth,
                 this.beachLineColor,
                 this.beachLineOpacity
             );
         }
         if (voronoiState.showDelaunayMax) {
             canvasDrawer.drawPathElements(
                 Computations.delaunayMax,
                 this.delaunayLineWidth,
                 this.delaunayColor,
                 this.delaunayOpacity
             );
         }
         if (voronoiState.showVoronoiMax) {
             canvasDrawer.drawPathElements(
                 Computations.voronoiMax,
                 this.voronoiLineWidth,
                 this.voronoiColor,
                 this.voronoiOpacity
             );
         }
         if (voronoiState.showTriangles) {
             if (SharedData.selectedTriangle > -1) {
                 canvasDrawer.drawPathElements(
                     Computations.voronoiMaxTriangles[SharedData.selectedTriangle],
                     this.trianglesLineWidth,
                     this.trianglesColor,
                     this.trianglesOpacity
                 );
                 if (Computations.voronoiMaxCenters[SharedData.selectedTriangle] !== null) {
                     canvasDrawer.drawPoints(
                         [Computations.voronoiMaxCenters[SharedData.selectedTriangle]!],
                         10,
                         this.trianglesColor,
                         0.5
                     );
                 }
                 canvasDrawer.drawPathElements(
                     Computations.voronoiMaxCircles[SharedData.selectedTriangle],
                     this.trianglesLineWidth,
                     this.trianglesColor,
                     this.trianglesOpacity
                 );
             }
         }
         if (this.displaySmallestCircle) {
             canvasDrawer.drawPathElements(Computations.smallestCircle, 1, 'black', 1);
         }
         if (this.displayConvexHull) {
             canvasDrawer.drawPathElements(Computations.convexHull, 1, 'black', 1);
         }
         if (this.displayAlphaShape) {
             this.drawAlphaShape(canvasDrawer);
         }
         canvasDrawer.drawPoints(SharedData.points, 5, 'black', 1);
         if (this.displayAlphaDisc) {
             this.drawAlphaDisc(canvasDrawer);
         }
     }
 
     /**
      * Draw alpha shape using the given canvas drawer.
      *
      * @param canvasDrawer - The drawer to use for drawing
      */
     static drawAlphaShape(canvasDrawer: Drawer): void {
         canvasDrawer.drawPathElements(
             Computations.alphaShapeEdges,
             this.alphaShapeLineWidth,
             this.alphaShapeColor,
             this.alphaShapeOpacity
         );
         canvasDrawer.drawPoints(
             Computations.alphaShapeVertices,
             this.alphaShapePointSize,
             this.alphaShapeColor,
             this.alphaShapeOpacity
         );
     }
 
     /**
      * Draw alpha hull using the given canvas drawer.
      *
      * @param canvasDrawer - The drawer to use for drawing
      */
     static drawAlphaHull(canvasDrawer: Drawer): void {
         if (SharedData.points.length > 1) {
             canvasDrawer.fillCanvas(this.alphaHullColor, this.alphaHullOpacity);
             if (SharedData.alpha < 0) {
                 Computations.alphaHull.forEach((path: PathElement[]) => {
                     canvasDrawer.fillPathInverted(path, 'white', 1);
                 });
             } else if (SharedData.alpha > 0) {
                 Computations.alphaHull.forEach((path: PathElement[]) => {
                     canvasDrawer.fillPath(path, 'white', 1);
                 });
             }
         }
     }
 
     /**
      * Draw alpha disc using the given canvas drawer.
      *
      * @param canvasDrawer - The drawer to use for drawing
      */
     static drawAlphaDisc(canvasDrawer: Drawer): void {
         let color = 'green';
         if (SharedData.alpha < 0) {
             SharedData.points.forEach((point: Vector) => {
                 if (SharedData.alphaDiscCenter.dist(point) > -SharedData.alpha) {
                     color = 'red';
                 }
             });
         } else {
             SharedData.points.forEach((point: Vector) => {
                 if (SharedData.alphaDiscCenter.dist(point) < SharedData.alpha) {
                     color = 'red';
                 }
             });
         }
         canvasDrawer.drawPoints([SharedData.alphaDiscCenter], 5, color, 0.2);
         if (SharedData.alpha !== 0) {
             canvasDrawer.drawPoints(
                 [SharedData.alphaDiscCenter],
                 Math.abs(SharedData.alpha),
                 color,
                 0.2
             );
         }
     } 
 }