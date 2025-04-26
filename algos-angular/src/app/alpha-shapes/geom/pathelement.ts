import { Vector } from "./vector";

/**
 * A base class for path elements.
 */
export abstract class PathElement {
    /**
     * Constructor for the PathElement class.
     */
    constructor() { }

    public abstract start: Vector;
}
