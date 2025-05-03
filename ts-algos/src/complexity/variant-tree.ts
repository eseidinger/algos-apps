import { BooleanExpression } from "./boolean-expression";

export class Attribute {
    symbol: string;
    value: boolean | null;

    constructor(symbol: string, value: boolean | null = null) {
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
        const attributes = this.attributes.map(attr => attr.toString()).join(", ");
        return `{${attributes}}`;
    }

    getSortedAttributes(): Attribute[] {
        return [...this.attributes].sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    toDict(): Record<string, boolean | null> {
        const dict: Record<string, boolean | null> = {};
        for (const attr of this.attributes) {
            if (attr.value !== null) {
                dict[attr.symbol] = attr.value;
            }
        }
        return dict;
    }

    toDictWithValues(): Record<string, boolean> {
        const dict: Record<string, boolean> = {};
        for (const attr of this.attributes) {
            if (attr.value !== null) {
                dict[attr.symbol] = attr.value;
            }
        }
        return dict;
    }

    isDerivedFromOrEqual(otherVariant: Variant): boolean {
        const thisDict = this.toDict();
        const otherDict = otherVariant.toDict();
        for (const key in otherDict) {
            if (otherDict[key] !== null && thisDict[key] !== otherDict[key]) {
                return false;
            }
        }
        return true;
    }

    deriveVariant(symbol: string, value: boolean): Variant {
        const newAttributes = this.attributes.map(attr =>
            attr.symbol === symbol ? new Attribute(attr.symbol, value) : attr
        );
        return new Variant(newAttributes);
    }

    deriveVariants(nextSymbols: string[], values: boolean[][]): Variant[] {
        return values.map(valueSet => {
            const newAttributes = this.attributes.map(attr => {
                const index = nextSymbols.indexOf(attr.symbol);
                if (index !== -1) {
                    return new Attribute(attr.symbol, valueSet[index]);
                }
                return attr;
            });
            return new Variant(newAttributes);
        });
    }

    isPossible(possibleVariants: Variant[]): boolean {
        return possibleVariants.some(variant => variant.isDerivedFromOrEqual(this));
    }

    isFinal(relevantSymbols: string[]): boolean {
        return this.attributes.every(attr =>
            relevantSymbols.includes(attr.symbol) ? attr.value !== null : true
        );
    }

    isEmpty(): boolean {
        return this.attributes.every(attr => attr.value === null);
    }
}

export class Condition {
    condition: BooleanExpression;
    lenientConditionCache: Map<string, BooleanExpression>;

    constructor(condition: BooleanExpression) {
        this.condition = condition;
        this.lenientConditionCache = new Map<string, BooleanExpression>();
    }

    check(variant: Variant): boolean {
        const relevantSymbols = variant.getSortedAttributes()
            .filter(attr => attr.value != null).map(attr => attr.symbol);
        const relevantCondition = this.getRelevantCondition(relevantSymbols);
        return relevantCondition.evaluate(variant.toDictWithValues());
    }

    private getRelevantCondition(relevantSymbols: string[]): BooleanExpression {
        const cacheKey = relevantSymbols.slice().sort().join(",");
        if (this.lenientConditionCache.has(cacheKey)) {
            return this.lenientConditionCache.get(cacheKey)!;
        }
        const symbolsInCondition = this.condition.getIdentifiers();
        const symbols = [...relevantSymbols];
        for (const symbol of symbolsInCondition) {
            if (!symbols.includes(symbol)) {
                symbols.push(symbol);
            }
        }
        const numberOfIrrelevantSymbols = symbolsInCondition.length - relevantSymbols.length;
        if (numberOfIrrelevantSymbols == 0) {
            this.lenientConditionCache.set(cacheKey, this.condition);
            return this.condition;
        }
        const minterms = this.condition.getMinterms(symbols);
        const shiftedMinterms = minterms.map(minterm => minterm >> numberOfIrrelevantSymbols);
        const mintermSet = new Set(shiftedMinterms);
        const relevantExpression = BooleanExpression.sopFromMinterms(Array.from(mintermSet), relevantSymbols);
        this.lenientConditionCache.set(cacheKey, relevantExpression);
        return relevantExpression;
    }
}

export interface Conditional {
    getCondition(): Condition;
}

export class Part implements Conditional {
    name: string;
    condition: Condition;

