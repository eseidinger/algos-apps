package de.eseidinger.complexity.tree;

public class Attribute {
    String symbol;
    Boolean value;

    public Attribute(String symbol, Boolean value) {
        this.symbol = symbol;
        this.value = value;
    }

    public String getSymbol() {
        return symbol;
    }

    public Boolean getValue() {
        return value;
    }

    public void setValue(Boolean value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return symbol + ": " + value;
    }
}