package de.eseidinger.algos.complexity;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BooleanExpressionParser {
    private List<Token> tokens = new ArrayList<>();
    private int current = 0;
    private final String expression;

    public BooleanExpressionParser(String expression) {
        this.expression = expression;
    }

    public List<Token> getTokens() {
        return tokens;
    }

    private void tokenize() {
        Pattern pattern = Pattern.compile("\\s*(&|\\||!|\\(|\\)|[A-Za-z_][A-Za-z0-9_]*)\\s*");
        Matcher matcher = pattern.matcher(expression);

        while (matcher.find()) {
            String token = matcher.group(1);
            switch (token) {
                case "&" -> tokens.add(new Token(Token.Type.AND, token));
                case "|" -> tokens.add(new Token(Token.Type.OR, token));
                case "!" -> tokens.add(new Token(Token.Type.NOT, token));
                case "(" -> tokens.add(new Token(Token.Type.LPAREN, token));
                case ")" -> tokens.add(new Token(Token.Type.RPAREN, token));
                default -> tokens.add(new Token(Token.Type.IDENTIFIER, token));
            }
        }
    }

    private Token peek() {
        return current < tokens.size() ? tokens.get(current) : null;
    }

    private Token consume() {
        return current < tokens.size() ? tokens.get(current++) : null;
    }

    private AstNode parseExpression() {
        AstNode node = parseTerm();

        while (peek() != null && peek().type == Token.Type.OR) {
            Token operator = consume();
            AstNode right = parseTerm();
            AstNode newNode = new AstNode(AstNode.Type.OR);
            newNode.left = node;
            newNode.operator = operator;
            newNode.right = right;
            node = newNode;
        }

        return node;
    }

    private AstNode parseTerm() {
        AstNode node = parseFactor();

        while (peek() != null && peek().type == Token.Type.AND) {
            Token operator = consume();
            AstNode right = parseFactor();
            AstNode newNode = new AstNode(AstNode.Type.AND);
            newNode.left = node;
            newNode.operator = operator;
            newNode.right = right;
            node = newNode;
        }

        return node;
    }

    private AstNode parseFactor() {
        if (peek() != null && peek().type == Token.Type.NOT) {
            Token operator = consume();
            AstNode operand = parseFactor();
            AstNode node = new AstNode(AstNode.Type.NOT);
            node.operator = operator;
            node.operand = operand;
            return node;
        }

        if (peek() != null && peek().type == Token.Type.LPAREN) {
            consume();
            AstNode node = parseExpression();
            if (peek() == null || peek().type != Token.Type.RPAREN) {
                throw new IllegalArgumentException("Expected closing parenthesis");
            }
            consume();
            return node;
        }

        Token token = consume();
        if (token != null && token.type == Token.Type.IDENTIFIER) {
            AstNode node = new AstNode(AstNode.Type.IDENTIFIER);
            node.value = token.value;
            return node;
        }

        throw new IllegalArgumentException("Unexpected token");
    }

    public AstNode parse() {
        tokenize();
        AstNode ast = parseExpression();
        if (current < tokens.size()) {
            throw new IllegalArgumentException("Unexpected input after parsing");
        }
        return ast;
    }
}
