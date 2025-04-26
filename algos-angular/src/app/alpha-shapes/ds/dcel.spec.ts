import { HalfEdge, EdgeList, Vertex, Face } from './dcel';
import { Vector } from '../geom/vector';
import { LineSegment } from '../geom/linesegment';
import arrayFunctions from '../util/array';

describe('HalfEdge', () => {
    it('sets a successor', () => {
        const edge1 = new HalfEdge();
        const edge2 = new HalfEdge();

        edge1.setNext(edge2);
        expect(edge1.next).toBe(edge2);
        expect(edge2.prev).toBe(edge1);
    });

    it('sets a predecessor', () => {
        const edge1 = new HalfEdge();
        const edge2 = new HalfEdge();

        edge1.setPrev(edge2);
        expect(edge1.prev).toBe(edge2);
        expect(edge2.next).toBe(edge1);
    });

    it('returns the first in a chain of half edges', () => {
        const edge1 = new HalfEdge();
        const edge2 = new HalfEdge();
        const edge3 = new HalfEdge();

        edge1.setNext(edge2);
        edge2.setNext(edge3);

        expect(edge2.getStart()).toBe(edge1);

        edge3.setNext(edge1);
        expect(edge2.getStart()).toBe(edge3);
    });

    it('returns the last in a chain of half edges', () => {
        const edge1 = new HalfEdge();
        const edge2 = new HalfEdge();
        const edge3 = new HalfEdge();

        edge1.setNext(edge2);
        edge2.setNext(edge3);

        expect(edge2.getEnd()).toBe(edge3);
        edge3.setNext(edge1);
        expect(edge2.getEnd()).toBe(edge1);
    });

    it('returns a line segment created from a half edge and its twin', () => {
        const edge = new HalfEdge();
        edge.origin = new Vertex();
        edge.origin.coordinates = new Vector(0, 0);
        const twin = new HalfEdge();
        edge.twin = twin;
        twin.origin = new Vertex();
        twin.origin.coordinates = new Vector(1, 1);

        const ls = edge.getLineSegment();
        const expectedLs = new LineSegment(new Vector(0, 0), new Vector(1, 1));
        expect(ls!.sortedEndpoints().equals(expectedLs.sortedEndpoints())).toBe(true);
    });

    it('removes all references to itself from previous and next edge as well as incident face', () => {
        const edge1 = new HalfEdge();
        const edge2 = new HalfEdge();
        const edge3 = new HalfEdge();
        const face = new Face();

        edge1.setNext(edge2);
        edge1.incidentFace = face;
        edge2.setNext(edge3);
        edge2.incidentFace = face;
        edge3.setNext(edge1);
        edge3.incidentFace = face;
        face.outerComponent = edge2;

        edge2.unchain();

        expect(edge1.next).toBe(edge3);
        expect(edge3.prev).toBe(edge1);
        expect(face.outerComponent).toBe(edge1);
    });
});

describe('EdgeList', () => {
    it('returns a face given its center', () => {
        const edgeList = new EdgeList();
        const face1 = edgeList.getNewFace();
        const face2 = edgeList.getNewFace();

        face1.center = new Vector(0, 0);
        face2.center = new Vector(1, 1);

        const result1 = edgeList.getFace(new Vector(0, 0));
        const result2 = edgeList.getFace(new Vector(1, 1));

        expect(result1).toBe(face1);
        expect(result2).toBe(face2);
    });

    it('returns a vertex given its coordinates', () => {
        const edgeList = new EdgeList();
        const vertex1 = edgeList.getNewVertex();
        const vertex2 = edgeList.getNewVertex();

        vertex1.coordinates = new Vector(0, 0);
        vertex2.coordinates = new Vector(1, 1);

        const result1 = edgeList.getVertex(new Vector(0, 0));
        const result2 = edgeList.getVertex(new Vector(1, 1));

        expect(result1).toBe(vertex1);
        expect(result2).toBe(vertex2);
    });

    it('returns a half edge whose origin and its twin\'s origin matches given coordinates', () => {
        const edgeList = new EdgeList();
        const edge1 = edgeList.getNewHalfEdgePair();
        const edge2 = edgeList.getNewHalfEdgePair();

        edge1.origin = new Vertex();
        edge1.origin.coordinates = new Vector(0, 0);
        edge1.twin!.origin = new Vertex();
        edge1.twin!.origin.coordinates = new Vector(1, 0);

        edge2.origin = new Vertex();
        edge2.origin.coordinates = new Vector(0, 1);
        edge2.twin!.origin = new Vertex();
        edge2.twin!.origin.coordinates = new Vector(1, 1);

        const result1_1 = edgeList.getHalfEdge(new Vector(0, 0), new Vector(1, 0));
        const result1_2 = edgeList.getHalfEdge(new Vector(1, 0), new Vector(0, 0));
        const result2_1 = edgeList.getHalfEdge(new Vector(0, 1), new Vector(1, 1));
        const result2_2 = edgeList.getHalfEdge(new Vector(1, 1), new Vector(0, 1));

        expect(result1_1).toBe(edge1);
        expect(result1_2).toBe(edge1.twin);
        expect(result2_1).toBe(edge2);
        expect(result2_2).toBe(edge2.twin);
    });

    it('returns a list of line segments corresponding to the edges', () => {
        const edgeList = new EdgeList();
        const edge1 = edgeList.getNewHalfEdgePair();
        const edge2 = edgeList.getNewHalfEdgePair();

        edge1.origin = new Vertex();
        edge1.origin.coordinates = new Vector(0, 0);
        edge1.twin!.origin = new Vertex();
        edge1.twin!.origin.coordinates = new Vector(1, 0);

        edge2.origin = new Vertex();
        edge2.origin.coordinates = new Vector(0, 1);
        edge2.twin!.origin = new Vertex();
        edge2.twin!.origin.coordinates = new Vector(1, 1);

        const lineSegments = edgeList.getLineSegments();
        const expectedLineSegments = [
            new LineSegment(new Vector(0, 0), new Vector(1, 0)),
            new LineSegment(new Vector(0, 1), new Vector(1, 1)),
        ];

        expect(arrayFunctions.compare(lineSegments, expectedLineSegments, false)).toBe(0);
    });

    it('removes edges with zero length from list of edges', () => {
        const edgeList = new EdgeList();
        const edge1 = edgeList.getNewHalfEdgePair();
        const edge2 = edgeList.getNewHalfEdgePair();
        const edge3 = edgeList.getNewHalfEdgePair();

        edge1.origin = new Vertex();
        edge1.origin.coordinates = new Vector(0, 0);
        edge1.twin!.origin = new Vertex();
        edge1.twin!.origin.coordinates = new Vector(1, 0);

        edge2.origin = new Vertex();
        edge2.origin.coordinates = new Vector(0, 1);
        edge2.twin!.origin = new Vertex();
        edge2.twin!.origin.coordinates = new Vector(1, 1);

        edge3.origin = new Vertex();
        edge3.origin.coordinates = new Vector(2, 2);
        edge3.twin!.origin = new Vertex();
        edge3.twin!.origin.coordinates = new Vector(2, 2);

        edgeList.removeZeroLengthEdges();
        expect(edgeList.halfEdges.length).toBe(4);
        expect(edgeList.getHalfEdge(new Vector(2, 2), new Vector(2, 2))).toBeNull();
    });
});