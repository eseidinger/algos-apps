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
 import { Rectangle } from '../geom/rectangle';
 import { LineSegment } from '../geom/linesegment';
 import { ConvexHull } from './convexhull';
 import { Skyum } from './skyum';
 import arrayFunctions from '../util/array';
 
 describe('Skyums algorithm', () => {
     it('computes the farthest point Voronoi diagram', () => {
         const points: Vector[] = [
             new Vector(120, 20),
             new Vector(20, 120),
             new Vector(120, 120),
             new Vector(220, 120),
             new Vector(120, 220),
         ];
 
         const convexHull = ConvexHull.compute(points);
 
         const skyumResults = Skyum.computeVoronoiDiagram(convexHull);
         const voronoiLines = skyumResults.voronoiDiagram.getLineSegments();
 
         const rect = new Rectangle(0, 0, 240, 240);
         const voronoiLinesCropped = voronoiLines.map((ls) =>
             rect.cropLineSegment(ls)!.sortedEndpoints()
         );
 
         const expVoronoiMax: LineSegment[] = [
             new LineSegment(new Vector(0, 0), new Vector(120, 120)).sortedEndpoints(),
             new LineSegment(new Vector(240, 0), new Vector(120, 120)).sortedEndpoints(),
             new LineSegment(new Vector(0, 240), new Vector(120, 120)).sortedEndpoints(),
             new LineSegment(new Vector(240, 240), new Vector(120, 120)).sortedEndpoints(),
         ];
 
         expect(arrayFunctions.compare(voronoiLinesCropped, expVoronoiMax, false)).toBe(0);
     });
 });