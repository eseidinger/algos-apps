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

'use strict';

import { Vector } from '../geom/vector';
import { Bezier } from '../geom/bezier';
import { Line } from '../geom/line';
import { Triangle } from '../geom/triangle';
import { HalfEdge, EdgeList, Face, Vertex } from '../ds/dcel';
import { Tree } from '../ds/tree';
import comparator from '../util/comparator';
import constant from '../util/constant';

/**
 * A parabolic arc in a beach line.
 */
export class FortuneArc {
    public face: Face;
    public leftBreakpoint: FortuneBreakpoint | null = null;
    public rightBreakpoint: FortuneBreakpoint | null = null;
    public mainCircleEvents: FortuneCircleEvent[] = [];
    public circleEvents: FortuneCircleEvent[] = [];

    /**
     * Constructor for the FortuneArc class.
     *
     * @param face - The face in the Voronoi diagram
     */
    constructor(face: Face) {
        this.face = face;
    }

    /**
     * Get the y-coordinate of the arc given an x-coordinate and the y position of the sweep line.
     *
     * @param x - The x-coordinate
     * @param ly - The y position of the sweep line
     * @returns The y-coordinate
     */
    public getY(x: number, ly: number): number {
        const px = this.face.center!.x;
        const py = this.face.center!.y;
        const num = x * x - 2 * px * x + px * px + py * py - ly * ly;
        const denom = 2 * (py - ly);
        if (comparator.compareWithTolerance(py, ly) !== 0) {
            return num / denom;
        } else {
            return py;
        }
    }

    /**
     * Creates a Bezier curve from this arc.
     *
     * @param xMin - The x-coordinate of the starting point
     * @param xMax - The x-coordinate of the end point
     * @param ly - The y position of the sweep line
     * @returns A Bezier curve or null
     */
    public toBezier(xMin: number, xMax: number, ly: number): Bezier | null {
        const start = new Vector(xMin, this.getY(xMin, ly));
        const end = new Vector(xMax, this.getY(xMax, ly));

        const dir1 = new Vector(1, (xMin - this.face.center!.x) / (this.face.center!.y - ly));
        const dir2 = new Vector(1, (xMax - this.face.center!.x) / (this.face.center!.y - ly));

        const line1 = new Line(start, dir1);
        const line2 = new Line(end, dir2);

        const control = line1.getIntersection(line2);

        if (control !== null) {
            return new Bezier(start, end, [control]);
        } else {
            return null;
        }
    }

    public getLocation(): Vector {
        return this.face.center!;
    }
}

/**
 * Breakpoint of two arcs in the beach line.
 */
export class FortuneBreakpoint {
    private static breakpointCount = 0;

    private serial: number;
    public leftArc: FortuneArc;
    public rightArc: FortuneArc;
    public halfEdge: HalfEdge | null = null;

    /**
     * Constructor for the FortuneBreakpoint class.
     *
     * @param leftArc - The left arc
     * @param rightArc - The right arc
     */
    constructor(leftArc: FortuneArc, rightArc: FortuneArc) {
        this.serial = FortuneBreakpoint.breakpointCount++;
        this.leftArc = leftArc;
        this.rightArc = rightArc;
    }

    /**
     * Checks if this is the only breakpoint.
     *
     * @returns True if this is the only breakpoint, false otherwise
     */
    public isOnlyBreakpoint(): boolean {
        return (
            comparator.compareWithTolerance(
                this.leftArc.face.center!.y,
                this.rightArc.face.center!.y
            ) === 0
        );
    }

    /**
     * Returns the location of the breakpoint given the y position of the sweep line.
     *
     * @param ly - The y position of the sweep line
     * @returns The position of the breakpoint
     */
    public getLocation(ly: number): Vector {
        const pix = this.rightArc.face.center!.x;
        const piy = this.rightArc.face.center!.y;
        const pjx = this.leftArc.face.center!.x;
        const pjy = this.leftArc.face.center!.y;

        const a = pjy - piy;
        const b = 2 * (pjx * (piy - ly) - pix * (pjy - ly));
        const c =
            (pjy - ly) * (pix * pix + piy * piy - ly * ly) -
            (piy - ly) * (pjx * pjx + pjy * pjy - ly * ly);

        let x: number;
        if (comparator.compareWithTolerance(pjy, piy) === 0) {
            x = (pix + pjx) / 2;
        } else {
            const x1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
            const x2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
            if (this.getDirection().x <= 0) {
                x = Math.min(x1, x2);
            } else {
                x = Math.max(x1, x2);
            }
        }
        const y = this.rightArc.getY(x, ly);
        return new Vector(x, y);
    }

