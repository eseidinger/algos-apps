package de.eseidinger.algos.complexity;

public class Attribute {
    private final String symbol;
    private final Boolean value;

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

    @Override
    public String toString() {
        return symbol + ": " + value;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Attribute)) return false;
        Attribute other = (Attribute) obj;
        return symbol.equals(other.symbol) && value.equals(other.value);
    }

    @Override
    public int hashCode() {
        return 31 * symbol.hashCode() + (value != null ? value.hashCode() : 0);
    }
}
