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

 import { HalfPlane } from './halfplane';
 import { Rectangle } from './rectangle';
 import { Vector } from './vector';
 import arrayFunctions from '../util/array';
 
 describe('Half plane', () => {
     it('checks whether it contains a rectangle', () => {
         const halfPlane = new HalfPlane(new Vector(0, 0), new Vector(1, 0));
 
         let rect = new Rectangle(0, 0, 1, 1);
         expect(halfPlane.containsRectangle(rect)).toBe(true);
 
         rect = new Rectangle(0, 0, -1, -1);
         expect(halfPlane.containsRectangle(rect)).toBe(false);
     });
 
     it('crops a half plane to fit a rectangle', () => {
         let halfPlane = new HalfPlane(new Vector(0, 0), new Vector(1, 0));
         const rect = new Rectangle(-1, -1, 1, 1);
 
         let polygon = halfPlane.crop(rect);
         let path = [ polygon!.start, ...polygon!.points];
         let expPath = [
             new Vector(1, 0),
             new Vector(1, 1),
             new Vector(-1, 1),
             new Vector(-1, 0),
         ];
 
         expect(arrayFunctions.compare(path, expPath, true)).toBe(0);
 
         halfPlane = new HalfPlane(new Vector(0, 0), new Vector(-1, 0));
         polygon = halfPlane.crop(rect);
         path = [ polygon!.start, ...polygon!.points];
 
         expPath = [
             new Vector(-1, 0),
             new Vector(-1, -1),
             new Vector(1, -1),
             new Vector(1, 0),
         ];
 
         expect(arrayFunctions.compare(path, expPath, true)).toBe(0);
 
         halfPlane = new HalfPlane(new Vector(0, 1), new Vector(-1, 0));
         polygon = halfPlane.crop(rect);
         path = [ polygon!.start, ...polygon!.points];
 
         expPath = [
             new Vector(-1, 1),
             new Vector(-1, -1),
             new Vector(1, -1),
             new Vector(1, 1),
         ];
 
         expect(arrayFunctions.compare(path, expPath, true)).toBe(0);
 
         halfPlane = new HalfPlane(new Vector(0, 1), new Vector(1, 0));
         polygon = halfPlane.crop(rect);
 
         expect(polygon).toBe(null);
     });
 });