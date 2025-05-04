package de.eseidinger.algos.complexity;

import java.util.*;
import java.util.stream.Collectors;

public class BooleanExpression {
    private final AstNode ast;

    public BooleanExpression(String expression) {
        BooleanExpressionParser parser = new BooleanExpressionParser(expression);
        this.ast = parser.parse();
    }

    private boolean evaluateNode(AstNode node, Map<String, Boolean> context) {
        switch (node.type) {
            case IDENTIFIER -> {
                if (!context.containsKey(node.value)) {
                    throw new IllegalArgumentException("Identifier \"" + node.value + "\" is not defined in the context");
                }
                return context.get(node.value);
            }
            case NOT -> {
                return !evaluateNode(node.operand, context);
            }
            case AND -> {
                return evaluateNode(node.left, context) && evaluateNode(node.right, context);
            }
            case OR -> {
                return evaluateNode(node.left, context) || evaluateNode(node.right, context);
            }
            default -> throw new IllegalArgumentException("Unknown node type \"" + node.type + "\"");
        }
    }

    public boolean evaluate(Map<String, Boolean> context) {
        return evaluateNode(ast, context);
    }

    public List<Integer> getMinterms(List<String> identifiers) {
        List<String> reversedIdentifiers = new ArrayList<>(identifiers);
        Collections.reverse(reversedIdentifiers);
        List<Integer> minterms = new ArrayList<>();
        int numIdentifiers = identifiers.size();

        for (int i = 0; i < (1 << numIdentifiers); i++) {
            Map<String, Boolean> context = new HashMap<>();
            for (int j = 0; j < numIdentifiers; j++) {
                context.put(reversedIdentifiers.get(j), (i & (1 << j)) != 0);
            }
            if (evaluate(context)) {
                minterms.add(i);
            }
        }

        return minterms;
    }

    public List<String> getIdentifiers() {
        Set<String> identifiers = new HashSet<>();

        collectIdentifiers(ast, identifiers);

        return new ArrayList<>(identifiers);
    }

    private void collectIdentifiers(AstNode node, Set<String> identifiers) {
        switch (node.type) {
            case IDENTIFIER -> identifiers.add(node.value);
            case NOT -> collectIdentifiers(node.operand, identifiers);
            case AND, OR -> {
                collectIdentifiers(node.left, identifiers);
                collectIdentifiers(node.right, identifiers);
            }
        }
    }

    public static BooleanExpression sopFromMinterms(List<Integer> minterms, List<String> identifiers) {
        int numIdentifiers = identifiers.size();

        List<String> sopTerms = minterms.stream().map(minterm -> {
            List<String> term = new ArrayList<>();
            for (int i = 0; i < numIdentifiers; i++) {
                if ((minterm & (1 << i)) != 0) {
                    term.add(identifiers.get(i));
                } else {
                    term.add("!" + identifiers.get(i));
                }
            }
            return "(" + String.join(" & ", term) + ")";
        }).collect(Collectors.toList());

        String sopExpression = String.join(" | ", sopTerms);

        return new BooleanExpression(sopExpression);
    }
}
