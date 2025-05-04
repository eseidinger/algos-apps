package de.eseidinger.algos.complexity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.*;

class VariantTreeTest {

    @Test
    void testAttributeToString() {
        Attribute attributeTrue = new Attribute("A", true);
        Attribute attributeFalse = new Attribute("A", false);
        Attribute attributeNone = new Attribute("A", null);

        assertEquals("A: true", attributeTrue.toString());
        assertEquals("A: false", attributeFalse.toString());
        assertEquals("A: null", attributeNone.toString());
    }

    @Test
    void testVariantToString() {
        List<Attribute> attributes = List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", null)
        );
        Variant variant = new Variant(attributes);

        assertEquals("{A: true, B: false, C: null}", variant.toString());
    }

    @Test
    void testVariantSortedAttributes() {
        List<Attribute> attributes = List.of(
            new Attribute("B", false),
            new Attribute("C", null),
            new Attribute("A", true)
        );
        Variant variant = new Variant(attributes);

        List<Attribute> sortedAttributes = variant.getSortedAttributes();
        assertEquals("A", sortedAttributes.get(0).getSymbol());
        assertEquals("B", sortedAttributes.get(1).getSymbol());
        assertEquals("C", sortedAttributes.get(2).getSymbol());
    }

    @Test
    void testVariantToDict() {
        List<Attribute> attributes = List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", null)
        );
        Variant variant = new Variant(attributes);

        Map<String, Boolean> expectedDict = Map.of("A", true, "B", false);
        assertEquals(expectedDict, variant.toDict());
    }

    @Test
    void testVariantDeriveVariant() {
        List<Attribute> attributes = List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", null)
        );
        Variant variant = new Variant(attributes);

        Variant derivedVariant = variant.deriveVariant("C", true);
        assertEquals("{A: true, B: false, C: true}", derivedVariant.toString());
    }

    @Test
    void testVariantDeriveVariants() {
        Variant originalVariant = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", null),
            new Attribute("C", null)
        ));

        List<Variant> derivedVariants = originalVariant.deriveVariants(
            List.of("B", "C"),
            List.of(
                new boolean[]{true, false},
                new boolean[]{false, true}
            )
        );

        assertEquals("{A: true, B: true, C: false}", derivedVariants.get(0).toString());
        assertEquals("{A: true, B: false, C: true}", derivedVariants.get(1).toString());
    }

    @Test
    void testVariantIsDerivedFromOrEqual() {
        Variant originalVariant = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", null)
        ));
        Variant derivedVariant = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", true)
        ));

        assertTrue(derivedVariant.isDerivedFromOrEqual(originalVariant));
        assertFalse(originalVariant.isDerivedFromOrEqual(derivedVariant));
    }

    @Test
    void testVariantIsPossible() {
        List<Variant> possibleVariants = List.of(
            new Variant(List.of(
                new Attribute("A", true),
                new Attribute("B", true),
                new Attribute("C", false)
            )),
            new Variant(List.of(
                new Attribute("A", true),
                new Attribute("B", true),
                new Attribute("C", true)
            ))
        );

        Variant possibleVariant = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", true),
            new Attribute("C", null)
        ));
        Variant impossibleVariant = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", null)
        ));

        assertTrue(possibleVariant.isPossible(possibleVariants));
        assertFalse(impossibleVariant.isPossible(possibleVariants));
    }

    @Test
    void testVariantIsFinal() {
        Variant variant = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", null)
        ));

        assertFalse(variant.isFinal(List.of("A", "B", "C")));
        assertTrue(variant.isFinal(List.of("A", "B")));
    }

    @Test
    void testVariantIsEmpty() {
        Variant emptyVariant = new Variant(List.of(
            new Attribute("A", null),
            new Attribute("B", null),
            new Attribute("C", null)
        ));
        Variant nonEmptyVariant = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", null)
        ));

        assertTrue(emptyVariant.isEmpty());
        assertFalse(nonEmptyVariant.isEmpty());
    }

    @Test
    void testConditionCheck() {
        BooleanExpression boolExpr = new BooleanExpression("B & (A | C)");
        Condition condition = new Condition(boolExpr);

        Variant variant1 = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", false),
            new Attribute("C", true)
        ));
        assertFalse(condition.check(variant1));

        Variant variant2 = new Variant(List.of(
            new Attribute("A", true),
            new Attribute("B", true),
            new Attribute("C", true)
        ));
        assertTrue(condition.check(variant2));
    }

    @Test
    void testVariantNodeGetLeafNodes() {
        List<String> symbolOrder1 = List.of("A");
        List<String> symbolOrder2 = List.of("B");
        List<String> symbolOrder3 = List.of("C");
        List<List<String>> symbolOrder = List.of(symbolOrder1, symbolOrder2, symbolOrder3);

        Variant rootVariant = VariantNode.createRootVariant(symbolOrder);

        List<Variant> possibleVariants = List.of(
            new Variant(List.of(
                new Attribute("A", true),
                new Attribute("B", true),
                new Attribute("C", false)
            )),
            new Variant(List.of(
                new Attribute("A", true),
                new Attribute("B", false),
                new Attribute("C", true)
            )),
            new Variant(List.of(
                new Attribute("A", false),
                new Attribute("B", true),
                new Attribute("C", true)
            ))
        );

        Condition condition1 = new Condition(new BooleanExpression("B & (A | C)"));
        Condition condition2 = new Condition(new BooleanExpression("C & (A | B)"));

        Part part1 = new Part("Part 1", condition1);
        Part part2 = new Part("Part 2", condition2);
        List<Part> allConditionals = List.of(part1, part2);

        VariantNode<Part> tree = new VariantNode<>(new ArrayList<>(), rootVariant, symbolOrder, possibleVariants, allConditionals);

        List<VariantNode<Part>> leafs = tree.getLeafNodes();
        assertEquals(3, leafs.size());
        assertEquals(possibleVariants.get(2), leafs.get(0).getVariant());
        assertEquals(possibleVariants.get(1), leafs.get(1).getVariant());
        assertEquals(possibleVariants.get(0), leafs.get(2).getVariant());
    }
}
