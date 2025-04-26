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

/**
 * A binary tree node with AVL tree balancing methods.
 */
export class TreeNode<T extends { toString(): string } | null> {
    public leftChild: TreeNode<T> | null = null;
    public rightChild: TreeNode<T> | null = null;
    public content: T;

    constructor(content: T) {
        this.content = content;
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

    private getDepth(): number {
        const leftDepth = this.leftChild ? this.leftChild.getDepth() : 0;
        const rightDepth = this.rightChild ? this.rightChild.getDepth() : 0;
        return 1 + Math.max(leftDepth, rightDepth);
    }

    private getBalance(): number {
        const leftDepth = this.leftChild ? this.leftChild.getDepth() : 0;
        const rightDepth = this.rightChild ? this.rightChild.getDepth() : 0;
        return leftDepth - rightDepth;
    }

    public checkBalance(): TreeNode<T> {
        if (Math.abs(this.getBalance()) >= 2) {
            return this.rebalance();
        }
        return this;
    }

    private rebalance(): TreeNode<T> {
        if (this.getBalance() < 0) {
            if (this.rightChild && this.rightChild.getBalance() >= 0) {
                this.rightChild = this.rightChild.rotateRight();
            }
            return this.rotateLeft();
        } else {
            if (this.leftChild && this.leftChild.getBalance() <= 0) {
                this.leftChild = this.leftChild.rotateLeft();
            }
            return this.rotateRight();
        }
    }

    private rotateLeft(): TreeNode<T> {
        const temp = this.rightChild!;
        this.rightChild = temp.leftChild;
        temp.leftChild = this;
        return temp;
    }

    private rotateRight(): TreeNode<T> {
        const temp = this.leftChild!;
        this.leftChild = temp.rightChild;
        temp.rightChild = this;
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
                this.leftChild = this.leftChild.insert(element, comparator);
            } else {
                this.leftChild = new TreeNode(element);
            }
        } else {
            if (this.rightChild) {
                this.rightChild = this.rightChild.insert(element, comparator);
            } else {
                this.rightChild = new TreeNode(element);
            }
        }
        return this.checkBalance();
    }

    public deleteMin(): T {
        if (this.leftChild === null) {
            const result = this.content;
            if (this.rightChild !== null) {
                this.content = this.rightChild.deleteMin();
                if (this.rightChild.content === null) {
                    this.rightChild = null;
                }
            } else {
                this.content = null!;
            }
            return result;
        } else {
            const result = this.leftChild.deleteMin();
            if (this.leftChild.content === null) {
                this.leftChild = this.leftChild.rightChild;
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
                this.leftChild = this.leftChild.deleteElement(element, comparator);
            }
            return this.checkBalance();
        } else if (comp > 0) {
            if (this.rightChild) {
                this.rightChild = this.rightChild.deleteElement(element, comparator);
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
                this.content = this.rightChild.deleteMin();
                if (this.rightChild.content === null) {
                    this.rightChild = null;
                }
                return this.checkBalance();
            }
        }
    }
}

/**
 * A binary tree.
 */
export class Tree<T extends { toString(): string } | null> {
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