    /**
     * Get the origin of the breakpoint.
     *
     * @private
     * @returns The origin of the breakpoint
     */
    public getOrigin(): Vector {
        return this.rightArc.face.center!.add(this.leftArc.face.center!).multiplyScalar(0.5);
    }

    /**
     * Get the direction of this breakpoint with decreasing y coordinate of the sweep line.
     *
     * @private
     * @returns The direction of the breakpoint
     */
    public getDirection(): Vector {
        return this.leftArc.face.center!
            .sub(this.rightArc.face.center!)
            .rotate(Math.PI / 2)
            .normalize();
    }

    /**
     * Calculate the origin of this breakpoint's half edge.
     */
    public calcHalfEdgeOrigin(): void {
        this.halfEdge!.origin = new Vertex();
        this.halfEdge!.origin.coordinates = this.getOrigin().add(
            this.getDirection().multiplyScalar(constant.INFINITY)
        );
        this.halfEdge!.twin!.origin = new Vertex();
        this.halfEdge!.twin!.origin.coordinates = this.getOrigin().add(
            this.getDirection().multiplyScalar(-constant.INFINITY)
        );
    }

    /**
     * Compare this breakpoint to another breakpoint's x location at a given sweep line position.
     *
     * @param breakpoint - The other breakpoint
     * @param ly - The y position of the sweep line
     * @returns The order of the compared breakpoints
     */
    public compareTo(breakpoint: FortuneBreakpoint, ly: number): number {
        if (this.leftArc === breakpoint.leftArc && this.rightArc === breakpoint.rightArc) {
            return 0;
        }
        if (this.rightArc === breakpoint.leftArc) {
            return -1;
        }
        if (this.leftArc === breakpoint.rightArc) {
            return 1;
        }
        const comp = comparator.compareWithTolerance(
            this.getLocation(ly).x,
            breakpoint.getLocation(ly).x
        );
        if (comp === 0) {
            const dir1 = this.getDirection();
            const dir2 = breakpoint.getDirection();
            const xSpeed1 = this.calculateXSpeed(dir1);
            const xSpeed2 = this.calculateXSpeed(dir2);
            const speedComp = comparator.compareWithTolerance(xSpeed1, xSpeed2);
            const xSign1 = comparator.compareWithTolerance(xSpeed1, 0);
            const xSign2 = comparator.compareWithTolerance(xSpeed2, 0);

            if (xSign1 !== xSign2) {
                return xSign1 === 1 || xSign2 === -1 ? -1 : 1;
            } else if (speedComp !== 0) {
                return xSign1 === -1 ? speedComp : -speedComp;
            } else {
                return comparator.compare(this.serial, breakpoint.serial);
            }
        } else {
            return comp;
        }
    }

    /**
     * Calculate the x-speed of a direction vector.
     *
     * @private
     * @param dir - The direction vector
     * @returns The x-speed
     */
    private calculateXSpeed(dir: Vector): number {
        if (this.isOnlyBreakpoint()) {
            return 0;
        } else if (comparator.compareWithTolerance(dir.y, 0) === 0) {
            return comparator.sign(dir.x) * constant.INFINITY;
        } else {
            return dir.x / -dir.y;
        }
    }
}

/**
 * Base class for events in Fortune's algorithm.
 */
export abstract class FortuneEvent {
    public location: Vector;
    public serial: number;

    constructor(location: Vector) {
        this.location = location;
        this.serial = Fortune.eventCount++;
    }

    /**
     * Checks if this event is a site event.
     *
     * @returns True if this is a site event, false otherwise
     */
    public isSiteEvent(): boolean {
        return this instanceof FortuneSiteEvent;
    }

    /**
     * Checks if this event is a circle event.
     *
     * @returns True if this is a circle event, false otherwise
     */
    public isCircleEvent(): boolean {
        return this instanceof FortuneCircleEvent;
    }

    /**
     * Compares two Fortune events according to their location's coordinates.
     *
     * @param event - The event to compare with
     * @returns The comparison result
     */
    public compareTo(event: FortuneEvent): number {
        return FortuneEvent.compare(this, event);
    }

