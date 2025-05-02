import { Variant, VariantNode, Condition, Attribute, Conditional } from "./variant-node";

export function getNextSymbol(symbolOrder: string[], currentSymbol: string | null): string | null {
    if (currentSymbol === null) {
        return symbolOrder[0];
    }
    const index = symbolOrder.indexOf(currentSymbol);
    return index >= 0 && index < symbolOrder.length - 1 ? symbolOrder[index + 1] : null;
}

export function addNodes(
    variantNode: VariantNode,
    possibleVariants: Variant[],
    symbolOrder: string[],
    conditionals: Conditional[]
): void {
    const nextSymbol = variantNode.currentSymbols.length === 0 ? symbolOrder[0] : getNextSymbol(symbolOrder, variantNode.currentSymbols[variantNode.currentSymbols.length - 1]);
    if (nextSymbol === null) {
        return;
    }
    for (const value of [true, false]) {
        const newVariant = variantNode.variant.createSubvariant(nextSymbol, value);
        if (newVariant.isPossible(possibleVariants)) {
            const newNode = new VariantNode([nextSymbol], symbolOrder, newVariant, conditionals);
            variantNode.addChild(newNode);
            addNodes(newNode, possibleVariants, symbolOrder, conditionals);
        }
    }
}

export function constructVariantTree(
    possibleVariants: Variant[],
    symbolOrder: string[],
    conditionals: Conditional[]
): VariantNode {
    const root = new VariantNode(
        [],
        symbolOrder,
        new Variant(symbolOrder.map(symbol => new Attribute(symbol))),
        conditionals
    );
    addNodes(root, possibleVariants, symbolOrder, conditionals);
    return root;
}

export function printTree(
    node: VariantNode,
    markerStr: string = "+- ",
    levelMarkers: boolean[] = []
): void {
    /**
     * Recursive function that prints the hierarchical structure of a tree
     * including markers that indicate parent-child relationships between nodes.
     *
     * Parameters:
     * - node: TreeNode instance, possibly containing children Nodes
     * - markerStr: String to print in front of each node ("+- " by default)
     * - levelMarkers: Internally used by recursion to indicate where to
     *                 print markers and connections
     *
     * Example output:
     *
     * 1
     * +- 1.1
     * |  +- 1.1.1
     * |  |  +- 1.1.1.1
     * |  |  +- 1.1.1.2
     * |  +- 1.1.2
     * |  |  +- 1.1.2.1
     * |  |  +- 1.1.2.2
     * |  |  +- 1.1.2.3
     * |  |     +- 1.1.2.3.1
     * |  +- 1.1.3
     * +- 1.2
     * |  +- 1.2.1
     * |  +- 1.2.2
     * +- 1.3
     * +- 1.4
     *    +- 1.4.1
     *    +- 1.4.2
     */

    const emptyStr = " ".repeat(markerStr.length);
    const connectionStr = "|" + emptyStr.slice(1);

    const level = levelMarkers.length;
    const markers = levelMarkers
        .slice(0, -1)
        .map((draw) => (draw ? connectionStr : emptyStr))
        .join("");
    const currentMarker = level > 0 ? markerStr : "";
    console.log(`${markers}${currentMarker}${node.toString()}`);

    node.children.forEach((child, index) => {
        const isLast = index === node.children.length - 1;
        printTree(child, markerStr, [...levelMarkers, !isLast]);
    });
}