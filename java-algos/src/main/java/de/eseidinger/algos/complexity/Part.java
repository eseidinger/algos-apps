package de.eseidinger.algos.complexity;


class Part implements Conditional {
    private final String name;
    private final Condition condition;

    public Part(String name, Condition condition) {
        this.name = name;
        this.condition = condition;
    }

    @Override
    public Condition getCondition() {
        return condition;
    }

    @Override
    public String toString() {
        return name;
    }
}
