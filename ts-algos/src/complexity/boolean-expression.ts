type Token = { type: 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN' | 'IDENTIFIER'; value: string };

type AstNode = {
    type: 'AND' | 'OR' | 'NOT' | 'IDENTIFIER';
    left?: AstNode;
    right?: AstNode;
    operator?: Token;
    operand?: AstNode;
    value?: string;
}

export class BooleanExpressionParser {
    private tokens: Token[] = [];
    private current = 0;

    constructor(private expression: string) {}

    private tokenize(): void {
        const regex = /\s*(&|\||!|\(|\)|[A-Za-z_][A-Za-z0-9_]*)\s*/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(this.expression)) !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, token] = match;
            if (token === '&') {
                this.tokens.push({ type: 'AND', value: token });
            } else if (token === '|') {
                this.tokens.push({ type: 'OR', value: token });
            } else if (token === '!') {
                this.tokens.push({ type: 'NOT', value: token });
            } else if (token === '(') {
                this.tokens.push({ type: 'LPAREN', value: token });
            } else if (token === ')') {
                this.tokens.push({ type: 'RPAREN', value: token });
            } else {
                this.tokens.push({ type: 'IDENTIFIER', value: token });
            }
        }
    }

    private peek(): Token | null {
        return this.current < this.tokens.length ? this.tokens[this.current] : null;
    }

    private consume(): Token | null {
        return this.tokens[this.current++] || null;
    }

    private parseExpression(): AstNode {
        let node = this.parseTerm();

        while (this.peek()?.type === 'OR') {
            const operator = this.consume()!;
            const right = this.parseTerm();
            node = { type: 'OR', left: node, operator, right };
        }

        return node;
    }

    private parseTerm(): AstNode {
        let node = this.parseFactor();

        while (this.peek()?.type === 'AND') {
            const operator = this.consume()!;
            const right = this.parseFactor();
            node = { type: 'AND', left: node, operator, right };
        }

        return node;
    }

    private parseFactor(): AstNode {
        if (this.peek()?.type === 'NOT') {
            const operator = this.consume()!;
            const operand = this.parseFactor();
            return { type: 'NOT', operator, operand };
        }

        if (this.peek()?.type === 'LPAREN') {
            this.consume();
            const node = this.parseExpression();
            if (this.peek()?.type !== 'RPAREN') {
                throw new Error('Expected closing parenthesis');
            }
            this.consume();
            return node;
        }

        const token = this.consume();
        if (token?.type === 'IDENTIFIER') {
            return { type: 'IDENTIFIER', value: token.value };
        }

        throw new Error('Unexpected token');
    }

    public parse(): AstNode {
        this.tokenize();
        const ast = this.parseExpression();
        if (this.current < this.tokens.length) {
            throw new Error('Unexpected input after parsing');
        }
        return ast;
    }
}

export class BooleanExpression {
    private ast: AstNode;

    constructor(expression: string) {
        const parser = new BooleanExpressionParser(expression);
        this.ast = parser.parse();
    }

    private evaluateNode(node: AstNode, context: Record<string, boolean>): boolean {
        switch (node.type) {
            case 'IDENTIFIER':
                if (!Object.prototype.hasOwnProperty.call(context, node.value!)) {
                    throw new Error(`Identifier "${node.value}" is not defined in the context`);
                }
                return context[node.value!];
            case 'NOT':
                return !this.evaluateNode(node.operand!, context);
            case 'AND':
                return this.evaluateNode(node.left!, context) && this.evaluateNode(node.right!, context);
            case 'OR':
                return this.evaluateNode(node.left!, context) || this.evaluateNode(node.right!, context);
            default:
                throw new Error(`Unknown node type "${node.type}"`);
        }
    }

    public evaluate(context: Record<string, boolean>): boolean {
        return this.evaluateNode(this.ast, context);
    }

    public getMinterms(identifiers: string[]): number[] {
        const minterms: number[] = [];
        const numIdentifiers = identifiers.length;

        // Generate all possible truth table rows
        for (let i = 0; i < (1 << numIdentifiers); i++) {
            const context: Record<string, boolean> = {};

            // Assign truth values to identifiers based on the binary representation of i
            identifiers.slice().reverse().forEach((identifier, index) => {
                context[identifier] = Boolean((i >> index) & 1);
            });

            // Evaluate the expression for this context
            if (this.evaluate(context)) {
                minterms.push(i);
            }
        }

        return minterms;
    }

    public getIdentifiers(): string[] {
        const identifiers = new Set<string>();

        // Recursive function to collect identifiers
        const collectIdentifiers = (node: AstNode): void => {
            if (node.type === 'IDENTIFIER') {
                identifiers.add(node.value!);
            } else if (node.type === 'NOT') {
                collectIdentifiers(node.operand!);
            } else if (node.type === 'AND' || node.type === 'OR') {
                collectIdentifiers(node.left!);
                collectIdentifiers(node.right!);
            }
        };

        collectIdentifiers(this.ast);
        return Array.from(identifiers);
    }

    public static sopFromMinterms(minterms: number[], identifiers: string[]): BooleanExpression {
        const numIdentifiers = identifiers.length;

        // Generate the SOP form as a string
        const sopTerms = minterms.map((minterm) => {
            const term: string[] = [];

            for (let i = 0; i < numIdentifiers; i++) {
                if ((minterm >> i) & 1) {
                    term.push(identifiers[i]);
                } else {
                    term.push(`!${identifiers[i]}`);
                }
            }

            return `(${term.join(' & ')})`;
        });

        const sopExpression = sopTerms.join(' | ');

        // Create a new BooleanExpression instance
        return new BooleanExpression(sopExpression);
    }
}

export class BooleanTrue extends BooleanExpression {
    constructor() {
        super('1');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override evaluate(_context: Record<string, boolean>): boolean {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override getMinterms(_identifiers: string[]): number[] {
        return [0]; // All minterms are valid for a true expression
    }
}
