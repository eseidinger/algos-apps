package de.eseidinger.complexity.tree;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.logicng.datastructures.Assignment;
import org.logicng.formulas.Formula;
import org.logicng.formulas.FormulaFactory;
import org.logicng.formulas.Literal;
import org.logicng.io.parsers.ParserException;
import org.logicng.io.parsers.PropositionalParser;

public class Condition {
    private Formula condition;
    private FormulaFactory factory;

    public Condition(Formula condition, FormulaFactory factory) {
        this.condition = condition;
        this.factory = factory;
    }

    public boolean testCondition(Variant variant) {
        List<String> relevantSymbols = variant.getSortedAttributes().stream()
                .filter(attribute -> attribute.getValue() != null)
                .map(Attribute::getSymbol)
                .toList();
        var relevantExpression = getBooleanExpressionForRelevantSymbols(relevantSymbols);
        var assignment = variant.toAssignment(factory);
        return relevantExpression.evaluate(assignment);
    }

    public boolean freeSymbolsEqualTo(List<String> relevantSymbols) {
        var freeSymbols = condition.literals().stream().map(Literal::name).toList();
        return freeSymbols.size() == relevantSymbols.size() && freeSymbols.stream().allMatch(relevantSymbols::contains);
    }

    private List<Integer> getMinterms(List<String> orderedSymbols) {
        var minterms = new ArrayList<Integer>();
        for (int i = 0; i < Math.pow(2, orderedSymbols.size()); i++) {
            var assignment = new Assignment();
            for (int j = 0; j < orderedSymbols.size(); j++) {
                Literal n = factory.literal(orderedSymbols.get(j), (i & (1 << j)) != 0);
                assignment.addLiteral(n);
            }
            if (this.condition.evaluate(assignment)) {
                minterms.add(i);
            }
        }
        return minterms;
    }

    private Formula dnfFromMinterms(List<Integer> minterms, List<String> orderedSymbols) {
        StringBuilder dnf = new StringBuilder();
        for (int i = 0; i < minterms.size(); i++) {
            int minterm = minterms.get(i);
            if (i > 0) {
                dnf.append(" | ");
            }
            dnf.append("(");
            for (int j = 0; j < orderedSymbols.size(); j++) {
                if ((minterm & (1 << j)) != 0) {
                    dnf.append(orderedSymbols.get(j));
                } else {
                    dnf.append("~").append(orderedSymbols.get(j));
                }
                if (j < orderedSymbols.size() - 1) {
                    dnf.append(" & ");
                }
            }
            dnf.append(")");
        }
        var parser = new PropositionalParser(this.factory);
        Formula parsedFormula;
        try {
            parsedFormula = parser.parse(dnf.toString());
        } catch (ParserException e) {
            throw new RuntimeException("Error parsing DNF: " + dnf, e);
        }
        return parsedFormula;
    }

    private Formula getBooleanExpressionForRelevantSymbols(List<String> relevantSymbols) {
        if (relevantSymbols.isEmpty()) {
            return new FormulaFactory().constant(true);
        }
        if (freeSymbolsEqualTo(relevantSymbols)) {
            return condition;
        }
        var orderedSymbols = relevantSymbols.stream()
                .toList();
        orderedSymbols.addAll(condition.literals().stream().map(Literal::name)
                .filter(symbol -> !relevantSymbols.contains(symbol))
                .toList());
        var minterms = this.getMinterms(orderedSymbols);
        int nofIrrelevantSymbols = orderedSymbols.size() - relevantSymbols.size();
        var mintermsShifted = minterms.stream()
                .map(minterm -> minterm >> nofIrrelevantSymbols)
                .toList();
        var minifiedMinterms = new HashSet<>(mintermsShifted);
        var dnf = dnfFromMinterms(new ArrayList<>(minifiedMinterms), orderedSymbols);
        return dnf;
    }
}