import { Vector } from '../geom/vector';
import { LineSegment } from '../geom/linesegment';
import { EdgeList, HalfEdge, Face, Vertex } from '../ds/dcel';
import comparator from '../util/comparator';

/**
 * Represents two neighboring Voronoi cells as a geometric type.
 */
export class VoronoiNeighbours {
    public delaunayEdge: LineSegment;
    public commonBorder: LineSegment;
    public alphaMin: number = 0;
    public alphaMax: number = 0;

    constructor(delaunayEdge: LineSegment, commonBorder: LineSegment) {
        this.delaunayEdge = delaunayEdge;
        this.commonBorder = commonBorder;
    }

    /**
     * Calculate the minimum distance of the Voronoi cells' centers to the Voronoi edge separating the centers.
     *
     * @returns The minimum distance
     */
    public getMinDist(): number {
        return this.commonBorder.getMinDist(this.delaunayEdge.start);
    }

    /**
     * Calculate the maximum distance of the Voronoi cells' centers to the Voronoi edge separating the centers.
     *
     * @returns The maximum distance
     */
    public getMaxDist(): number {
        return this.commonBorder.getMaxDist(this.delaunayEdge.start);
    }

    /**
     * Check Voronoi neighbours for equality with this Voronoi neighbours.
     *
     * @param voronoiNeighbours - The VoronoiNeighbours to check for equality
     * @returns True if Voronoi neighbours are equal, false otherwise
     */
    public equals(voronoiNeighbours: VoronoiNeighbours): boolean {
        return (
            this.delaunayEdge.sortedEndpoints().equals(voronoiNeighbours.delaunayEdge.sortedEndpoints()) &&
            this.commonBorder.sortedEndpoints().equals(voronoiNeighbours.commonBorder.sortedEndpoints())
        );
    }
}

/**
 * Represents a Voronoi cell as a geometric type.
 */
export class VoronoiCell {
    public center: Vector;
    public borders: LineSegment[] = [];
    public alphaMin: number = 0;
    public alphaMax: number = 0;

    constructor(center: Vector) {
        this.center = center;
    }

    /**
     * Add a border to the Voronoi cell.
     *
     * @param border - The border to add
     */
    public addBorder(border: LineSegment): void {
        this.borders.push(border);
    }

    /**
     * Calculate the minimum distance of the center of the cell to its borders.
     *
     * @returns The minimum distance
     */
    public getMinDist(): number {
        const dists = this.borders.map((border) => border.getMinDist(this.center));
        dists.sort(comparator.compare);
        return dists[0];
    }

    /**
     * Calculate the maximum distance of the center of the cell to its borders.
     *
     * @returns The maximum distance
     */
    public getMaxDist(): number {
        const dists = this.borders.map((border) => border.getMaxDist(this.center));
        dists.sort((a, b) => -1 * comparator.compare(a, b));
        return dists[0];
    }
}

/**
 * Evaluation of a Voronoi diagram.
 */
export class VoronoiDelaunay {
    /**
     * Compute the Delaunay graph from a given Voronoi diagram.
     *
     * @param voronoiDiagram - The Voronoi diagram to compute the Delaunay graph from
     * @returns The dual Delaunay graph
     */
    public static computeDelaunay(voronoiDiagram: EdgeList): EdgeList {
        const delaunay = new EdgeList();

        voronoiDiagram.faces.forEach((face) => {
            if (face.outerComponent !== null) {
                const startingEdge = face.outerComponent.getStart();
                let curEdge: HalfEdge | null = startingEdge;
                let origin = delaunay.getVertex(curEdge.incidentFace!.center!);
                if (origin === null) {
                    origin = delaunay.getNewVertex();
                    origin.coordinates = curEdge.incidentFace!.center!;
                }
                do {
                    const twinOriginCoordinates = curEdge.twin!.incidentFace!.center!;
                    const existingHalfEdge = delaunay.getHalfEdge(origin.coordinates!, twinOriginCoordinates);
                    if (existingHalfEdge === null) {
                        let twinOrigin = delaunay.getVertex(twinOriginCoordinates);
                        if (twinOrigin === null) {
                            twinOrigin = delaunay.getNewVertex();
                            twinOrigin.coordinates = twinOriginCoordinates;
                        }
                        const delEdge = delaunay.getNewHalfEdgePair();
                        delEdge.origin = origin;
                        delEdge.twin!.origin = twinOrigin;
                    }
                    curEdge = curEdge.next;
                } while (curEdge !== null && curEdge !== startingEdge);
            }
        });

        return delaunay;
    }

    /**
     * Compute the Voronoi neighbours from a given Voronoi diagram.
     *
     * @param voronoiDiagram - The Voronoi diagram
     * @returns An array of VoronoiNeighbours
     */
    public static computeVoronoiNeighbours(voronoiDiagram: EdgeList): VoronoiNeighbours[] {
        const voronoiNeighboursArray: VoronoiNeighbours[] = [];
        const halfEdgesHandled: HalfEdge[] = [];

        voronoiDiagram.halfEdges.forEach((halfEdge) => {
            if (!halfEdgesHandled.includes(halfEdge)) {
                halfEdgesHandled.push(halfEdge);
                halfEdgesHandled.push(halfEdge.twin!);

                const delaunayCoordinates1 = halfEdge.incidentFace!.center!;
                const delaunayCoordinates2 = halfEdge.twin!.incidentFace!.center!;
                const voronoiCoordinates1 = halfEdge.origin!.coordinates!;
                const voronoiCoordinates2 = halfEdge.twin!.origin!.coordinates!;
                const voronoiEdge = new LineSegment(voronoiCoordinates1, voronoiCoordinates2);
                const delaunayEdge = new LineSegment(delaunayCoordinates1, delaunayCoordinates2);
                const voronoiNeighbours = new VoronoiNeighbours(delaunayEdge, voronoiEdge);
                voronoiNeighboursArray.push(voronoiNeighbours);
            }
        });

        return voronoiNeighboursArray;
    }

    /**
     * Compute the Voronoi cells from a given Voronoi diagram.
     *
     * @param voronoiDiagram - The Voronoi diagram
     * @returns An array of VoronoiCell
     */
    public static computeVoronoiCells(voronoiDiagram: EdgeList): VoronoiCell[] {
        const voronoiCellArray: VoronoiCell[] = [];

        voronoiDiagram.faces.forEach((face) => {
            if (face.outerComponent !== null) {
                const voronoiCell = new VoronoiCell(face.center!);
                const startingEdge = face.outerComponent.getStart();
                let curEdge: HalfEdge | null = startingEdge;
                do {
                    const voronoiCoordinates1 = curEdge.origin!.coordinates!;
                    const voronoiCoordinates2 = curEdge.twin!.origin!.coordinates!;
                    const voronoiEdge = new LineSegment(voronoiCoordinates1, voronoiCoordinates2);
                    voronoiCell.addBorder(voronoiEdge);
                    curEdge = curEdge.next;
                } while (curEdge !== null && curEdge !== startingEdge);
                voronoiCellArray.push(voronoiCell);
            }
        });

        return voronoiCellArray;
    }
}