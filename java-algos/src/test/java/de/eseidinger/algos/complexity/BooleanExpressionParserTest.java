package de.eseidinger.algos.complexity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;

public class BooleanExpressionParserTest {

    @Test
    void shouldTokenizeSimpleIdentifier() {
        BooleanExpressionParser parser = new BooleanExpressionParser("A");
        parser.parse(); // Tokenization happens during parsing
        List<Token> tokens = parser.getTokens(); // Access tokens for verification
        assertEquals(List.of(new Token(Token.Type.IDENTIFIER, "A")), tokens);
    }

    @Test
    void shouldTokenizeLogicalOperators() {
        BooleanExpressionParser parser = new BooleanExpressionParser("A & B | !C");
        parser.parse();
        List<Token> tokens = parser.getTokens();
        assertEquals(
            List.of(
                new Token(Token.Type.IDENTIFIER, "A"),
                new Token(Token.Type.AND, "&"),
                new Token(Token.Type.IDENTIFIER, "B"),
                new Token(Token.Type.OR, "|"),
                new Token(Token.Type.NOT, "!"),
                new Token(Token.Type.IDENTIFIER, "C")
            ),
            tokens
        );
    }

    @Test
    void shouldTokenizeParentheses() {
        BooleanExpressionParser parser = new BooleanExpressionParser("(A & B)");
        parser.parse();
        List<Token> tokens = parser.getTokens();
        assertEquals(
            List.of(
                new Token(Token.Type.LPAREN, "("),
                new Token(Token.Type.IDENTIFIER, "A"),
                new Token(Token.Type.AND, "&"),
                new Token(Token.Type.IDENTIFIER, "B"),
                new Token(Token.Type.RPAREN, ")")
            ),
            tokens
        );
    }

    @Test
    void shouldHandleMixedExpressionsWithSpaces() {
        BooleanExpressionParser parser = new BooleanExpressionParser("  A  &  ( B | !C ) ");
        parser.parse();
        List<Token> tokens = parser.getTokens();
        assertEquals(
            List.of(
                new Token(Token.Type.IDENTIFIER, "A"),
                new Token(Token.Type.AND, "&"),
                new Token(Token.Type.LPAREN, "("),
                new Token(Token.Type.IDENTIFIER, "B"),
                new Token(Token.Type.OR, "|"),
                new Token(Token.Type.NOT, "!"),
                new Token(Token.Type.IDENTIFIER, "C"),
                new Token(Token.Type.RPAREN, ")")
            ),
            tokens
        );
    }

    @Test
    void shouldThrowErrorForInvalidCharacters() {
        BooleanExpressionParser parser = new BooleanExpressionParser("A @ B");
        assertThrows(IllegalArgumentException.class, parser::parse);
    }

    @Test
    void shouldParseSimpleAndExpression() {
        BooleanExpressionParser parser = new BooleanExpressionParser("A & B");
        AstNode ast = parser.parse();
        assertEquals(AstNode.Type.AND, ast.type);
        assertEquals("A", ast.left.value);
        assertEquals("B", ast.right.value);
    }

    @Test
    void shouldParseNestedExpressionWithParentheses() {
        BooleanExpressionParser parser = new BooleanExpressionParser("(A | B) & C");
        AstNode ast = parser.parse();
        assertEquals(AstNode.Type.AND, ast.type);
        assertEquals(AstNode.Type.OR, ast.left.type);
        assertEquals("A", ast.left.left.value);
        assertEquals("B", ast.left.right.value);
        assertEquals("C", ast.right.value);
    }

    @Test
    void shouldThrowErrorForMismatchedParentheses() {
        BooleanExpressionParser parser = new BooleanExpressionParser("(A & B");
        assertThrows(IllegalArgumentException.class, parser::parse);
    }
}
