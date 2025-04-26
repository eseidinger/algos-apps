/**
 * A binary tree node with AVL tree balancing methods.
 */
export class TreeNode<T> {
    public _leftChild: TreeNode<T> | null = null;
    public _rightChild: TreeNode<T> | null = null;
    public _content: T;

    constructor(content: T) {
        this._content = content;
    }

    public get leftChild(): TreeNode<T> | null {
        return this._leftChild;
    }
    public get rightChild(): TreeNode<T> | null {
        return this._rightChild;
    }

    public get content(): T {
        return this._content;
    }

    public toString(): string {
        return this.content ? this.content.toString() : '';
    }

    public inorderString(): string {
        let result = '';
        this.inorderDo((node) => (result += node ? node.toString() : ''));
        return result;
    }

    public inorderList(): T[] {
        const result: T[] = [];
        this.inorderDo((content) => result.push(content));
        return result;
    }

    public inorderDo(fct: (content: T) => void): void {
        if (this.leftChild !== null) {
            this.leftChild.inorderDo(fct);
        }
        fct(this.content);
        if (this.rightChild !== null) {
            this.rightChild.inorderDo(fct);
        }
    }

    public isLeaf(): boolean {
        return this.leftChild === null && this.rightChild === null;
    }

    public getDepth(): number {
        const leftDepth = this.leftChild ? this.leftChild.getDepth() : 0;
        const rightDepth = this.rightChild ? this.rightChild.getDepth() : 0;
        return 1 + Math.max(leftDepth, rightDepth);
    }

    private getBalance(): number {
        const leftDepth = this.leftChild ? this.leftChild.getDepth() : 0;
        const rightDepth = this.rightChild ? this.rightChild.getDepth() : 0;
        return leftDepth - rightDepth;
    }

    private checkBalance(): TreeNode<T> {
        if (Math.abs(this.getBalance()) >= 2) {
            return this.rebalance();
        }
        return this;
    }

    private rebalance(): TreeNode<T> {
        if (this.getBalance() < 0) {
            if (this.rightChild && this.rightChild.getBalance() >= 0) {
                this._rightChild = this.rightChild.rotateRight();
            }
            return this.rotateLeft();
        } else {
            if (this.leftChild && this.leftChild.getBalance() <= 0) {
                this._leftChild = this.leftChild.rotateLeft();
            }
            return this.rotateRight();
        }
    }

    private rotateLeft(): TreeNode<T> {
        const temp = this.rightChild!;
        this._rightChild = temp.leftChild;
        temp._leftChild = this;
        return temp;
    }

    private rotateRight(): TreeNode<T> {
        const temp = this.leftChild!;
        this._leftChild = temp.rightChild;
        temp._rightChild = this;
        return temp;
    }

    public get(element: T, comparator?: (a: T, b: T) => number): T | null {
        if (!comparator) {
            if ((element as any).compareTo === undefined) {
                return null;
            }
            comparator = (el1, el2) => (el1 as any).compareTo(el2);
        }
        const comp = comparator(element, this.content);
        if (comp === 0) {
            return this.content;
        } else if (comp < 0) {
            return this.leftChild ? this.leftChild.get(element, comparator) : null;
        } else {
            return this.rightChild ? this.rightChild.get(element, comparator) : null;
        }
    }

    public getClosest(element: T, comparator?: (a: T, b: T) => number): T | null {
        if (!comparator) {
            if ((element as any).compareTo === undefined) {
                return null;
            }
            comparator = (el1, el2) => (el1 as any).compareTo(el2);
        }
        const comp = comparator(element, this.content);
        if (comp === 0) {
            return this.content;
        } else if (comp < 0) {
            return this.leftChild
                ? this.leftChild.getClosest(element, comparator)
                : this.content;
        } else {
            return this.rightChild
                ? this.rightChild.getClosest(element, comparator)
                : this.content;
        }
    }

