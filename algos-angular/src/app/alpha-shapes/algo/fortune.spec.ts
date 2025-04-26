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
import { Face } from '../ds/dcel';
import { Fortune, FortuneArc, FortuneBreakpoint } from './fortune';
import arrayFunctions from '../util/array';
import comparator from '../util/comparator';

describe('Fortunes algorithm', () => {
    it('inserts a square-shaped point set', () => {
        Fortune.init();
        var eventLocations = [new Vector(20, 220), new Vector(220, 220), new Vector(20 ,20),
            new Vector(220 ,20)];

        var insertionResults = Fortune.insertArc(eventLocations[0]);
        expect(insertionResults.arcBelow).toBe(null);
        expect(insertionResults.arcAbove).toBe(null);

        insertionResults = Fortune.insertArc(eventLocations[1]);
        var beachLine = Fortune.beachLine.inorderList();
        expect(beachLine.length).toBe(1);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.leftArc!.face!.center!.equals(eventLocations[0])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.rightArc!.face!.center!.equals(eventLocations[1])).toBe(true);
        expect(beachLine.reduce(function(val, el) { return val && el instanceof FortuneBreakpoint && el.leftArc !== insertionResults.arcBelow &&
            (el.rightArc !== insertionResults.arcBelow);}, true)).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && insertionResults.arcAbove === beachLine[0].rightArc).toBe(true);
        expect(insertionResults.arcAbove!.leftBreakpoint === beachLine[0]).toBe(true);
        expect(insertionResults.arcAbove!.rightBreakpoint).toBe(null);

        insertionResults = Fortune.insertArc(eventLocations[2]);
        beachLine = Fortune.beachLine.inorderList();
        expect(beachLine.length).toBe(3);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.leftArc!.face!.center!.equals(eventLocations[0])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.rightArc!.face!.center!.equals(eventLocations[2])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[1] instanceof FortuneBreakpoint && beachLine[0].rightArc === beachLine[1].leftArc).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[1]!.rightArc!.face!.center!.equals(eventLocations[0])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[1] instanceof FortuneBreakpoint && beachLine[1].rightArc !== beachLine[0].leftArc).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[2] instanceof FortuneBreakpoint && beachLine[1].rightArc === beachLine[2].leftArc).toBe(true);
        expect(beachLine[2] instanceof FortuneBreakpoint && beachLine[2]!.rightArc!.face!.center!.equals(eventLocations[1])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && insertionResults.arcAbove === beachLine[0].rightArc).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && insertionResults.arcAbove === beachLine[1].leftArc).toBe(true);
        expect(insertionResults.arcAbove!.leftBreakpoint === beachLine[0]).toBe(true);
        expect(insertionResults.arcAbove!.rightBreakpoint === beachLine[1]).toBe(true);

        var circleEvent1 = Fortune.checkArcForCircleEvent(insertionResults!.arcAbove!.rightBreakpoint!.rightArc);
        expect(circleEvent1 !== null).toBe(true);
        var radius = Math.sqrt(2*200*200)/2;
        expect(circleEvent1!.center.equals(new Vector(120,120))).toBe(true);
        expect(circleEvent1!.location.equals(new Vector(120,120 - radius))).toBe(true);

        insertionResults = Fortune.insertArc(eventLocations[3]);
        beachLine = Fortune.beachLine.inorderList();
        expect(beachLine.length).toBe(5);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.leftArc!.face!.center!.equals(eventLocations[0])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.rightArc!.face!.center!.equals(eventLocations[2])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[1] instanceof FortuneBreakpoint && beachLine[1].leftArc === beachLine[0].rightArc).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[1]!.rightArc!.face!.center!.equals(eventLocations[0])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[1] instanceof FortuneBreakpoint && beachLine[1].rightArc !== beachLine[0].leftArc).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[2] instanceof FortuneBreakpoint && beachLine[2].leftArc === beachLine[1].rightArc).toBe(true);
        expect(beachLine[2] instanceof FortuneBreakpoint && beachLine[2]!.rightArc!.face!.center!.equals(eventLocations[1])).toBe(true);
        expect(beachLine[2] instanceof FortuneBreakpoint && beachLine[3] instanceof FortuneBreakpoint && beachLine[3].leftArc === beachLine[2].rightArc).toBe(true);
        expect(beachLine[3] instanceof FortuneBreakpoint && beachLine[3]!.rightArc!.face!.center!.equals(eventLocations[3])).toBe(true);
        expect(beachLine[3] instanceof FortuneBreakpoint && beachLine[4] instanceof FortuneBreakpoint && beachLine[4].leftArc === beachLine[3].rightArc).toBe(true);
        expect(beachLine[4] instanceof FortuneBreakpoint && beachLine[4]!.rightArc!.face!.center!.equals(eventLocations[1])).toBe(true);
        expect(beachLine[2] instanceof FortuneBreakpoint && beachLine[4] instanceof FortuneBreakpoint && beachLine[4].rightArc !== beachLine[2].rightArc).toBe(true);
        expect(beachLine[3] instanceof FortuneBreakpoint && insertionResults.arcAbove === beachLine[3].rightArc).toBe(true);
        expect(beachLine[4] instanceof FortuneBreakpoint && insertionResults.arcAbove === beachLine[4].leftArc).toBe(true);
        expect(insertionResults.arcAbove!.leftBreakpoint === beachLine[3]).toBe(true);
        expect(insertionResults.arcAbove!.rightBreakpoint === beachLine[4]).toBe(true);

        expect(insertionResults.arcBelow!.mainCircleEvents.length).toBe(0);

        var circleEvent2 = Fortune.checkArcForCircleEvent(insertionResults.arcBelow!.leftBreakpoint!.leftArc);
        expect(circleEvent2 !== null).toBe(true);
        expect(circleEvent2!.center.equals(new Vector(120,120))).toBe(true);
        expect(circleEvent2!.location.equals(new Vector(120,120 - radius))).toBe(true);

        Fortune.deleteArc(circleEvent1!);
        beachLine = Fortune.beachLine.inorderList();
        expect(beachLine.length).toBe(4);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.leftArc!.face!.center!.equals(eventLocations[0])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.rightArc!.face!.center!.equals(eventLocations[2])).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[0] instanceof FortuneBreakpoint && beachLine[1].leftArc === beachLine[0].rightArc).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[1]!.rightArc!.face!.center!.equals(eventLocations[1])).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[2] instanceof FortuneBreakpoint && beachLine[2].leftArc === beachLine[1].rightArc).toBe(true);
        expect(beachLine[2] instanceof FortuneBreakpoint && beachLine[2]!.rightArc!.face!.center!.equals(eventLocations[3])).toBe(true);
        expect(beachLine[2] instanceof FortuneBreakpoint && beachLine[3] instanceof FortuneBreakpoint && beachLine[3].leftArc === beachLine[2].rightArc).toBe(true);
        expect(beachLine[3] instanceof FortuneBreakpoint && beachLine[3]!.rightArc!.face!.center!.equals(eventLocations[1])).toBe(true);

        var circleEvent3 = Fortune.checkArcForCircleEvent(circleEvent2!.arc!.leftBreakpoint!.leftArc);
        expect(circleEvent3 === null).toBe(true);

        var circleEvent4 = Fortune.checkArcForCircleEvent(circleEvent2!.arc!.rightBreakpoint!.rightArc);
        expect(circleEvent4 !== null).toBe(true);
        expect(circleEvent4!.center.equals(new Vector(120,120))).toBe(true);
        expect(circleEvent4!.location.equals(new Vector(120,120 - radius))).toBe(true);

        Fortune.deleteArc(circleEvent4!);
        beachLine = Fortune.beachLine.inorderList();
        expect(beachLine.length).toBe(3);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.leftArc!.face!.center!.equals(eventLocations[0])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[0]!.rightArc!.face!.center!.equals(eventLocations[2])).toBe(true);
        expect(beachLine[0] instanceof FortuneBreakpoint && beachLine[1] instanceof FortuneBreakpoint && beachLine[1].leftArc === beachLine[0].rightArc).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[1]!.rightArc!.face!.center!.equals(eventLocations[3])).toBe(true);
        expect(beachLine[1] instanceof FortuneBreakpoint && beachLine[2] instanceof FortuneBreakpoint && beachLine[2].leftArc === beachLine[1].rightArc).toBe(true);
        expect(beachLine[2] instanceof FortuneBreakpoint && beachLine[2]!.rightArc!.face!.center!.equals(eventLocations[1])).toBe(true);

        var circleEvent5 = Fortune.checkArcForCircleEvent(circleEvent4!.arc!.leftBreakpoint!.leftArc);
        expect(circleEvent5 === null).toBe(true);

        var circleEvent6 = Fortune.checkArcForCircleEvent(circleEvent4!.arc!.rightBreakpoint!.rightArc);
        expect(circleEvent6 === null).toBe(true);
    });

    it('computes the closest point Voronoi diagram of a diamond', () => {
        const points = [
            new Vector(120, 20),
            new Vector(20, 120),
            new Vector(220, 120),
            new Vector(120, 220),
        ];

        const fortuneResults = Fortune.computeVoronoiDiagram(points);
        const voronoi = fortuneResults.voronoiDiagram;
        const voronoiLines = voronoi.getLineSegments();

        const rect = new Rectangle(0, 0, 240, 240);
        const voronoiLinesCropped = voronoiLines.map((ls) => rect.cropLineSegment(ls)!.sortedEndpoints());

        const expVoronoiMin = [
            new LineSegment(new Vector(0, 0), new Vector(120, 120)),
            new LineSegment(new Vector(240, 0), new Vector(120, 120)),
            new LineSegment(new Vector(0, 240), new Vector(120, 120)),
            new LineSegment(new Vector(240, 240), new Vector(120, 120)),
        ].map((ls) => ls.sortedEndpoints());

        expect(arrayFunctions.compare(voronoiLinesCropped, expVoronoiMin, false)).toBe(0);
    });

    it('computes the closest point voronoi diagram of a diamond with a point in the middle', function() {
        var points = [];
        points.push(new Vector(120,20));
        points.push(new Vector(20,120));
        points.push(new Vector(120,120));
        points.push(new Vector(220,120));
        points.push(new Vector(120,220));

        var fortuneResults = Fortune.computeVoronoiDiagram(points);
        var voronoi = fortuneResults.voronoiDiagram;
        var voronoiLines = voronoi.getLineSegments();

        var rect = new Rectangle(0, 0, 240, 240);
        var voronoiLinesCropped = voronoiLines.map(function(ls) {return rect.cropLineSegment(ls)!.sortedEndpoints()});

        var expVoronoiMin = [];
        expVoronoiMin.push(new LineSegment(new Vector(0,0), new Vector(70,70)));
        expVoronoiMin.push(new LineSegment(new Vector(240,0), new Vector(170,70)));
        expVoronoiMin.push(new LineSegment(new Vector(0,240), new Vector(70,170)));
        expVoronoiMin.push(new LineSegment(new Vector(240,240), new Vector(170,170)));
        expVoronoiMin.push(new LineSegment(new Vector(70,70), new Vector(170,70)));
        expVoronoiMin.push(new LineSegment(new Vector(70,70), new Vector(70,170)));
        expVoronoiMin.push(new LineSegment(new Vector(70,170), new Vector(170,170)));
        expVoronoiMin.push(new LineSegment(new Vector(170,170), new Vector(170,70)));

        expVoronoiMin = expVoronoiMin.map(function(ls) {return ls.sortedEndpoints()});

        expect(arrayFunctions.compare(voronoiLinesCropped, expVoronoiMin, false)).toBe(0);
    });

    it('computes the closest point voronoi diagram of a square', function() {
        var points = [];
        points.push(new Vector(20,20));
        points.push(new Vector(220,20));
        points.push(new Vector(220,220));
        points.push(new Vector(20,220));

        var fortuneResults = Fortune.computeVoronoiDiagram(points);
        var voronoi = fortuneResults.voronoiDiagram;
        var voronoiLines = voronoi.getLineSegments();

        var rect = new Rectangle(0, 0, 240, 240);
        var voronoiLinesCropped = voronoiLines.map(function(ls) {return rect.cropLineSegment(ls)!.sortedEndpoints()});

        var expVoronoiMin = [];
        expVoronoiMin.push(new LineSegment(new Vector(120,0), new Vector(120,120)));
        expVoronoiMin.push(new LineSegment(new Vector(0,120), new Vector(120,120)));
        expVoronoiMin.push(new LineSegment(new Vector(120,240), new Vector(120,120)));
        expVoronoiMin.push(new LineSegment(new Vector(240,120), new Vector(120,120)));

        expVoronoiMin = expVoronoiMin.map(function(ls) {return ls.sortedEndpoints()});

        expect(arrayFunctions.compare(voronoiLinesCropped, expVoronoiMin, false)).toBe(0);
    });

    it('computes the closest point voronoi diagram of a square with a point in the middle', function() {
        var points = [];
        points.push(new Vector(20,20));
        points.push(new Vector(220,20));
        points.push(new Vector(220,220));
        points.push(new Vector(20,220));
        points.push(new Vector(120,120));

        var fortuneResults = Fortune.computeVoronoiDiagram(points);
        var voronoi = fortuneResults.voronoiDiagram;
        var voronoiLines = voronoi.getLineSegments();

        var rect = new Rectangle(0, 0, 240, 240);
        var voronoiLinesCropped = voronoiLines.map(function(ls) {return rect.cropLineSegment(ls)!.sortedEndpoints()});

        var expVoronoiMin = [];
        expVoronoiMin.push(new LineSegment(new Vector(120,0), new Vector(120,20)));
        expVoronoiMin.push(new LineSegment(new Vector(0,120), new Vector(20,120)));
        expVoronoiMin.push(new LineSegment(new Vector(120,240), new Vector(120,220)));
        expVoronoiMin.push(new LineSegment(new Vector(220,120), new Vector(240,120)));
        expVoronoiMin.push(new LineSegment(new Vector(120,20), new Vector(220,120)));
        expVoronoiMin.push(new LineSegment(new Vector(220,120), new Vector(120,220)));
        expVoronoiMin.push(new LineSegment(new Vector(120,220), new Vector(20,120)));
        expVoronoiMin.push(new LineSegment(new Vector(20,120), new Vector(120,20)));

        expVoronoiMin = expVoronoiMin.map(function(ls) {return ls.sortedEndpoints()});

        expect(arrayFunctions.compare(voronoiLinesCropped, expVoronoiMin, false)).toBe(0);
    });

    it('computes the closest point closest of a set of points in a straight horizontal line', function() {
        var points = [];
        points.push(new Vector(20,120));
        points.push(new Vector(120,120));
        points.push(new Vector(220,120));

        var fortuneResults = Fortune.computeVoronoiDiagram(points);
        var voronoi = fortuneResults.voronoiDiagram;
        var voronoiLines = voronoi.getLineSegments();

        var rect = new Rectangle(0, 0, 240, 240);
        var voronoiLinesCropped = voronoiLines.map(function(ls) {return rect.cropLineSegment(ls)!.sortedEndpoints()});

        var expVoronoiMin = [];
        expVoronoiMin.push(new LineSegment(new Vector(70,0), new Vector(70,240)));
        expVoronoiMin.push(new LineSegment(new Vector(170,0), new Vector(170,240)));

        expVoronoiMin = expVoronoiMin.map(function(ls) {return ls.sortedEndpoints()});

        expect(arrayFunctions.compare(voronoiLinesCropped, expVoronoiMin, false)).toBe(0);
    });
});

