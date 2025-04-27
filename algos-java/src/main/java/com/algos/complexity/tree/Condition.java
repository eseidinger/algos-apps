import java.util.List;

public class Condition {
    private BooleanExpression condition;

    public Condition(BooleanExpression condition) {
        this.condition = condition;
    }

    public boolean testCondition(Variant variant) {
        var dict = variant.toDict();
        var relevantExpression = getBooleanExpressionForRelevantSymbols(variant.getAttributes().stream().map(Attribute::getSymbol).toList());
        return relevantExpression.evaluate(dict);
    }

    public boolean freeSymbolsEqualTo(List<String> relevantSymbols) {
        var freeSymbols = condition.getIdentifiers();
        return freeSymbols.size() == relevantSymbols.size() && freeSymbols.stream().allMatch(relevantSymbols::contains);
    }

    private BooleanExpression getBooleanExpressionForRelevantSymbols(List<String> relevantSymbols) {
        if (relevantSymbols.isEmpty()) {
            return new BooleanTrue();
        }
        if (freeSymbolsEqualTo(relevantSymbols)) {
            return condition;
        }
        var orderedSymbols = relevantSymbols.stream()
                .toList();
        orderedSymbols.addAll(condition.getIdentifiers().stream()
                .filter(symbol -> !relevantSymbols.contains(symbol))
                .toList());
        var minterms = condition.getMinterms(orderedSymbols);
        int nofIrrelevantSymbols = orderedSymbols.size() - relevantSymbols.size();
        var mintermsShifted = minterms.stream()
                .map(minterm -> minterm >> nofIrrelevantSymbols)
                .toList();
        var minifiedMinterms = new java.util.HashSet<>(mintermsShifted);
        return BooleanExpression.sopFromMinterms(minifiedMinterms, relevantSymbols);
    }
}