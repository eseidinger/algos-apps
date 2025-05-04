package de.eseidinger.algos.complexity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

class Condition {
    private final BooleanExpression condition;
    private final Map<String, BooleanExpression> lenientConditionCache;

    public Condition(BooleanExpression condition) {
        this.condition = condition;
        this.lenientConditionCache = new HashMap<>();
    }

    public boolean check(Variant variant) {
        List<String> relevantSymbols = variant.getSortedAttributes().stream()
                .filter(attr -> attr.getValue() != null)
                .map(Attribute::getSymbol)
                .collect(Collectors.toList());
        BooleanExpression relevantCondition = getRelevantCondition(relevantSymbols);
        return relevantCondition.evaluate(variant.toDict());
    }

    private BooleanExpression getRelevantCondition(List<String> relevantSymbols) {
        String cacheKey = String.join(",", relevantSymbols.stream().sorted().toList());
        if (lenientConditionCache.containsKey(cacheKey)) {
            return lenientConditionCache.get(cacheKey);
        }

        List<String> symbolsInCondition = condition.getIdentifiers();
        List<String> symbols = new ArrayList<>(relevantSymbols);
        for (String symbol : symbolsInCondition) {
            if (!symbols.contains(symbol)) {
                symbols.add(symbol);
            }
        }

        int numberOfIrrelevantSymbols = symbolsInCondition.size() - relevantSymbols.size();
        if (numberOfIrrelevantSymbols == 0) {
            lenientConditionCache.put(cacheKey, condition);
            return condition;
        }

        List<Integer> minterms = condition.getMinterms(symbols);
        Set<Integer> shiftedMinterms = minterms.stream()
                .map(minterm -> minterm >> numberOfIrrelevantSymbols)
                .collect(Collectors.toSet());
        BooleanExpression relevantExpression = BooleanExpression.sopFromMinterms(
                new ArrayList<>(shiftedMinterms), relevantSymbols);
        lenientConditionCache.put(cacheKey, relevantExpression);
        return relevantExpression;
    }
}
