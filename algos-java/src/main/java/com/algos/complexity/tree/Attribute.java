public class Attribute {
    String symbol;
    Boolean value;

    public Attribute(String symbol, Boolean value) {
        this.symbol = symbol;
        this.value = value;
    }

    @Override
    public String toString() {
        return symbol + ": " + value;
    }
}