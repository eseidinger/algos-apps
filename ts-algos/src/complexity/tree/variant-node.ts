import { BooleanExpression, BooleanTrue } from "./boolean-expression";

export class Attribute {
    symbol: string;
    value?: boolean;

    constructor(symbol: string, value?: boolean) {
        this.symbol = symbol;
        this.value = value;
    }

    toString(): string {
        return `${this.symbol}: ${this.value}`;
    }
}

export class Variant {
    attributes: Attribute[];

    constructor(attributes: Attribute[]) {
        this.attributes = attributes;
    }

    toString(): string {
        return this.attributes.map(attr => attr.toString()).join(" ");
    }

    getSortedAttributes(): Attribute[] {
        return this.attributes.sort((a, b) => a.symbol.toString().localeCompare(b.symbol.toString()));
    }

    toDict(): Map<string, boolean> {
        const dict = new Map<string, boolean>();
        for (const attr of this.attributes) {
            if (attr.value !== undefined) {
                dict.set(attr.symbol, attr.value);
            }
        }
        return dict;
    }

    isSubvariantOf(otherVariant: Variant): boolean {
        const sortedSelf = this.getSortedAttributes();
        const sortedOther = otherVariant.getSortedAttributes();

        return sortedSelf.every((selfAttr, index) => {
            const otherAttr = sortedOther[index];
            if (otherAttr === undefined || otherAttr.value === undefined) {
                return true;
            }
            return selfAttr.value === otherAttr.value;
        });
    }

    isSupervariantOf(otherVariant: Variant): boolean {
        return otherVariant.isSubvariantOf(this);
    }

    createSubvariant(symbol: string, value: boolean): Variant {
        const newAttributes = this.attributes.map(attr => new Attribute(attr.symbol, attr.value));
        const index = newAttributes.findIndex(attr => attr.symbol === symbol);
        if (index !== -1) {
            newAttributes[index].value = value;
        } else {
            newAttributes.push(new Attribute(symbol, value));
        }
        return new Variant(newAttributes);
    }

    isPossible(possibleVariants: Variant[]): boolean {
        return possibleVariants.some(possibleVariant => this.isSupervariantOf(possibleVariant));
    }

    isFinal(symbolOrder: string[]): boolean {
        const attributesWithValues = this.attributes.filter(attr => attr.value !== undefined);
        const symbolsWithValues = attributesWithValues.map(attr => attr.symbol);
        const sortedSymbols = symbolOrder.sort((a, b) => a.toString().localeCompare(b.toString()));
        return sortedSymbols.length === symbolsWithValues.length && sortedSymbols.every((symbol, index) => symbol === symbolsWithValues[index]);
    }

    isEmpty(): boolean {
        return this.attributes.every(attr => attr.value === undefined);
    }
}

export class Condition {
    condition: BooleanExpression;

    constructor(condition: BooleanExpression) {
        this.condition = condition;
    }

    testCondition(variant: Variant): boolean {
        const dict = variant.toDict();
        const relevantExpression = this.getBooleanExpressionForRelevantSymbols(variant.attributes.map(attr => attr.symbol));
        return relevantExpression.evaluate(dict);
    }

    freeSymbolsEqualTo(relevantSymbols: string[]): boolean {
        const freeSymbols = this.condition.getIdentifiers();
        return freeSymbols.length === relevantSymbols.length && freeSymbols.every(symbol => relevantSymbols.includes(symbol));
    }

    private getBooleanExpressionForRelevantSymbols(relevantSymbols: string[]): BooleanExpression {
        if (relevantSymbols.length === 0) {
            return new BooleanTrue()
        }
        if (this.freeSymbolsEqualTo(relevantSymbols)) {
            return this.condition;
        }
        const orderedSymbols = [...relevantSymbols, ...this.condition.getIdentifiers().filter(symbol => !relevantSymbols.includes(symbol))];
        const minterms = this.condition.getMinterms(orderedSymbols);
        const nofIrrelevantSymbols = orderedSymbols.length - relevantSymbols.length;
        const mintermsShifted = minterms.map(minterm => minterm >> nofIrrelevantSymbols);
        const minifiedMinterms = new Set(minterms.map(minterm => minterm >> nofIrrelevantSymbols));
        return BooleanExpression.sopFromMinterms(Array.from(minifiedMinterms), relevantSymbols);
    }
}

export abstract class Conditional {
    abstract getCondition(): Condition;
}

export class Part extends Conditional {
    name: string;
    condition: Condition;
    constructor(name: string, condition: Condition) {
        super();
        this.name = name;
        this.condition = condition;
    }
    getCondition(): Condition {
        return this.condition;
    }
    override toString(): string {
        return this.name;
    }
}

export class VariantNode {
    currentSymbols: string[];
    variant: Variant;
    conditionals: Conditional[];
    children: VariantNode[];
    parent?: VariantNode;

    constructor(currentSymbols: string[], symbolOrder: string[], variant: Variant, allConditionals: Conditional[]) {
        this.currentSymbols = currentSymbols;
        this.variant = variant;
        this.conditionals = [];
        if (variant.isFinal(symbolOrder)) {
            for (const conditional of allConditionals) {
                if (conditional.getCondition().testCondition(variant)) {
                    this.conditionals.push(conditional);
                }
            }
        }
        this.children = [];
        this.parent = undefined;
    }

    addChild(child: VariantNode): void {
        this.children.push(child);
        child.parent = this;
    }

    findNodesHavingAllSymbols(searchSymbols: string[]): VariantNode[] {
        if (this.currentSymbols.length === searchSymbols.length && this.currentSymbols.every(symbol => searchSymbols.includes(symbol))) {
            return [this];
        }
        return this.children.flatMap(child => child.findNodesHavingAllSymbols(searchSymbols));
    }

    getPathToParentNode(parentNodes: VariantNode[]): VariantNode[] {
        if (parentNodes.includes(this)) {
            return [this];
        }
        return [this, ...(this.parent ? this.parent.getPathToParentNode(parentNodes) : [])];
    }

    compactPath(path: VariantNode[]): void {
        const newSymbols = path.flatMap(node => node.currentSymbols);
        const newParent = path[path.length - 1].parent;
        if (newParent) {
            newParent.children = newParent.children.filter(child => child !== path[path.length - 1]);
            path[0].currentSymbols = newSymbols;
            newParent.children.push(path[0]);
            path[0].parent = newParent;
        }
    }

    collapse(rootSymbols: string[], leafSymbols: string[]): void {
        const rootNodes = this.findNodesHavingAllSymbols(rootSymbols);
        const leafNodes = this.findNodesHavingAllSymbols(leafSymbols);
        for (const leafNode of leafNodes) {
            const pathToParent = leafNode.getPathToParentNode(rootNodes);
            if (pathToParent.length > 0) {
                this.compactPath(pathToParent);
            }
        }
    }

    toString(): string {
        return `${this.currentSymbols} -> ${this.variant} -> ${this.conditionals}`;
    }
}
