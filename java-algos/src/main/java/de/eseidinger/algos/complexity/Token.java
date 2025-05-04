package de.eseidinger.algos.complexity;

public class Token {
    enum Type { AND, OR, NOT, LPAREN, RPAREN, IDENTIFIER }
    Type type;
    String value;

    Token(Type type, String value) {
        this.type = type;
        this.value = value;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Token)) return false;
        Token other = (Token) obj;
        return type == other.type && value.equals(other.value);
    }

    @Override
    public int hashCode() {
        return 31 * type.hashCode() + value.hashCode();
    }
}
