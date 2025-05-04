package de.eseidinger.algos.complexity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class VariantNode<T extends Conditional> {
    private final List<String> currentSymbols;
    private final Variant variant;
    private final List<VariantNode<T>> children;
    private VariantNode<T> parent;
    private final List<T> conditionals;
    private final Map<String, Object> nodeProps;

    public VariantNode(
            List<String> currentSymbols,
            Variant variant,
            List<List<String>> symbolOrder,
            List<Variant> possibleVariants,
            List<T> allConditionals
    ) {
        this.currentSymbols = currentSymbols;
        this.variant = variant;
        this.children = new ArrayList<>();
        this.parent = null;
        this.conditionals = new ArrayList<>();
        this.nodeProps = new HashMap<>();

        List<String> flatSymbols = symbolOrder.stream().flatMap(List::stream).toList();
        if (variant.isFinal(flatSymbols)) {
            for (T conditional : allConditionals) {
                if (conditional.getCondition().check(variant)) {
                    this.conditionals.add(conditional);
                }
            }
        } else {
            createChildNodes(symbolOrder, allConditionals, possibleVariants);
        }
    }

    public static Variant createRootVariant(List<List<String>> symbolOrder) {
        List<String> symbolsFlat = symbolOrder.stream().flatMap(List::stream).toList();
        List<Attribute> attributes = symbolsFlat.stream()
                .map(symbol -> new Attribute(symbol, null))
                .toList();
        return new Variant(attributes);
    }

    public static boolean[] boolFromInteger(int value, int nofBits) {
        boolean[] result = new boolean[nofBits];
        for (int i = 0; i < nofBits; i++) {
            result[nofBits - i - 1] = (value & (1 << i)) != 0;
        }
        return result;
    }

    public List<VariantNode<T>> getChildren() {
        return children;
    }

    public VariantNode<T> getParent() {
        return parent;
    }

    public Variant getVariant() {
        return variant;
    }

    public Map<String, Object> getNodeProps() {
        return nodeProps;
    }

    private void createChildNodes(
            List<List<String>> symbolOrder,
            List<T> allConditionals,
            List<Variant> possibleVariants
    ) {
        List<String> nextSymbols = getNextSymbols(symbolOrder);
        if (nextSymbols.isEmpty()) return;

        int nofVariants = 1 << nextSymbols.size();
        List<boolean[]> boolValues = new ArrayList<>();
        for (int i = 0; i < nofVariants; i++) {
            boolValues.add(boolFromInteger(i, nextSymbols.size()));
        }

        List<Variant> variants = variant.deriveVariants(nextSymbols, boolValues);
        for (Variant variant : variants) {
            if (variant.isPossible(possibleVariants)) {
                VariantNode<T> child = new VariantNode<>(nextSymbols, variant, symbolOrder, possibleVariants, allConditionals);
                addChild(child);
            }
        }
    }

    private List<String> getNextSymbols(List<List<String>> symbolOrder) {
        if (currentSymbols.isEmpty()) {
            return symbolOrder.get(0);
        }
        int index = symbolOrder.indexOf(currentSymbols);
        return index + 1 < symbolOrder.size() ? symbolOrder.get(index + 1) : Collections.emptyList();
    }

    private void addChild(VariantNode<T> child) {
        children.add(child);
        child.parent = this;
    }

    public List<VariantNode<T>> getLeafNodes() {
        if (children.isEmpty()) {
            return List.of(this);
        }
        List<VariantNode<T>> leafNodes = new ArrayList<>();
        for (VariantNode<T> child : children) {
            leafNodes.addAll(child.getLeafNodes());
        }
        return leafNodes;
    }

    @Override
    public String toString() {
        String conditionalStr = conditionals.stream().map(Object::toString).collect(Collectors.joining(", "));
        String symbolStrings = String.join(", ", currentSymbols);
        return "[" + symbolStrings + "] -> " + variant + " -> [" + conditionalStr + "]";
    }
}
