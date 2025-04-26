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
 import { LineSegment } from '../geom/linesegment';
 import { VoronoiNeighbours } from './voronoidelaunay';
 
 describe('Voronoi neighbours', () => {
     it('calculates minimum distances of Voronoi centers to separating border', () => {
         let delaunayEdge = new LineSegment(new Vector(0, 1), new Vector(0, -1));
         let voronoiEdge = new LineSegment(new Vector(1, 0), new Vector(-1, 0));
         let voronoiNeighbours = new VoronoiNeighbours(delaunayEdge, voronoiEdge);
         let minDist = voronoiNeighbours.getMinDist();
 
         expect(minDist).toBe(1.0);
 
         delaunayEdge = new LineSegment(new Vector(0, 1), new Vector(0, -1));
         voronoiEdge = new LineSegment(new Vector(1, 0), new Vector(2, 0));
         voronoiNeighbours = new VoronoiNeighbours(delaunayEdge, voronoiEdge);
         minDist = voronoiNeighbours.getMinDist();
 
         expect(minDist).toBe(Math.SQRT2);
     });
 
     it('calculates maximum distances of Voronoi centers to separating border', () => {
         let delaunayEdge = new LineSegment(new Vector(0, 1), new Vector(0, -1));
         let voronoiEdge = new LineSegment(new Vector(1, 0), new Vector(-1, 0));
         let voronoiNeighbours = new VoronoiNeighbours(delaunayEdge, voronoiEdge);
         let maxDist = voronoiNeighbours.getMaxDist();
 
         expect(maxDist).toBe(Math.SQRT2);
 
         delaunayEdge = new LineSegment(new Vector(0, 1), new Vector(0, -1));
         voronoiEdge = new LineSegment(new Vector(1, 0), new Vector(2, 0));
         voronoiNeighbours = new VoronoiNeighbours(delaunayEdge, voronoiEdge);
         maxDist = voronoiNeighbours.getMaxDist();
 
         expect(maxDist).toBe(Math.sqrt(5));
     });
 
     it('checks Voronoi neighbours for equality', () => {
         let delaunayEdge = new LineSegment(new Vector(0, 1), new Vector(0, -1));
         let voronoiEdge = new LineSegment(new Vector(1, 0), new Vector(-1, 0));
         const voronoiNeighbours = new VoronoiNeighbours(delaunayEdge, voronoiEdge);
 
         delaunayEdge = new LineSegment(new Vector(0, 1), new Vector(0, -1));
         voronoiEdge = new LineSegment(new Vector(1, 0), new Vector(2, 0));
         const voronoiNeighbours2 = new VoronoiNeighbours(delaunayEdge, voronoiEdge);
 
         expect(voronoiNeighbours.equals(voronoiNeighbours)).toBe(true);
         expect(voronoiNeighbours.equals(voronoiNeighbours2)).toBe(false);
     });
 });