    /**
     * Compares two Fortune events according to their location's coordinates.
     *
     * @param e1 - The first event
     * @param e2 - The second event
     * @returns The comparison result
     */
    public static compare(e1: FortuneEvent, e2: FortuneEvent): number {
        if (e1 === e2) {
            return 0;
        }
        const yComp = comparator.compareWithTolerance(e1.location.y, e2.location.y);
        if (yComp === 0) {
            const xComp = comparator.compareWithTolerance(e1.location.x, e2.location.x);
            if (e1.isCircleEvent() && e2.isCircleEvent()) {
                if (xComp !== 0) {
                    return xComp;
                } else {
                    return comparator.compare(e1.serial, e2.serial);
                }
            } else if (e1.isCircleEvent()) {
                return -1;
            } else if (e2.isCircleEvent()) {
                return 1;
            } else if (xComp !== 0) {
                return xComp;
            } else {
                return comparator.compare(e1.serial, e2.serial);
            }
        } else {
            return -yComp;
        }
    }

    /**
     * Abstract method to handle the event.
     */
    public abstract handle(): void;
}

/**
 * A site event in Fortune's algorithm.
 */
export class FortuneSiteEvent extends FortuneEvent {
    constructor(location: Vector) {
        super(location);
    }

    /**
     * Handle site event.
     */
    public handle(): void {
        const insertionResults = Fortune.insertArc(this.location);

        if (insertionResults.arcAbove !== null) {
            insertionResults.arcBelow!.mainCircleEvents.forEach((circleEvent) => {
                Fortune.eventQueue.deleteElement(circleEvent);
            });

            let circleEvent = Fortune.checkArcForCircleEvent(
                insertionResults.arcAbove.leftBreakpoint!.leftArc
            );
            if (circleEvent !== null) {
                Fortune.eventQueue.insert(circleEvent);
            }
            if (insertionResults.arcAbove.rightBreakpoint !== null) {
                circleEvent = Fortune.checkArcForCircleEvent(
                    insertionResults.arcAbove.rightBreakpoint.rightArc
                );
                if (circleEvent !== null) {
                    Fortune.eventQueue.insert(circleEvent);
                }
            }
        }
    }
}

/**
 * A circle event in Fortune's algorithm.
 */
export class FortuneCircleEvent extends FortuneEvent {
    public arc: FortuneArc;
    public center: Vector;

    constructor(location: Vector, arc: FortuneArc, center: Vector) {
        super(location);
        this.arc = arc;
        this.center = center;
    }

    /**
     * Handle circle event.
     */
    public handle(): void {
        Fortune.deleteArc(this);

        this.arc.mainCircleEvents.forEach((circleEvent) => {
            Fortune.eventQueue.deleteElement(circleEvent);
        });
        this.arc.circleEvents.forEach((circleEvent) => {
            Fortune.eventQueue.deleteElement(circleEvent);
        });

        let circleEvent = Fortune.checkArcForCircleEvent(this.arc.leftBreakpoint!.leftArc);
        if (circleEvent !== null) {
            Fortune.eventQueue.insert(circleEvent);
        }
        circleEvent = Fortune.checkArcForCircleEvent(this.arc.rightBreakpoint!.rightArc);
        if (circleEvent !== null) {
            Fortune.eventQueue.insert(circleEvent);
        }
    }
}


export class Fortune {
    public static eventCount: number = 0;
    public static eventQueue: Tree<FortuneEvent> = new Tree<FortuneEvent>();
    private static breakpointCount: number = 0;
    public static beachLine: Tree<FortuneArc | FortuneBreakpoint> = new Tree<FortuneArc | FortuneBreakpoint>();
    private static voronoiDiagram: EdgeList = new EdgeList();

    /**
     * Initialize variables for Fortune's algorithm.
     */
    public static init(): void {
        Fortune.eventCount = 0;
        Fortune.eventQueue = new Tree<FortuneEvent>();
        Fortune.breakpointCount = 0;
        Fortune.beachLine = new Tree<FortuneArc>();
        Fortune.voronoiDiagram = new EdgeList();
    }

    /**
     * Compute the closest point Voronoi diagram.
     *
     * @param points - Array of points
     * @param minY - Minimum y position of the sweep line
     * @returns The Voronoi diagram and construction beach line
     */
    public static computeVoronoiDiagram(
        points: Vector[],
        minY: number = 0
    ): { voronoiDiagram: EdgeList; constructionBeachLine: Array<FortuneBreakpoint | FortuneArc> } {
        Fortune.init();

        points.forEach((p) => {
            Fortune.eventQueue.insert(new FortuneSiteEvent(p));
        });

        const constructionBeachLine: Array<FortuneBreakpoint | FortuneArc> = [];
        while (!Fortune.eventQueue.isEmpty()) {
            const currentEvent = Fortune.eventQueue.deleteMin()!;
            currentEvent.handle();
            if (comparator.compareWithTolerance(currentEvent.location.y, minY) === 1) {
                constructionBeachLine.push(...Fortune.beachLine.inorderList());
            }
        }

        Fortune.voronoiDiagram.removeZeroLengthEdges();
        return { voronoiDiagram: Fortune.voronoiDiagram, constructionBeachLine };
    }

