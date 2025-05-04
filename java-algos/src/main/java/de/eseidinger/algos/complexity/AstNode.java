package de.eseidinger.algos.complexity;

public class AstNode {
    enum Type { AND, OR, NOT, IDENTIFIER }
    Type type;
    AstNode left;
    AstNode right;
    Token operator;
    AstNode operand;
    String value;

    AstNode(Type type) {
        this.type = type;
    }
}
