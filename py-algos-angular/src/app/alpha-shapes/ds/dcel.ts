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

/**
 * A doubly connected edge list (DCEL).
 */
export class EdgeList {
    public vertices: Vertex[] = [];
    public faces: Face[] = [];
    public halfEdges: HalfEdge[] = [];

    /**
     * Creates a new face, adds it to the face array, and returns a reference.
     *
     * @returns The newly created face
     */
    public getNewFace(): Face {
        const face = new Face();
        this.faces.push(face);
        return face;
    }

    /**
     * Creates a new half edge, adds it to the array, and returns a reference.
     *
     * @returns The newly created half edge
     */
    public getNewHalfEdge(): HalfEdge {
        const halfEdge = new HalfEdge();
        this.halfEdges.push(halfEdge);
        return halfEdge;
    }

    /**
     * Creates a new half edge and its twin, adds them to the array, and returns a reference.
     *
     * @returns The newly created half edge containing a newly created twin
     */
    public getNewHalfEdgePair(): HalfEdge {
        const halfEdge = this.getNewHalfEdge();
        const twin = this.getNewHalfEdge();
        halfEdge.twin = twin;
        twin.twin = halfEdge;
        return halfEdge;
    }

    /**
     * Creates a new vertex, adds it to the array, and returns a reference.
     *
     * @returns The newly created vertex
     */
    public getNewVertex(): Vertex {
        const vertex = new Vertex();
        this.vertices.push(vertex);
        return vertex;
    }

    /**
     * Searches for a face with a given center.
     *
     * @param center - The center of the face
     * @returns The face with the given center, or null if not found
     */
    public getFace(center: Vector): Face | null {
        return this.faces.find((face) => face.center ? center.equals(face.center) : false) || null;
    }

    /**
     * Searches for a vertex with given coordinates.
     *
     * @param coord - The coordinates of the vertex
     * @returns The vertex with the given coordinates, or null if not found
     */
    public getVertex(coord: Vector): Vertex | null {
        return this.vertices.find((vertex) => vertex.coordinates ? coord.equals(vertex.coordinates) : false) || null;
    }

    /**
     * Searches for a half edge and its twin whose origins' coordinates match the given pair of coordinates.
     *
     * @param coord1 - Coordinates to match either origin with
     * @param coord2 - Coordinates to match either origin with
     * @returns The half edge matching the coordinates, or null if not found
     */
    public getHalfEdge(coord1: Vector, coord2: Vector): HalfEdge | null {
        return (
            this.halfEdges.find(
                (halfEdge) => halfEdge.origin?.coordinates && halfEdge.twin?.origin?.coordinates ?
                    coord1.equals(halfEdge.origin?.coordinates) &&
                    coord2.equals(halfEdge.twin?.origin?.coordinates)
                    : false) || null
        );
    }

    /**
     * Returns a line segment representation of the doubly connected edge list's edges.
     *
     * @returns An array of line segments representing the edges
     */
    public getLineSegments(): LineSegment[] {
        const lineSegments: LineSegment[] = [];
        const halfEdgesHandled: HalfEdge[] = [];

        this.halfEdges.forEach((halfEdge) => {
            if (
                !halfEdgesHandled.some(
                    (handledEdge) =>
                        handledEdge === halfEdge || handledEdge === halfEdge.twin
                )
            ) {
                lineSegments.push(halfEdge.getLineSegment());
                halfEdgesHandled.push(halfEdge);
            }
        });

        return lineSegments;
    }

    /**
     * Removes edges with zero length from the collection.
     */
    public removeZeroLengthEdges(): void {
        this.halfEdges.forEach((halfEdge) => {

            if (halfEdge.origin?.coordinates && halfEdge.twin?.origin?.coordinates &&
                halfEdge.origin?.coordinates.equals(
                    halfEdge.twin?.origin?.coordinates
                )
            ) {
                halfEdge.unchain();
            }
        });

        this.halfEdges = this.halfEdges.filter(
            (halfEdge) => halfEdge.origin?.coordinates && halfEdge.twin?.origin?.coordinates &&
                !halfEdge.origin?.coordinates.equals(
                    halfEdge.twin?.origin?.coordinates
                )
        );
    }
}

/**
 * Vertex according to de Berg et al.
 */
export class Vertex {
    public coordinates: Vector | null = null;
    public incidentEdge: HalfEdge | null = null;
}

/**
 * Face according to de Berg et al. Additional property: center.
 */
export class Face {
    public center: Vector | null = null;
    public outerComponent: HalfEdge | null = null;
    public innerComponents: HalfEdge[] = [];
}

/**
 * Half edge according to de Berg et al.
 */
export class HalfEdge {
    public origin: Vertex | null = null;
    public twin: HalfEdge | null = null;
    public incidentFace: Face | null = null;
    public next: HalfEdge | null = null;
    public prev: HalfEdge | null = null;

    /**
     * Get the first of consecutive half edges. If half edges form a circle, the successor of this half edge is returned.
     *
     * @returns The first half edge
     */
    public getStart(): HalfEdge {
        let curEdge: HalfEdge = this;
        while (curEdge.prev !== null && curEdge.prev !== this) {
            curEdge = curEdge.prev;
        }
        return curEdge;
    }

    /**
     * Get the last of consecutive half edges. If half edges form a circle, the predecessor of this half edge is returned.
     *
     * @returns The last half edge
     */
    public getEnd(): HalfEdge {
        let curEdge: HalfEdge = this;
        while (curEdge.next !== null && curEdge.next !== this) {
            curEdge = curEdge.next;
        }
        return curEdge;
    }

    /**
     * Set the successor of this half edge.
     *
     * @param halfEdge - The new successor
     */
    public setNext(halfEdge: HalfEdge): void {
        this.next = halfEdge;
        halfEdge.prev = this;
    }

    /**
     * Set the predecessor of this half edge.
     *
     * @param halfEdge - The new predecessor
     */
    public setPrev(halfEdge: HalfEdge): void {
        this.prev = halfEdge;
        halfEdge.next = this;
    }

    /**
     * Give a line segment representation of this edge.
     *
     * @returns A line segment representing this edge
     */
    public getLineSegment(): LineSegment {
        if (!this.origin || !this.twin?.origin) {
            throw new Error('Invalid half edge: missing origin or twin origin.');
        }
        return new LineSegment(this.origin.coordinates!, this.twin.origin.coordinates!);
    }

    /**
     * Removes references to this half edge.
     */
    public unchain(): void {
        let newOuterComponent: HalfEdge | null = null;

        if (this.prev !== null && this.next !== null) {
            newOuterComponent = this.prev;
            this.prev.setNext(this.next);
        } else if (this.prev !== null) {
            newOuterComponent = this.prev;
            this.prev.next = null;
        } else if (this.next !== null) {
            newOuterComponent = this.next;
            this.next.prev = null;
        }

        if (this.incidentFace !== null) {
            this.incidentFace.outerComponent = newOuterComponent;
        }
    }
}