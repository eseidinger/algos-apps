package de.eseidinger.algos.complexity;

import java.util.*;

public class VariantTreeExample {

    public static void main(String[] args) {
        String A = "A";
        String B = "B";
        String C = "C";

        // Define the symbol order
        List<List<String>> symbolOrder = List.of(
            List.of(A),
            List.of(B),
            List.of(C)
        );

        // Create the root variant
        Variant rootVariant = VariantNode.createRootVariant(symbolOrder);

        // Define possible variants
        Variant variant1 = new Variant(List.of(
            new Attribute(A, true),
            new Attribute(B, true),
            new Attribute(C, false)
        ));
        Variant variant2 = new Variant(List.of(
            new Attribute(A, true),
            new Attribute(B, false),
            new Attribute(C, true)
        ));
        Variant variant3 = new Variant(List.of(
            new Attribute(A, false),
            new Attribute(B, true),
            new Attribute(C, true)
        ));
        List<Variant> possibleVariants = List.of(variant1, variant2, variant3);

        // Define conditions
        Condition condition1 = new Condition(new BooleanExpression("B & (A | C)"));
        Condition condition2 = new Condition(new BooleanExpression("C & (A | B)"));

        // Define parts
        Part part1 = new Part("Part 1", condition1);
        Part part2 = new Part("Part 2", condition2);
        List<Part> allConditionals = List.of(part1, part2);

        // Create the variant tree
        VariantNode<Part> tree = new VariantNode<>(new ArrayList<>(), rootVariant, symbolOrder, possibleVariants, allConditionals);

        // Print the tree before collapsing
        System.out.println("Before collapsing:");
        VariantTreeUtils.printTree(tree, "+- ", new ArrayList<>(), VariantNode::toString);
    }
}
