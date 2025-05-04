package de.eseidinger.algos.complexity;

import java.util.List;
import java.util.Map;

class BooleanTrue extends BooleanExpression {
    public BooleanTrue() {
        super("1");
    }

    @Override
    public boolean evaluate(Map<String, Boolean> context) {
        return true;
    }

    @Override
    public List<Integer> getMinterms(List<String> identifiers) {
        return List.of(0);
    }
}
