import { BooleanExpressionParser, BooleanExpression } from '../../../src/complexity/tree/boolean-expression';

describe('BooleanExpressionParser', () => {
    describe('tokenize', () => {
        it('should tokenize a simple identifier', () => {
            const parser = new BooleanExpressionParser('A');
            parser['tokenize']();
            expect(parser['tokens']).toEqual([{ type: 'IDENTIFIER', value: 'A' }]);
        });

        it('should tokenize logical operators', () => {
            const parser = new BooleanExpressionParser('A & B | !C');
            parser['tokenize']();
            expect(parser['tokens']).toEqual([
                { type: 'IDENTIFIER', value: 'A' },
                { type: 'AND', value: '&' },
                { type: 'IDENTIFIER', value: 'B' },
                { type: 'OR', value: '|' },
                { type: 'NOT', value: '!' },
                { type: 'IDENTIFIER', value: 'C' },
            ]);
        });

        it('should tokenize parentheses', () => {
            const parser = new BooleanExpressionParser('(A & B)');
            parser['tokenize']();
            expect(parser['tokens']).toEqual([
                { type: 'LPAREN', value: '(' },
                { type: 'IDENTIFIER', value: 'A' },
                { type: 'AND', value: '&' },
                { type: 'IDENTIFIER', value: 'B' },
                { type: 'RPAREN', value: ')' },
            ]);
        });

        it('should handle mixed expressions with spaces', () => {
            const parser = new BooleanExpressionParser('  A  &  ( B | !C ) ');
            parser['tokenize']();
            expect(parser['tokens']).toEqual([
                { type: 'IDENTIFIER', value: 'A' },
                { type: 'AND', value: '&' },
                { type: 'LPAREN', value: '(' },
                { type: 'IDENTIFIER', value: 'B' },
                { type: 'OR', value: '|' },
                { type: 'NOT', value: '!' },
                { type: 'IDENTIFIER', value: 'C' },
                { type: 'RPAREN', value: ')' },
            ]);
        });

        it('should throw an error for invalid characters', () => {
            const parser = new BooleanExpressionParser('A @ B');
            expect(() => parser['tokenize']()).toThrowError();
        });
    });

    describe('parse', () => {
        it('should parse a simple AND expression', () => {
            const parser = new BooleanExpressionParser('A & B');
            const ast = parser.parse();
            expect(ast).toEqual({
                type: 'AND',
                left: { type: 'IDENTIFIER', value: 'A' },
                operator: { type: 'AND', value: '&' },
                right: { type: 'IDENTIFIER', value: 'B' },
            });
        });

        it('should parse a nested expression with parentheses', () => {
            const parser = new BooleanExpressionParser('(A | B) & C');
            const ast = parser.parse();
            expect(ast).toEqual({
                type: 'AND',
                left: {
                    type: 'OR',
                    left: { type: 'IDENTIFIER', value: 'A' },
                    operator: { type: 'OR', value: '|' },
                    right: { type: 'IDENTIFIER', value: 'B' },
                },
                operator: { type: 'AND', value: '&' },
                right: { type: 'IDENTIFIER', value: 'C' },
            });
        });

        it('should throw an error for mismatched parentheses', () => {
            const parser = new BooleanExpressionParser('(A & B');
            expect(() => parser.parse()).toThrowError('Expected closing parenthesis');
        });
    });
});

describe('BooleanExpression', () => {
    describe('evaluate', () => {
        it('should evaluate a simple AND expression', () => {
            const expr = new BooleanExpression('A & B');
            const result = expr.evaluate(new Map([['A', true], ['B', false]]));
            expect(result).toBe(false);
        });

        it('should evaluate a nested expression', () => {
            const expr = new BooleanExpression('(A | B) & C');
            const result = expr.evaluate(new Map([['A', true], ['B', false], ['C', true]]));
            expect(result).toBe(true);
        });

        it('should throw an error for undefined identifiers', () => {
            const expr = new BooleanExpression('A & B');
            expect(() => expr.evaluate(new Map([['A', true]]))).toThrowError(
                'Identifier "B" is not defined in the context'
            );
        });
    });

    describe('getMinterms', () => {
        it('should return correct minterms for a simple expression', () => {
            const expr = new BooleanExpression('A & B');
            const minterms = expr.getMinterms(['A', 'B']);
            expect(minterms).toEqual([3]); // Binary 11
        });

        it('should return correct minterms for a complex expression', () => {
            const expr = new BooleanExpression('(A | B) & C');
            const minterms = expr.getMinterms(['A', 'B', 'C']);
            expect(minterms).toEqual([3, 4, 5, 6, 7]); // Binary 011, 101, 110, 111
        });
    });

    describe('getIdentifiers', () => {
        it('should return all identifiers in the expression', () => {
            const expr = new BooleanExpression('(A | B) & C');
            const identifiers = expr.getIdentifiers();
            expect(identifiers).toEqual(['A', 'B', 'C']);
        });
    });

    describe('sopFromMinterms', () => {
        it('should generate the correct SOP expression', () => {
            const expr = BooleanExpression.sopFromMinterms([3], ['A', 'B']);
            expect(expr.evaluate(new Map([['A', true], ['B', true]]))).toBe(true);
            expect(expr.evaluate(new Map([['A', true], ['B', false]]))).toBe(false);
        });
    });
});