    public getClosestAny(element: any, comparator?: (a: any, b: T) => number): T | null {
        if (!comparator) {
            if ((element as any).compareTo === undefined) {
                return null;
            }
            comparator = (el1, el2) => (el1 as any).compareTo(el2);
        }
        const comp = comparator(element, this.content);
        if (comp === 0) {
            return this.content;
        } else if (comp < 0) {
            return this.leftChild
                ? this.leftChild.getClosestAny(element, comparator)
                : this.content;
        } else {
            return this.rightChild
                ? this.rightChild.getClosestAny(element, comparator)
                : this.content;
        }
    }

    public insert(element: T, comparator?: (a: T, b: T) => number): TreeNode<T> {
        if (!comparator) {
            if ((element as any).compareTo === undefined) {
                return null!;
            }
            comparator = (el1, el2) => (el1 as any).compareTo(el2);
        }
        if (comparator(element, this.content) <= 0) {
            if (this.leftChild) {
                this._leftChild = this.leftChild.insert(element, comparator);
            } else {
                this._leftChild = new TreeNode(element);
            }
        } else {
            if (this.rightChild) {
                this._rightChild = this.rightChild.insert(element, comparator);
            } else {
                this._rightChild = new TreeNode(element);
            }
        }
        return this.checkBalance();
    }

    public deleteMin(): T {
        if (this.leftChild === null) {
            const result = this.content;
            if (this.rightChild !== null) {
                this._content = this.rightChild.deleteMin();
                if (this.rightChild.content === null) {
                    this._rightChild = null;
                }
            } else {
                this._content = null!;
            }
            return result;
        } else {
            const result = this.leftChild.deleteMin();
            if (this.leftChild.content === null) {
                this._leftChild = this.leftChild.rightChild;
            }
            return result;
        }
    }

    public deleteElement(
        element: T,
        comparator?: (a: T, b: T) => number
    ): TreeNode<T> | null {
        if (!comparator) {
            if ((element as any).compareTo === undefined) {
                return null;
            }
            comparator = (el1, el2) => (el1 as any).compareTo(el2);
        }
        const comp = comparator(element, this.content);
        if (comp < 0) {
            if (this.leftChild) {
                this._leftChild = this.leftChild.deleteElement(element, comparator);
            }
            return this.checkBalance();
        } else if (comp > 0) {
            if (this.rightChild) {
                this._rightChild = this.rightChild.deleteElement(element, comparator);
            }
            return this.checkBalance();
        } else {
            if (this.isLeaf()) {
                return null;
            } else if (!this.leftChild) {
                return this.rightChild!.checkBalance();
            } else if (!this.rightChild) {
                return this.leftChild!.checkBalance();
            } else {
                this._content = this.rightChild.deleteMin();
                if (this.rightChild.content === null) {
                    this._rightChild = null;
                }
                return this.checkBalance();
            }
        }
    }
}

/**
 * A binary tree.
 */
export class Tree<T> {
    public root: TreeNode<T> | null = null;

    public isEmpty(): boolean {
        return this.root === null;
    }

    public toString(): string {
        return this.root ? this.root.inorderString() : '';
    }

    public inorderList(): T[] {
        return this.root ? this.root.inorderList() : [];
    }

    public inorderDo(fct: (content: T) => void): void {
        if (this.root) {
            this.root.inorderDo(fct);
        }
    }

    public get(element: T, comparator?: (a: T, b: T) => number): T | null {
        return this.root ? this.root.get(element, comparator) : null;
    }

    public getClosest(element: T, comparator?: (a: T, b: T) => number): T | null {
        return this.root ? this.root.getClosest(element, comparator) : null;
    }

    public getClosestAny(element: any, comparator?: (a: any, b: T) => number): T | null {
        return this.root ? this.root.getClosestAny(element, comparator) : null;
    }

    public insert(element: T, comparator?: (a: T, b: T) => number): void {
        if (this.isEmpty()) {
            this.root = new TreeNode(element);
        } else {
            this.root = this.root!.insert(element, comparator);
        }
    }

    public deleteElement(element: T, comparator?: (a: T, b: T) => number): void {
        if (!this.isEmpty()) {
            this.root = this.root!.deleteElement(element, comparator);
        }
    }

    public deleteMin(): T | null {
        if (this.isEmpty()) {
            return null;
        } else {
            const result = this.root!.deleteMin();
            if (this.root!.content === null) {
                this.root = null;
            }
            return result;
        }
    }
}