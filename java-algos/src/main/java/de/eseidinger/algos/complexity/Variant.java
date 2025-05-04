package de.eseidinger.algos.complexity;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.Comparator;


public class Variant {
    private final List<Attribute> attributes;

    public Variant(List<Attribute> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String toString() {
        return "{" + attributes.stream().map(Attribute::toString).collect(Collectors.joining(", ")) + "}";
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Variant)) return false;
        Variant other = (Variant) obj;
        return attributes.equals(other.attributes);
    }

    @Override
    public int hashCode() {
        return attributes.hashCode();
    }

    public List<Attribute> getSortedAttributes() {
        return attributes.stream()
                .sorted(Comparator.comparing(Attribute::getSymbol))
                .collect(Collectors.toList());
    }

    public Map<String, Boolean> toDict() {
        return attributes.stream()
                .filter(attr -> attr.getValue() != null)
                .collect(Collectors.toMap(Attribute::getSymbol, Attribute::getValue));
    }

    public boolean isDerivedFromOrEqual(Variant otherVariant) {
        Map<String, Boolean> thisDict = this.toDict();
        Map<String, Boolean> otherDict = otherVariant.toDict();
        for (Map.Entry<String, Boolean> entry : otherDict.entrySet()) {
            if (entry.getValue() != null && !Objects.equals(thisDict.get(entry.getKey()), entry.getValue())) {
                return false;
            }
        }
        return true;
    }

    public Variant deriveVariant(String symbol, boolean value) {
        List<Attribute> newAttributes = attributes.stream()
                .map(attr -> attr.getSymbol().equals(symbol) ? new Attribute(attr.getSymbol(), value) : attr)
                .collect(Collectors.toList());
        return new Variant(newAttributes);
    }

    public List<Variant> deriveVariants(List<String> nextSymbols, List<boolean[]> values) {
        return values.stream().map(valueSet -> {
            List<Attribute> newAttributes = attributes.stream().map(attr -> {
                int index = nextSymbols.indexOf(attr.getSymbol());
                if (index != -1) {
                    return new Attribute(attr.getSymbol(), valueSet[index]);
                }
                return attr;
            }).collect(Collectors.toList());
            return new Variant(newAttributes);
        }).collect(Collectors.toList());
    }

    public boolean isPossible(List<Variant> possibleVariants) {
        return possibleVariants.stream().anyMatch(variant -> variant.isDerivedFromOrEqual(this));
    }

    public boolean isFinal(List<String> relevantSymbols) {
        return attributes.stream().allMatch(attr ->
                relevantSymbols.contains(attr.getSymbol()) ? attr.getValue() != null : true);
    }

    public boolean isEmpty() {
        return attributes.stream().allMatch(attr -> attr.getValue() == null);
    }
}
