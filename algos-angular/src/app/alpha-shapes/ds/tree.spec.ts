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

 import { Tree, TreeNode } from './tree';
 import comparator from '../util/comparator';
 
 class ComparableObject {
     constructor(public val: number) {}
 
     compareTo(other: ComparableObject): number {
         return comparator.compare(this.val, other.val);
     }
 }

 describe('TreeNode', () => {
     it('checks whether it is a leaf or not', () => {
         const root = new TreeNode(null);
         const leftLeaf = new TreeNode(null);
         const rightLeaf = new TreeNode(null);
 
         root.leftChild = leftLeaf;
         root.rightChild = rightLeaf;
 
         expect(root.isLeaf()).toBe(false);
         expect(leftLeaf.isLeaf()).toBe(true);
         expect(rightLeaf.isLeaf()).toBe(true);
     });
 
     it('returns a string representation of its contents', () => {
         const node = new TreeNode({ toString: () => 'hi' });
         expect(node.toString()).toBe('hi');
     });
 
     it('executes a function inorder on its subtree nodes contents', () => {
         const root = new TreeNode({ toString: () => 'root' });
         const leftLeaf = new TreeNode({ toString: () => 'left' });
         const rightLeaf = new TreeNode({ toString: () => 'right' });
 
         root.leftChild = leftLeaf;
         root.rightChild = rightLeaf;
 
         let result = '';
         root.inorderDo((node) => (result += node.toString()));
         expect(result).toBe('leftrootright');
     });
 
     it('returns an inorder string representation of its subtree nodes', () => {
         const root = new TreeNode({ toString: () => 'root' });
         const leftLeaf = new TreeNode({ toString: () => 'left' });
         const rightLeaf = new TreeNode({ toString: () => 'right' });
 
         root.leftChild = leftLeaf;
         root.rightChild = rightLeaf;
 
         expect(root.inorderString()).toBe('leftrootright');
     });
 
     it('returns an inorder list of its subtree nodes', () => {
         const root = new TreeNode({ toString: () => 'root' });
         const leftLeaf = new TreeNode({ toString: () => 'left' });
         const rightLeaf = new TreeNode({ toString: () => 'right' });
 
         root.leftChild = leftLeaf;
         root.rightChild = rightLeaf;
 
         const inorderList = root.inorderList();
 
         expect(inorderList[0].toString()).toBe('left');
         expect(inorderList[1].toString()).toBe('root');
         expect(inorderList[2].toString()).toBe('right');
     });
 
     it('checks its balance and rebalances with a single right rotation', () => {
         let root = new TreeNode<string>('root');
         const left = new TreeNode<string>('left');
         const leftLeft = new TreeNode<string>('leftLeft');
 
         left.leftChild = leftLeft;
         root.leftChild = left;
 
         root = root.checkBalance();
 
         expect(root.content).toBe('left');
         expect(root.leftChild!.content).toBe('leftLeft');
         expect(root.rightChild!.content).toBe('root');
     });
 
     it('checks its balance and rebalances with a left-right double rotation', () => {
         let root = new TreeNode<string>('root');
         const left = new TreeNode<string>('left');
         const leftRight = new TreeNode<string>('leftRight');
 
         left.rightChild = leftRight;
         root.leftChild = left;
 
         root = root.checkBalance();
 
         expect(root.content).toBe('leftRight');
         expect(root.leftChild!.content).toBe('left');
         expect(root.rightChild!.content).toBe('root');
     });
 
     it('checks its balance and rebalances with a single left rotation', () => {
         let root = new TreeNode<string>('root');
         const right = new TreeNode<string>('right');
         const rightRight = new TreeNode<string>('rightRight');
 
         right.rightChild = rightRight;
         root.rightChild = right;
 
         root = root.checkBalance();
 
         expect(root.content).toBe('right');
         expect(root.leftChild!.content).toBe('root');
         expect(root.rightChild!.content).toBe('rightRight');
     });
 
     it('checks its balance and rebalances with a right-left double rotation', () => {
         let root = new TreeNode<string>('root');
         const right = new TreeNode<string>('right');
         const rightLeft = new TreeNode<string>('rightLeft');
 
         right.leftChild = rightLeft;
         root.rightChild = right;
 
         root = root.checkBalance();
 
         expect(root.content).toBe('rightLeft');
         expect(root.leftChild!.content).toBe('root');
         expect(root.rightChild!.content).toBe('right');
     });
 });
 
 describe('Tree', () => {
     it('checks whether it is empty or not', () => {
         const tree = new Tree();
 
         expect(tree.isEmpty()).toBe(true);
         tree.root = new TreeNode(null);
         expect(tree.isEmpty()).toBe(false);
     });
 
     it('returns an inorder string representation of its tree nodes contents', () => {
         const tree = new Tree();
         const root = new TreeNode({ toString: () => 'root' });
         const leftLeaf = new TreeNode({ toString: () => 'left' });
         const rightLeaf = new TreeNode({ toString: () => 'right' });
 
         root.leftChild = leftLeaf;
         root.rightChild = rightLeaf;
         tree.root = root;
 
         expect(tree.toString()).toBe('leftrootright');
     });
 
     it('returns an inorder list of its tree nodes contents', () => {
         const tree = new Tree();
         const root = new TreeNode({ toString: () => 'root' });
         const leftLeaf = new TreeNode({ toString: () => 'left' });
         const rightLeaf = new TreeNode({ toString: () => 'right' });
 
         tree.root = root;
         root.leftChild = leftLeaf;
         root.rightChild = rightLeaf;
 
         const inorderList = tree.inorderList();
 
         expect(inorderList[0]!.toString()).toBe('left');
         expect(inorderList[1]!.toString()).toBe('root');
         expect(inorderList[2]!.toString()).toBe('right');
     });
 
     it('executes a function inorder on its tree nodes contents', () => {
         const tree = new Tree();
         const root = new TreeNode({ toString: () => 'root' });
         const leftLeaf = new TreeNode({ toString: () => 'left' });
         const rightLeaf = new TreeNode({ toString: () => 'right' });
 
         tree.root = root;
         root.leftChild = leftLeaf;
         root.rightChild = rightLeaf;
 
         let result = '';
         tree.inorderDo((node) => (result += node!.toString()));
         expect(result).toBe('leftrootright');
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