import { Tree, TreeNode } from './tree';
import comparator from '../util/comparator';

class ComparableObject {
    constructor(public val: number) { }

    compareTo(other: ComparableObject): number {
        return comparator.compare(this.val, other.val);
    }

    toString(): string {
        return this.val.toString();
    }
}

describe('TreeNode', () => {
    it('checks whether it is a leaf or not', () => {
        let root = new TreeNode(new ComparableObject(1));
        root = root.insert(new ComparableObject(0));
        root = root.insert(new ComparableObject(2));

        expect(root.isLeaf()).toBe(false);
        expect(root.leftChild!.isLeaf()).toBe(true);
        expect(root.rightChild!.isLeaf()).toBe(true);
    });

    it('returns a string representation of its contents', () => {
        const node = new TreeNode({ toString: () => 'hi' });
        expect(node.toString()).toBe('hi');
    });

    it('executes a function inorder on its subtree nodes contents', () => {
        let root = new TreeNode(new ComparableObject(1));
        root = root.insert(new ComparableObject(0));
        root = root.insert(new ComparableObject(2));

        let result = '';
        root.inorderDo((node) => (result += node.toString()));
        expect(result).toBe('012');
    });

    it('returns an inorder string representation of its subtree nodes', () => {
        let root = new TreeNode(new ComparableObject(1));
        root = root.insert(new ComparableObject(0));
        root = root.insert(new ComparableObject(2));

        expect(root.inorderString()).toBe('012');
    });

    it('returns an inorder list of its subtree nodes', () => {
        let root = new TreeNode(new ComparableObject(1));
        root = root.insert(new ComparableObject(0));
        root = root.insert(new ComparableObject(2));

        const inorderList = root.inorderList();

        expect(inorderList[0].toString()).toBe('0');
        expect(inorderList[1].toString()).toBe('1');
        expect(inorderList[2].toString()).toBe('2');
    });

    it('checks its balance and rebalances with a single right rotation', () => {
        let root = new TreeNode(new ComparableObject(2));
        root = root.insert(new ComparableObject(1));
        root = root.insert(new ComparableObject(0));

        expect(root.toString()).toBe('1');
        expect(root.leftChild!.toString()).toBe('0');
        expect(root.rightChild!.toString()).toBe('2');
    });

    it('checks its balance and rebalances with a left-right double rotation', () => {
        let root = new TreeNode(new ComparableObject(2));
        root = root.insert(new ComparableObject(0));
        root = root.insert(new ComparableObject(1));

        expect(root.toString()).toBe('1');
        expect(root.leftChild!.toString()).toBe('0');
        expect(root.rightChild!.toString()).toBe('2');
    });

    it('checks its balance and rebalances with a single left rotation', () => {
        let root = new TreeNode(new ComparableObject(0));
        root = root.insert(new ComparableObject(1));
        root = root.insert(new ComparableObject(2));

        expect(root.toString()).toBe('1');
        expect(root.leftChild!.toString()).toBe('0');
        expect(root.rightChild!.toString()).toBe('2');
    });

    it('checks its balance and rebalances with a right-left double rotation', () => {
        let root = new TreeNode(new ComparableObject(0));
        root = root.insert(new ComparableObject(2));
        root = root.insert(new ComparableObject(1));

        expect(root.toString()).toBe('1');
        expect(root.leftChild!.toString()).toBe('0');
        expect(root.rightChild!.toString()).toBe('2');
    });
});

describe('Tree', () => {
    it('checks whether it is empty or not', () => {
        const tree = new Tree();

        expect(tree.isEmpty()).toBe(true);
        tree.root = new TreeNode(null);
        expect(tree.isEmpty()).toBe(false);
    });


    it('inserts elements and keeps itself balanced', () => {
        const compFunction = comparator.compare;
        const objs = [new ComparableObject(0), new ComparableObject(1), new ComparableObject(2)];

        const tree1 = new Tree<number>();
        tree1.insert(0, compFunction);
        tree1.insert(1, compFunction);
        tree1.insert(2, compFunction);

        expect(tree1.root!.content).toBe(1);
        expect(tree1.root!.leftChild!.content).toBe(0);
        expect(tree1.root!.rightChild!.content).toBe(2);

        const tree2 = new Tree<typeof objs[0]>();
        tree2.insert(objs[0]);
        tree2.insert(objs[1]);
        tree2.insert(objs[2]);

        expect(tree2.root!.content).toBe(objs[1]);
        expect(tree2.root!.leftChild!.content).toBe(objs[0]);
        expect(tree2.root!.rightChild!.content).toBe(objs[2]);
    });

    it('deletes elements and keeps itself balanced', () => {
        const compFunction = comparator.compare;
        const objs = [new ComparableObject(0), new ComparableObject(1), new ComparableObject(2), new ComparableObject(3)];

        const tree1 = new Tree<number>();
        tree1.insert(0, compFunction);
        tree1.insert(1, compFunction);
        tree1.insert(2, compFunction);
        tree1.insert(3, compFunction);
        tree1.deleteElement(0, compFunction);

        expect(tree1.root!.content).toBe(2);
        expect(tree1.root!.leftChild!.content).toBe(1);
        expect(tree1.root!.rightChild!.content).toBe(3);

        const tree2 = new Tree<typeof objs[0]>();
        tree2.insert(objs[0]);
        tree2.insert(objs[1]);
        tree2.insert(objs[2]);
        tree2.insert(objs[3]);
        tree2.deleteElement(objs[0]);

        expect(tree2.root!.content).toBe(objs[2]);
        expect(tree2.root!.leftChild!.content).toBe(objs[1]);
        expect(tree2.root!.rightChild!.content).toBe(objs[3]);
    });

    it('gets an exact element', () => {
        const compFunction = comparator.compare;
        const objs = [new ComparableObject(0), new ComparableObject(1), new ComparableObject(2)];

        const tree1 = new Tree<number>();
        tree1.insert(0, compFunction);
        tree1.insert(1, compFunction);
        tree1.insert(2, compFunction);

        expect(tree1.get(0, compFunction)).toBe(0);
        expect(tree1.get(3, compFunction)).toBe(null);

        const tree2 = new Tree<typeof objs[0]>();
        tree2.insert(objs[0]);
        tree2.insert(objs[1]);
        tree2.insert(objs[2]);

        expect(tree2.get(objs[0])).toBe(objs[0]);
        expect(tree2.get(new ComparableObject(3))).toBe(null);
    });

    it('gets the closest element', () => {
        const compFunction = comparator.compare;
        const objs = [new ComparableObject(0), new ComparableObject(1), new ComparableObject(2)];

        const tree1 = new Tree<number>();
        tree1.insert(0, compFunction);
        tree1.insert(1, compFunction);
        tree1.insert(2, compFunction);

        expect(tree1.getClosest(0, compFunction)).toBe(0);
        expect(tree1.getClosest(3, compFunction)).toBe(2);

        const tree2 = new Tree<typeof objs[0]>();
        tree2.insert(objs[0]);
        tree2.insert(objs[1]);
        tree2.insert(objs[2]);

        expect(tree2.getClosest(objs[0])).toBe(objs[0]);
        expect(tree2.getClosest(new ComparableObject(3))).toBe(objs[2]);
    });
});