    constructor(name: string, condition: Condition) {
        this.name = name;
        this.condition = condition;
    }

    getCondition(): Condition {
        return this.condition;
    }

    toString(): string {
        return this.name;
    }
}

export class VariantNode<T extends Conditional> {
    currentSymbols: string[];
    variant: Variant;
    children: VariantNode<T>[];
    parent: VariantNode<T> | null;
    conditionals: T[];
    nodeProps: Record<string, unknown>;

    constructor(
        currentSymbols: string[],
        variant: Variant,
        symbolOrder: string[][],
        possibleVariants: Variant[],
        allConditionals: T[]
    ) {
        this.currentSymbols = currentSymbols;
        this.variant = variant;
        this.children = [];
        this.parent = null;
        this.conditionals = [];
        this.nodeProps = {};

        const flatSymbols = symbolOrder.flat();
        if (variant.isFinal(flatSymbols)) {
            for (const conditional of allConditionals) {
                if (conditional.getCondition().check(variant)) {
                    this.conditionals.push(conditional);
                }
            }
        } else {
            this.createChildNodes(symbolOrder, allConditionals, possibleVariants);
        }
    }

    static createRootVariant(symbolOrder: string[][]): Variant {
        const symbolsFlat = symbolOrder.flat();
        return new Variant(symbolsFlat.map(symbol => new Attribute(symbol, null)));
    }

    static boolFromInteger(value: number, nofBits: number): boolean[] {
        return value
            .toString(2)
            .padStart(nofBits, "0")
            .split("")
            .map(bit => bit === "1");
    }

    private createChildNodes(
        symbolOrder: string[][],
        allConditionals: T[],
        possibleVariants: Variant[]
    ): void {
        const nextSymbols = this.getNextSymbols(symbolOrder);
        if (nextSymbols.length === 0) return;

        const nofVariants = 2 ** nextSymbols.length;
        const boolValues = Array.from({ length: nofVariants }, (_, i) =>
            VariantNode.boolFromInteger(i, nextSymbols.length)
        );

        const variants = this.variant.deriveVariants(nextSymbols, boolValues);
        for (const variant of variants) {
            if (variant.isPossible(possibleVariants)) {
                const child = new VariantNode(
                    nextSymbols,
                    variant,
                    symbolOrder,
                    possibleVariants,
                    allConditionals
                );
                this.addChild(child);
            }
        }
    }

    private getNextSymbols(symbolOrder: string[][]): string[] {
        if (this.currentSymbols.length === 0) {
            return symbolOrder[0];
        }
        const index = symbolOrder.findIndex(
            symbols => JSON.stringify(symbols) === JSON.stringify(this.currentSymbols)
        );
        return symbolOrder[index + 1] || [];
    }

    private addChild(child: VariantNode<T>): void {
        this.children.push(child);
        child.parent = this;
    }

    getLeafNodes(): VariantNode<T>[] {
        if (this.children.length === 0) {
            return [this];
        }
        const leafNodes: VariantNode<T>[] = [];
        for (const child of this.children) {
            leafNodes.push(...child.getLeafNodes());
        }
        return leafNodes;
    }

    toString(): string {
        const conditionalStr = this.conditionals.map(c => c.toString()).join(", ");
        const symbolStrings = this.currentSymbols.join(", ");
        return `[${symbolStrings}] -> ${this.variant} -> [${conditionalStr}]`;
    }
}

export function printTree<T extends Conditional>(
    node: VariantNode<T>,
    markerStr = "+- ",
    levelMarkers: boolean[] = [],
    strFunc: (node: VariantNode<T>) => string = node => node.toString()
): void {
    const emptyStr = " ".repeat(markerStr.length);
    const connectionStr = "|" + emptyStr.slice(1);

    const markers = levelMarkers
        .slice(0, -1)
        .map(draw => (draw ? connectionStr : emptyStr))
        .join("");
    const lastMarker = levelMarkers.length > 0 ? markerStr : "";
    console.log(`${markers}${lastMarker}${strFunc(node)}`);

    node.children.forEach((child, i) => {
        const isLast = i === node.children.length - 1;
        printTree(child, markerStr, [...levelMarkers, !isLast], strFunc);
    });
}
