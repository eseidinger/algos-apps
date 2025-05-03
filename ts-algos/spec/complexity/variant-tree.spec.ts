/**
 * Test the functionality of the VariantTree module.
 * This module contains tests for the VariantTree class and its methods.
 */

import { BooleanExpression } from "../../src/complexity/boolean-expression";
import { Attribute, Variant, Condition, Part, VariantNode } from "../../src/complexity/variant-tree";

describe("VariantTree Tests", () => {

    describe("Attribute Class Tests", () => {
        it("should return the correct string representation of an Attribute", () => {
            const A = "A";
            const attributeTrue = new Attribute(A, true);
            const attributeFalse = new Attribute(A, false);
            const attributeNone = new Attribute(A, null);

            expect(attributeTrue.toString()).toBe("A: true");
            expect(attributeFalse.toString()).toBe("A: false");
            expect(attributeNone.toString()).toBe("A: null");
        });
    });

    describe("Variant Class Tests", () => {
        it("should return the correct string representation of a Variant", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const attributes = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)];
            const variant = new Variant(attributes);

            expect(variant.toString()).toBe("{A: true, B: false, C: null}");
        });

        it("should return sorted attributes", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const attributes = [new Attribute(B, false), new Attribute(C, null), new Attribute(A, true)];
            const variant = new Variant(attributes);

            const sortedAttributes = variant.getSortedAttributes();
            expect(sortedAttributes[0].symbol).toBe(A);
            expect(sortedAttributes[1].symbol).toBe(B);
            expect(sortedAttributes[2].symbol).toBe(C);
        });

        it("should return the correct dictionary representation of a Variant", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const attributes = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)];
            const variant = new Variant(attributes);

            expect(variant.toDict()).toEqual({ A: true, B: false });
        });

        it("should derive a new Variant with a specific attribute value", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const attributes = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)];
            const variant = new Variant(attributes);

            const derivedVariant = variant.deriveVariant(C, true);
            expect(derivedVariant.toString()).toBe("{A: true, B: false, C: true}");
        });

        it("should derive multiple Variants with specific attribute values", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const originalVariant = new Variant([new Attribute(A, true), new Attribute(B, null), new Attribute(C, null)]);
            const derivedVariants = originalVariant.deriveVariants([B, C], [
                [true, false],
                [false, true],
            ]);

            expect(derivedVariants[0].toString()).toBe("{A: true, B: true, C: false}");
            expect(derivedVariants[1].toString()).toBe("{A: true, B: false, C: true}");
        });

        it("should check equality of Variants", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const attributes1 = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)];
            const attributes2 = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)];
            const attributes3 = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, true)];

            const variant1 = new Variant(attributes1);
            const variant2 = new Variant(attributes2);
            const variant3 = new Variant(attributes3);

            expect(variant1).toEqual(variant2);
            expect(variant1).not.toEqual(variant3);
        });

        it("should check if a Variant is derived from or equal to another Variant", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const originalVariant = new Variant([new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)]);
            const derivedVariant = new Variant([new Attribute(A, true), new Attribute(B, false), new Attribute(C, true)]);

            expect(derivedVariant.isDerivedFromOrEqual(originalVariant)).toBe(true);
            expect(originalVariant.isDerivedFromOrEqual(derivedVariant)).toBe(false);
        });

        it("should check if a Variant is possible", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const possibleVariants = [
                new Variant([new Attribute(A, true), new Attribute(B, true), new Attribute(C, false)]),
                new Variant([new Attribute(A, true), new Attribute(B, true), new Attribute(C, true)]),
            ];

            const possibleVariant = new Variant([new Attribute(A, true), new Attribute(B, true), new Attribute(C, null)]);
            const impossibleVariant = new Variant([new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)]);

            expect(possibleVariant.isPossible(possibleVariants)).toBe(true);
            expect(impossibleVariant.isPossible(possibleVariants)).toBe(false);
        });

        it("should check if a Variant is final", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const attributes = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)];
            const variant = new Variant(attributes);

            expect(variant.isFinal([A, B, C])).toBe(false);
            expect(variant.isFinal([A, B])).toBe(true);
        });

        it("should check if a Variant is empty", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const emptyVariant = new Variant([new Attribute(A, null), new Attribute(B, null), new Attribute(C, null)]);
            const nonEmptyVariant = new Variant([new Attribute(A, true), new Attribute(B, false), new Attribute(C, null)]);

            expect(emptyVariant.isEmpty()).toBe(true);
            expect(nonEmptyVariant.isEmpty()).toBe(false);
        });
    });

    describe("Condition Class Tests", () => {
        it("should check if a Variant satisfies a Condition", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const boolExpr = new BooleanExpression("B & (A | C)");
            const condition = new Condition(boolExpr);

            const attributes1 = [new Attribute(A, true), new Attribute(B, false), new Attribute(C, true)];
            const variant1 = new Variant(attributes1);
            expect(condition.check(variant1)).toBe(false);

            const attributes2 = [new Attribute(A, true), new Attribute(B, true), new Attribute(C, true)];
            const variant2 = new Variant(attributes2);
            expect(condition.check(variant2)).toBe(true);
        });
    });

    describe("VariantNode Class Tests", () => {
        it("should get all leaf nodes of a VariantNode tree", () => {
            const A = "A";
            const B = "B";
            const C = "C";

            const symbolOrder = [[A], [B], [C]];
            const rootVariant = VariantNode.createRootVariant(symbolOrder);

            const variant1 = new Variant([new Attribute(A, true), new Attribute(B, true), new Attribute(C, false)]);
            const variant2 = new Variant([new Attribute(A, true), new Attribute(B, false), new Attribute(C, true)]);
            const variant3 = new Variant([new Attribute(A, false), new Attribute(B, true), new Attribute(C, true)]);
            const possibleVariants = [variant1, variant2, variant3];

            const condition1 = new Condition(new BooleanExpression("B & (A | C)"));
            const condition2 = new Condition(new BooleanExpression("C & (A | B)"));

            const part1 = new Part("Part 1", condition1);
            const part2 = new Part("Part 2", condition2);
            const allConditionals = [part1, part2];

            const tree = new VariantNode([], rootVariant, symbolOrder, possibleVariants, allConditionals);

            const leafs = tree.getLeafNodes();
            expect(leafs.length).toBe(3);
            expect(leafs[0].variant).toEqual(variant3);
            expect(leafs[1].variant).toEqual(variant2);
            expect(leafs[2].variant).toEqual(variant1);
        });
    });
});