import { Vector } from '../geom/vector';
import { Triangle } from '../geom/triangle';
import { Circle } from '../geom/circle';
import { LineSegment } from '../geom/linesegment';
import { HalfEdge, EdgeList, Face, Vertex } from '../ds/dcel';
import comparator from '../util/comparator';
import constant from '../util/constant';

/**
 * Skyum's algorithm calculates the smallest enclosing circle and the farthest
 * point Voronoi diagram of a set of points in the plane, given its convex hull.
 */
export class Skyum {
    private static triangles: Triangle[] = [];
    private static remainingPoints: Vector[] = [];
    private static originalPoints: Vector[] = [];
    private static voronoiPoints: Vector[] = [];
    public static smallestCircle: Circle | null = null;
    private static voronoiDiagram: EdgeList = new EdgeList();

    /**
     * Initialize the triangle array with triangles formed by subsequent convex hull points.
     */
    private static initTriangleArray(): void {
        Skyum.triangles = [];
        for (let i = 0; i < Skyum.originalPoints.length; i++) {
            const iPre = (i + Skyum.originalPoints.length - 1) % Skyum.originalPoints.length;
            const iPost = (i + 1) % Skyum.originalPoints.length;

            const t = new Triangle(
                Skyum.originalPoints[iPre],
                Skyum.originalPoints[i],
                Skyum.originalPoints[iPost]
            );
            Skyum.triangles.push(t);
        }
    }

    /**
     * On removal of a point from the convex hull, two new triangles are to be considered.
     *
     * @param point - The point to remove
     */
    private static addNewTrianglesWithNeighboursOfPoint(point: Vector): void {
        const i = Skyum.remainingPoints.indexOf(point);

        const iPre = (i + Skyum.remainingPoints.length - 1) % Skyum.remainingPoints.length;
        const iPrePre = (iPre + Skyum.remainingPoints.length - 1) % Skyum.remainingPoints.length;

        const iPost = (i + 1) % Skyum.remainingPoints.length;
        const iPostPost = (i + 2) % Skyum.remainingPoints.length;

        const t1 = new Triangle(
            Skyum.remainingPoints[iPrePre],
            Skyum.remainingPoints[iPre],
            Skyum.remainingPoints[iPost]
        );
        const t2 = new Triangle(
            Skyum.remainingPoints[iPre],
            Skyum.remainingPoints[iPost],
            Skyum.remainingPoints[iPostPost]
        );

        Skyum.triangles.push(t1);
        Skyum.triangles.push(t2);
    }

    /**
     * Calculate the position of the vertex of the Voronoi diagram edge separating P and Q laying in infinity.
     *
     * @param P - Center of Voronoi region
     * @param Q - Center of Voronoi region
     * @returns The point of the Voronoi diagram with infinite distance
     */
    private static calcVP(P: Vector, Q: Vector): Vector {
        const e = new LineSegment(P, Q);
        const C = e.getCenter();
        const v = e.direction.rotate(Math.PI / 2);

        return C.add(v.normalize().multiplyScalar(constant.INFINITY));
    }

