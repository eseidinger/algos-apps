package de.eseidinger.algos.complexity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

public class BooleanExpressionTest {

    @Test
    void shouldEvaluateSimpleAndExpression() {
        BooleanExpression expr = new BooleanExpression("A & B");
        Map<String, Boolean> context = Map.of("A", true, "B", false);
        assertFalse(expr.evaluate(context));
    }

    @Test
    void shouldEvaluateNestedExpression() {
        BooleanExpression expr = new BooleanExpression("(A | B) & C");
        Map<String, Boolean> context = Map.of("A", true, "B", false, "C", true);
        assertTrue(expr.evaluate(context));
    }

    @Test
    void shouldThrowErrorForUndefinedIdentifiers() {
        BooleanExpression expr = new BooleanExpression("A & B");
        Map<String, Boolean> context = Map.of("A", true);
        assertThrows(IllegalArgumentException.class, () -> expr.evaluate(context));
    }

    @Test
    void shouldReturnCorrectMintermsForSimpleExpression() {
        BooleanExpression expr = new BooleanExpression("A & B");
        List<Integer> minterms = expr.getMinterms(List.of("A", "B"));
        assertEquals(List.of(3), minterms); // Binary 11
    }

    @Test
    void shouldReturnCorrectMintermsForComplexExpression() {
        BooleanExpression expr = new BooleanExpression("(A | B) & C");
        List<Integer> minterms = expr.getMinterms(List.of("A", "B", "C"));
        assertEquals(List.of(3, 5, 7), minterms); // Binary 011, 101, 111
    }

    @Test
    void shouldReturnAllIdentifiersInExpression() {
        BooleanExpression expr = new BooleanExpression("(A | B) & C");
        List<String> identifiers = expr.getIdentifiers();
        assertEquals(List.of("A", "B", "C"), identifiers);
    }

    @Test
    void shouldGenerateCorrectSOPExpression() {
        BooleanExpression expr = BooleanExpression.sopFromMinterms(List.of(3), List.of("A", "B"));
        Map<String, Boolean> contextTrue = Map.of("A", true, "B", true);
        Map<String, Boolean> contextFalse = Map.of("A", true, "B", false);
        assertTrue(expr.evaluate(contextTrue));
        assertFalse(expr.evaluate(contextFalse));
    }
}
