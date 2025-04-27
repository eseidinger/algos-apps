import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Variant {
    private List<Attribute> attributes;

    public Variant(List<Attribute> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        for (Attribute attr : attributes) {
            sb.append(attr.toString()).append(" ");
        }
        return sb.toString().trim();
    }

    public List<Attribute> getSortedAttributes() {
        attributes.sort((a, b) -> a.getSymbol().compareTo(b.getSymbol()));
        return attributes;
    }

    public Map<String, Boolean> toDict() {
        Map<String, Boolean> dict = new HashMap<>();
        for (Attribute attr : attributes) {
            if (attr.getValue() != null) {
                dict.put(attr.getSymbol(), attr.getValue());
            }
        }
        return dict;
    }

    public boolean isSubvariantOf(Variant otherVariant) {
        List<Attribute> sortedSelf = this.getSortedAttributes();
        List<Attribute> sortedOther = otherVariant.getSortedAttributes();

        for (int i = 0; i < sortedSelf.size(); i++) {
            Attribute selfAttr = sortedSelf.get(i);
            if (i >= sortedOther.size() || sortedOther.get(i).getValue() == null) {
                return true;
            }
            if (!selfAttr.getValue().equals(sortedOther.get(i).getValue())) {
                return false;
            }
        }
        return true;
    }

    public boolean isSupervariantOf(Variant otherVariant) {
        return otherVariant.isSubvariantOf(this);
    }

    public Variant createSubvariant(String symbol, Boolean value) {
        List<Attribute> newAttributes = new ArrayList<>();
        for (Attribute attr : attributes) {
            newAttributes.add(new Attribute(attr.getSymbol(), attr.getValue()));
        }
        int index = newAttributes.indexOf(new Attribute(symbol, null));
        if (index != -1) {
            newAttributes.get(index).setValue(value);
        } else {
            newAttributes.add(new Attribute(symbol, value));
        }
        return new Variant(newAttributes);
    }

    public boolean isPossible(List<Variant> possibleVariants) {
        for (Variant possibleVariant : possibleVariants) {
            if (this.isSupervariantOf(possibleVariant)) {
                return true;
            }
        }
        return false;
    }

    public boolean isFinal(List<String> symbolOrder) {
        List<Attribute> attributesWithValues = new ArrayList<>();
        for (Attribute attr : attributes) {
            if (attr.getValue() != null) {
                attributesWithValues.add(attr);
            }
        }
        List<String> symbolsWithValues = new ArrayList<>();
        for (Attribute attr : attributesWithValues) {
            symbolsWithValues.add(attr.getSymbol());
        }
        List<String> sortedSymbols = new ArrayList<>(symbolOrder);
        sortedSymbols.sort(String::compareTo);
        return sortedSymbols.size() == symbolsWithValues.size() && sortedSymbols.equals(symbolsWithValues);
    }

    public boolean isEmpty() {
        return attributes.stream().allMatch(attr -> attr.getValue() == null);
    }
}