    /**
     * Check an arc and its left and right neighbors for a circle event.
     *
     * @param arc - The arc to check
     * @returns A circle event or null
     */
    public static checkArcForCircleEvent(arc: FortuneArc): FortuneCircleEvent | null {
        if (arc.leftBreakpoint !== null && arc.rightBreakpoint !== null) {
            const det = Vector.calcDet(
                arc.leftBreakpoint.leftArc.face.center!,
                arc.face.center!,
                arc.rightBreakpoint.rightArc.face.center!
            );

            if (comparator.compareWithTolerance(det, 0) >= 0) {
                return null;
            }

            const triangle = new Triangle(
                arc.leftBreakpoint.leftArc.face.center!,
                arc.face.center!,
                arc.rightBreakpoint.rightArc.face.center!
            );
            const circle = triangle.getCircumcircle();
            const circleEventLoc = new Vector(circle.center.x, circle.center.y - circle.radius);
            const circleEvent = new FortuneCircleEvent(circleEventLoc, arc, circle.center);

            arc.mainCircleEvents.push(circleEvent);
            arc.leftBreakpoint.leftArc.circleEvents.push(circleEvent);
            arc.rightBreakpoint.rightArc.circleEvents.push(circleEvent);

            return circleEvent;
        }
        return null;
    }

    /**
     * Get the arc below a site event.
     *
     * @param eventLocation - The location of the site event
     * @returns The arc below the site event
     */
    private static getArcBelowEvent(eventLocation: Vector): FortuneArc | null {
        if (Fortune.beachLine.root?.content instanceof FortuneArc) {
            const result = Fortune.beachLine.root.content;
            Fortune.beachLine.root = null;
            return result;
        }

        const breakpoint = Fortune.beachLine.getClosestAny(eventLocation, (loc, bp) =>
            comparator.compareWithTolerance(loc.x, bp.getLocation(loc.y).x)
        );
        if (breakpoint !== null && breakpoint instanceof FortuneBreakpoint) {
            if (
                comparator.compareWithTolerance(
                    eventLocation.x,
                    breakpoint!.getLocation(eventLocation.y).x
                ) !== 1
            ) {
                return breakpoint!.leftArc;
            } else {
                return breakpoint!.rightArc;
            }            
        }
        return null;
    }

    /**
     * Insert a new arc into the beach line because of a site event.
     *
     * @param eventLocation - The location of the site event
     * @returns The arcs to check for circle events
     */
    public static insertArc(eventLocation: Vector): {
        arcBelow: FortuneArc | null;
        arcAbove: FortuneArc | null;
    } {
        const faceAbove = Fortune.voronoiDiagram.getNewFace();
        faceAbove.center = eventLocation;
        const arcAbove = new FortuneArc(faceAbove);

        if (Fortune.beachLine.isEmpty()) {
            Fortune.beachLine.insert(arcAbove);
            return { arcBelow: null, arcAbove: null };
        }

        const arcBelow = this.getArcBelowEvent(eventLocation);
        const faceBelow = arcBelow!.face;
        const halfEdge = Fortune.voronoiDiagram.getNewHalfEdgePair();

        halfEdge.incidentFace = faceAbove;
        faceAbove.outerComponent = halfEdge;

        halfEdge.twin!.incidentFace = faceBelow;
        if (faceBelow.outerComponent === null) {
            faceBelow.outerComponent = halfEdge.twin;
        }

        const leftArc = new FortuneArc(faceBelow);
        const rightArc = new FortuneArc(faceBelow);

        const leftBreakpoint = new FortuneBreakpoint(leftArc, arcAbove);
        leftBreakpoint.halfEdge = halfEdge.twin;
        leftBreakpoint.calcHalfEdgeOrigin();

        arcAbove.leftBreakpoint = leftBreakpoint;
        leftArc.rightBreakpoint = leftBreakpoint;
        leftArc.leftBreakpoint = arcBelow!.leftBreakpoint;

        if (arcBelow!.leftBreakpoint !== null) {
            arcBelow!.leftBreakpoint.rightArc = leftArc;
        }

        Fortune.beachLine.insert(leftBreakpoint, (bp1, bp2) =>
            bp1 instanceof FortuneBreakpoint && bp2 instanceof FortuneBreakpoint ? bp1.compareTo(bp2, eventLocation.y) : 0
        );

        if (!leftBreakpoint.isOnlyBreakpoint()) {
            const rightBreakpoint = new FortuneBreakpoint(arcAbove, rightArc);
            rightBreakpoint.halfEdge = halfEdge;
            rightBreakpoint.calcHalfEdgeOrigin();

            arcAbove.rightBreakpoint = rightBreakpoint;
            rightArc.leftBreakpoint = rightBreakpoint;
            rightArc.rightBreakpoint = arcBelow!.rightBreakpoint;

            if (arcBelow!.rightBreakpoint !== null) {
                arcBelow!.rightBreakpoint.leftArc = rightArc;
            }

            Fortune.beachLine.insert(rightBreakpoint, (bp1, bp2) =>
                bp1 instanceof FortuneBreakpoint && bp2 instanceof FortuneBreakpoint ? bp1.compareTo(bp2, eventLocation.y) : 0
            );
        }

        return { arcBelow, arcAbove };
    }