describe('FortuneArc', () => {
    it('represents a parabolic arc in the beach line', () => {
        var face = new Face();
        face.center = new Vector(1, 2);
        var arc = new FortuneArc(face);
        var y = arc.getY(1, 2);
        expect(y).toBe(2);

        face = new Face();
        face.center = new Vector(0, 0.25);
        arc = new FortuneArc(face);
        y = arc.getY(0, -0.25);
        expect(comparator.compareWithTolerance(y, 0)).toBe(0);
        y = arc.getY(1, -0.25);
        expect(comparator.compareWithTolerance(y, 1)).toBe(0);
        y = arc.getY(-1, -0.25);
        expect(comparator.compareWithTolerance(y, 1)).toBe(0);
        y = arc.getY(2, -0.25);
        expect(comparator.compareWithTolerance(y, 4)).toBe(0);
    });

    it('gives a bezier representation of itself', () => {
        const face = new Face();
        face.center = new Vector(0, 0.25);
        const arc = new FortuneArc(face);

        const bezier = arc.toBezier(-1, 1, -0.25);
        expect(bezier!.start.equals(new Vector(-1, 1))).toBe(true);
        expect(bezier!.end.equals(new Vector(1, 1))).toBe(true);
        expect(bezier!.controlPoints.length).toBe(1);
        expect(bezier!.controlPoints[0].equals(new Vector(0, -1))).toBe(true);
    });
});

