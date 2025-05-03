import { BooleanExpression } from "./boolean-expression";
import { Attribute, Condition, Part, printTree, Variant, VariantNode } from "./variant-tree";

const A = "A";
const B = "B";
const C = "C";

const symbolOrder = [[A], [B], [C]];
const rootVariant = VariantNode.createRootVariant(symbolOrder);

const variant1 = new Variant([
    new Attribute(A, true),
    new Attribute(B, true),
    new Attribute(C, false)
]);
const variant2 = new Variant([
    new Attribute(A, true),
    new Attribute(B, false),
    new Attribute(C, true)
]);
const variant3 = new Variant([
    new Attribute(A, false),
    new Attribute(B, true),
    new Attribute(C, true)
]);
const possibleVariants = [variant1, variant2, variant3];

const condition1 = new Condition(new BooleanExpression("B & (A | C)"));
const condition2 = new Condition(new BooleanExpression("C & (A | B)"));

const part1 = new Part("Part 1", condition1);
const part2 = new Part("Part 2", condition2);
const allConditionals = [part1, part2];

const tree = new VariantNode([], rootVariant, symbolOrder, possibleVariants, allConditionals);
console.log("Before collapsing:");
printTree(tree);