    /**
     * Initialize the global variables.
     *
     * @param points - Points of the convex hull
     */
    private static initGlobals(points: Vector[]): void {
        Skyum.originalPoints = points;
        Skyum.initTriangleArray();
        Skyum.remainingPoints = [...points];
        Skyum.voronoiPoints = [];

        Skyum.smallestCircle = null;
        Skyum.voronoiDiagram = new EdgeList();

        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            const vP = Skyum.calcVP(points[i], points[j]);
            Skyum.voronoiPoints.push(vP);
        }
    }

    /**
     * Run Skyum's algorithm.
     *
     * @param points - Points forming a convex hull
     * @returns The Voronoi diagram, smallest circle, and Voronoi triangles
     */
    public static computeVoronoiDiagram(points: Vector[]): {
        voronoiDiagram: EdgeList;
        smallestCircle: Circle | null;
        voronoiTriangles: Triangle[];
    } {
        const voronoiTriangles: Triangle[] = [];

        Skyum.initGlobals(points);

        if (points.length > 2) {
            do {
                Skyum.triangles.sort((t1, t2) => -1 * Triangle.compare(t1, t2));
                const triangle = Skyum.triangles[0];
                voronoiTriangles.push(triangle);

                Skyum.handleTriangle(triangle);

                Skyum.triangles = Skyum.triangles.filter((t) => !t.isCorner(triangle.p2));
                Skyum.addNewTrianglesWithNeighboursOfPoint(triangle.p2);
                const i = Skyum.remainingPoints.indexOf(triangle.p2);
                Skyum.remainingPoints.splice(i, 1);
            } while (Skyum.remainingPoints.length > 2);

            Skyum.handleRemainingLine();
        } else if (points.length === 2) {
            Skyum.handleRemainingLine();
        } else if (points.length === 1) {
            Skyum.smallestCircle = new Circle(points[0], 0);
        }

        Skyum.voronoiDiagram.removeZeroLengthEdges();
        return {
            voronoiDiagram: Skyum.voronoiDiagram,
            smallestCircle: Skyum.smallestCircle,
            voronoiTriangles,
        };
    }

    /**
     * Check current triangle for smallest circle and add edges to Voronoi diagram.
     *
     * @param triangle - The triangle to handle
     */
    private static handleTriangle(triangle: Triangle): void {
        if (
            Skyum.smallestCircle === null &&
            comparator.compareWithTolerance(triangle.getMiddleAngle(), Math.PI / 2) !== 1
        ) {
            Skyum.smallestCircle = triangle.getCircumcircle();
        }

        const P = triangle.p2;
        const Q = triangle.p1;
        const R = triangle.p3;
        const C = triangle.getCircumcircle().center;

        const i = Skyum.originalPoints.indexOf(P);
        const vP = Skyum.voronoiPoints[i];
        const j = Skyum.originalPoints.indexOf(Q);
        const vQ = Skyum.voronoiPoints[j];
        Skyum.voronoiPoints[j] = C;

        Skyum.createPartialEdgeListForTriangle(P, Q, R, C, vP, vQ);
    }

    /**
     * Check remaining line for smallest circle and add edges to Voronoi diagram.
     */
    private static handleRemainingLine(): void {
        const Q = Skyum.remainingPoints[0];
        const R = Skyum.remainingPoints[1];

        const i = Skyum.originalPoints.indexOf(Q);
        const j = Skyum.originalPoints.indexOf(R);

        const vQ = Skyum.voronoiPoints[i];
        const vR = Skyum.voronoiPoints[j];

        const e = new LineSegment(Q, R);
        if (Skyum.smallestCircle === null) {
            Skyum.smallestCircle = new Circle(e.getCenter(), e.getLength() / 2);
        }

        Skyum.createPartialEdgeListForLine(Q, R, vQ, vR);
    }

    /**
     * Create the partial edge list for a triangle of convex hull points.
     */
    private static createPartialEdgeListForTriangle(
        P: Vector,
        Q: Vector,
        R: Vector,
        C: Vector,
        vP: Vector,
        vQ: Vector
    ): void {
        const halfEdgeP = Skyum.voronoiDiagram.getNewHalfEdgePair();
        const halfEdgeQ = Skyum.voronoiDiagram.getNewHalfEdgePair();

        let vertexC = Skyum.voronoiDiagram.getVertex(C);
        if (vertexC === null) {
            vertexC = Skyum.voronoiDiagram.getNewVertex();
            vertexC.coordinates = C;
            vertexC.incidentEdge = halfEdgeP.twin;
        }
        const faceP = Skyum.configureFaceForPoint(P, halfEdgeP);
        const faceQ = Skyum.configureFaceForPoint(Q, halfEdgeQ);
        const faceR = Skyum.configureFaceForPoint(R, halfEdgeP.twin!);

        const vertexP = Skyum.configureVertexForPoint(vP, halfEdgeP, faceP, faceR);
        const vertexQ = Skyum.configureVertexForPoint(vQ, halfEdgeQ, faceQ, faceP);

        halfEdgeP.setNext(halfEdgeQ.twin!);
        halfEdgeP.origin = vertexP;
        halfEdgeP.incidentFace = faceP;
        halfEdgeP.twin!.origin = vertexC;
        halfEdgeP.twin!.incidentFace = faceR;
        halfEdgeQ.origin = vertexQ;
        halfEdgeQ.incidentFace = faceQ;
        halfEdgeQ.twin!.origin = vertexC;
        halfEdgeQ.twin!.incidentFace = faceP;
    }

    /**
     * Create the partial edge list for a line connecting two convex hull points.
     */
    private static createPartialEdgeListForLine(
        Q: Vector,
        R: Vector,
        vQ: Vector,
        vR: Vector
    ): void {
        const halfEdgeR = Skyum.voronoiDiagram.getNewHalfEdgePair();

        const faceQ = Skyum.configureFaceForPoint(Q, halfEdgeR.twin!);
        const faceR = Skyum.configureFaceForPoint(R, halfEdgeR);

        const vertexQ = Skyum.configureVertexForPoint(vQ, halfEdgeR.twin!, faceQ, faceR);
        const vertexR = Skyum.configureVertexForPoint(vR, halfEdgeR, faceR, faceQ);

        halfEdgeR.origin = vertexR;
        halfEdgeR.incidentFace = faceR;
        halfEdgeR.twin!.origin = vertexQ;
        halfEdgeR.twin!.incidentFace = faceQ;
    }

    /**
     * Setup the face for a given center and outer component.
     */
    private static configureFaceForPoint(center: Vector, outerComponent: HalfEdge): Face {
        let face = Skyum.voronoiDiagram.getFace(center);

        if (face === null) {
            face = Skyum.voronoiDiagram.getNewFace();
            face.center = center;
            face.outerComponent = outerComponent;
        }
        return face;
    }

    /**
     * Set up the vertex for given coordinates, incident edge, and two faces separated by the incident edge.
     */
    private static configureVertexForPoint(
        coordinates: Vector,
        incidentEdge: HalfEdge,
        face1: Face,
        face2: Face
    ): Vertex {
        let vertex = Skyum.voronoiDiagram.getVertex(coordinates);

        if (vertex === null) {
            vertex = Skyum.voronoiDiagram.getNewVertex();
            vertex.coordinates = coordinates;
            vertex.incidentEdge = incidentEdge;
        } else {
            if (face1.outerComponent!.getEnd().twin!.origin === vertex) {
                face1.outerComponent!.getEnd().setNext(incidentEdge);
            }
            if (face2.outerComponent!.getStart().origin === vertex) {
                face2.outerComponent!.getStart().setPrev(incidentEdge.twin!);
            }
        }
        return vertex;
    }
}