    /**
     * Remove an arc and one of its breakpoints because of a circle event.
     *
     * @param event - The circle event
     */
    public static deleteArc(event: FortuneCircleEvent): void {
        Fortune.beachLine.deleteElement(event.arc.leftBreakpoint!, (bp1, bp2) =>
            bp1 instanceof FortuneBreakpoint && bp2 instanceof FortuneBreakpoint ? bp1.compareTo(bp2, event.location.y) : 0
        );
        Fortune.beachLine.deleteElement(event.arc.rightBreakpoint!, (bp1, bp2) =>
            bp1 instanceof FortuneBreakpoint && bp2 instanceof FortuneBreakpoint ? bp1.compareTo(bp2, event.location.y) : 0
        );

        const newBreakpoint = new FortuneBreakpoint(
            event.arc.leftBreakpoint!.leftArc,
            event.arc.rightBreakpoint!.rightArc
        );
        event.arc.leftBreakpoint!.leftArc.rightBreakpoint = newBreakpoint;
        event.arc.rightBreakpoint!.rightArc.leftBreakpoint = newBreakpoint;

        Fortune.beachLine.insert(newBreakpoint, (bp1, bp2) =>
            bp1 instanceof FortuneBreakpoint && bp2 instanceof FortuneBreakpoint ? bp1.compareTo(bp2, event.location.y) : 0
        );

        Fortune.createPartialEdgeListForCircleEvent(
            event.center,
            event.arc.leftBreakpoint!,
            event.arc.rightBreakpoint!,
            newBreakpoint
        );
    }

    /**
     * Update Voronoi diagram because of a circle event.
     *
     * @param vertexLocation - The location of the vertex
     * @param leftBreakpoint - The left breakpoint
     * @param rightBreakpoint - The right breakpoint
     * @param newBreakpoint - The new breakpoint
     */
    private static createPartialEdgeListForCircleEvent(
        vertexLocation: Vector,
        leftBreakpoint: FortuneBreakpoint,
        rightBreakpoint: FortuneBreakpoint,
        newBreakpoint: FortuneBreakpoint
    ): void {
        const vertex = Fortune.voronoiDiagram.getNewVertex();
        const newHalfEdge = Fortune.voronoiDiagram.getNewHalfEdgePair();
        newHalfEdge.origin = vertex;
        newBreakpoint.halfEdge = newHalfEdge.twin;
        newBreakpoint.calcHalfEdgeOrigin();

        const leftHalfEdge = leftBreakpoint.halfEdge!;
        const rightHalfEdge = rightBreakpoint.halfEdge!;

        leftHalfEdge.origin!.coordinates = vertexLocation;
        rightHalfEdge.origin!.coordinates = vertexLocation;
        newHalfEdge.origin!.coordinates = vertexLocation;

        vertex.incidentEdge = newHalfEdge;

        leftHalfEdge.setPrev(newHalfEdge.twin!);
        leftHalfEdge.twin!.setNext(rightHalfEdge);
        rightHalfEdge.twin!.setNext(newHalfEdge);

        newHalfEdge.incidentFace = rightHalfEdge.twin!.incidentFace;
        newHalfEdge.twin!.incidentFace = leftHalfEdge.incidentFace;
    }
}