describe('FortuneBreakpoint', () => {
    it('represents an only breakpoint of two arcs with same y coordinate in negative y direction', function () {
        var face = new Face();
        face.center = new Vector(-1, 0.25);
        var leftArc = new FortuneArc(face);
        face = new Face();
        face.center = new Vector(1, 0.25);
        var rightArc = new FortuneArc(face);
        var negativeBreakpoint = new FortuneBreakpoint(leftArc, rightArc);

        expect(negativeBreakpoint.isOnlyBreakpoint()).toBe(true);

        var location = negativeBreakpoint.getLocation(-0.25);
        expect(location.equals(new Vector(0, 1))).toBe(true);

        var origin = negativeBreakpoint.getOrigin();
        expect(origin.equals(new Vector(0,0.25))).toBe(true);

        var direction = negativeBreakpoint.getDirection();
        expect(direction.equals(new Vector(0,-1))).toBe(true);
    });

    it('represents an only breakpoint of two arcs with same y coordinate moving in positive y direction', function () {
        var face = new Face();
        face.center = new Vector(-1, 0.25);
        var leftArc = new FortuneArc(face);
        face = new Face();
        face.center = new Vector(1, 0.25);
        var rightArc = new FortuneArc(face);
        var positiveBreakpoint = new FortuneBreakpoint(rightArc, leftArc);

        expect(positiveBreakpoint.isOnlyBreakpoint()).toBe(true);

        var location = positiveBreakpoint.getLocation(-0.25);
        expect(location.equals(new Vector(0, 1))).toBe(true);

        var origin = positiveBreakpoint.getOrigin();
        expect(origin.equals(new Vector(0,0.25))).toBe(true);

        var direction = positiveBreakpoint.getDirection();
        expect(direction.equals(new Vector(0,1))).toBe(true);
    });

    it('represents a breakpoint of two arcs with same x coordinate moving in positive x direction', function () {
        var face = new Face();
        face.center = new Vector(0,1);
        var upperArc = new FortuneArc(face);
        face = new Face();
        face.center = new Vector(0,2);
        var lowerArc = new FortuneArc(face);
        var positiveBreakpoint = new FortuneBreakpoint(upperArc, lowerArc);

        expect(positiveBreakpoint.isOnlyBreakpoint()).toBe(false);

        var origin = positiveBreakpoint.getOrigin();
        expect(origin.equals(new Vector(0, 1.5))).toBe(true);

        var direction = positiveBreakpoint.getDirection();
        expect(direction.equals(new Vector(1,0))).toBe(true);
    });

    it('represents a breakpoint of two arcs with same x coordinate moving in negative x direction', function () {
        var face = new Face();
        face.center = new Vector(0,1);
        var upperArc = new FortuneArc(face);
        face = new Face();
        face.center = new Vector(0,2);
        var lowerArc = new FortuneArc(face);
        var negativeBreakpoint = new FortuneBreakpoint(lowerArc, upperArc);

        expect(negativeBreakpoint.isOnlyBreakpoint()).toBe(false);

        var origin = negativeBreakpoint.getOrigin();
        expect(origin.equals(new Vector(0, 1.5))).toBe(true);

        var direction = negativeBreakpoint.getDirection();
        expect(direction.equals(new Vector(-1,0))).toBe(true);
    });

    it('represents a breakpoint of two parabolic arcs in the beach line moving in positive x direction', function () {
        var face = new Face();
        face.center = new Vector(-1,2);
        var lowerArc = new FortuneArc(face);
        face = new Face();
        face.center = new Vector(1,1);
        var upperArc = new FortuneArc(face);
        var positiveBreakpoint = new FortuneBreakpoint(upperArc, lowerArc);

        expect(positiveBreakpoint.isOnlyBreakpoint()).toBe(false);

        var origin = positiveBreakpoint.getOrigin();
        expect(origin.equals(new Vector(0, 1.5))).toBe(true);

        var directionEstimate = new Vector(1, 2);
        directionEstimate = directionEstimate.normalize();
        var direction = positiveBreakpoint.getDirection();
        expect(direction.equals(directionEstimate)).toBe(true);
    });

    it('represents a breakpoint of two parabolic arcs in the beach line moving in negative x direction', function () {
        var face = new Face();
        face.center = new Vector(-1,2);
        var lowerArc = new FortuneArc(face);
        face = new Face();
        face.center = new Vector(1,1);
        var upperArc = new FortuneArc(face);
        var negativeBreakpoint = new FortuneBreakpoint(lowerArc, upperArc);

        expect(negativeBreakpoint.isOnlyBreakpoint()).toBe(false);

        var origin = negativeBreakpoint.getOrigin();
        expect(origin.equals(new Vector(0, 1.5))).toBe(true);

        var directionEstimate = new Vector(-1, -2);
        directionEstimate = directionEstimate.normalize();
        var direction = negativeBreakpoint.getDirection();
        expect(direction.equals(directionEstimate)).toBe(true);
    });
});