import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VariantNode {
    private List<String> currentSymbols;
    private Variant variant;
    private List<Conditional> conditionals;
    private List<VariantNode> children;
    private VariantNode parent;

    public VariantNode(List<String> currentSymbols, List<String> symbolOrder, Variant variant, List<Conditional> allConditionals) {
        this.currentSymbols = currentSymbols;
        this.variant = variant;
        this.conditionals = new ArrayList<>();
        if (variant.isFinal(symbolOrder)) {
            for (Conditional conditional : allConditionals) {
                if (conditional.getCondition().testCondition(variant)) {
                    this.conditionals.add(conditional);
                }
            }
        }
        this.children = new ArrayList<>();
        this.parent = null;
    }

    public void addChild(VariantNode child) {
        this.children.add(child);
        child.parent = this;
    }

    public List<VariantNode> findNodesHavingAllSymbols(List<String> searchSymbols) {
        if (this.currentSymbols.size() == searchSymbols.size() && this.currentSymbols.containsAll(searchSymbols)) {
            List<VariantNode> result = new ArrayList<>();
            result.add(this);
            return result;
        }
        List<VariantNode> foundNodes = new ArrayList<>();
        for (VariantNode child : children) {
            foundNodes.addAll(child.findNodesHavingAllSymbols(searchSymbols));
        }
        return foundNodes;
    }

    public List<VariantNode> getPathToParentNode(List<VariantNode> parentNodes) {
        if (parentNodes.contains(this)) {
            List<VariantNode> path = new ArrayList<>();
            path.add(this);
            return path;
        }
        if (parent != null) {
            List<VariantNode> path = parent.getPathToParentNode(parentNodes);
            path.add(0, this);
            return path;
        }
        return new ArrayList<>();
    }

    public void compactPath(List<VariantNode> path) {
        List<String> newSymbols = new ArrayList<>();
        for (VariantNode node : path) {
            newSymbols.addAll(node.currentSymbols);
        }
        VariantNode newParent = path.get(path.size() - 1).parent;
        if (newParent != null) {
            newParent.children.remove(path.get(path.size() - 1));
            path.get(0).currentSymbols = newSymbols;
            newParent.children.add(path.get(0));
            path.get(0).parent = newParent;
        }
    }

    public void collapse(List<String> rootSymbols, List<String> leafSymbols) {
        List<VariantNode> rootNodes = findNodesHavingAllSymbols(rootSymbols);
        List<VariantNode> leafNodes = findNodesHavingAllSymbols(leafSymbols);
        for (VariantNode leafNode : leafNodes) {
            List<VariantNode> pathToParent = leafNode.getPathToParentNode(rootNodes);
            if (!pathToParent.isEmpty()) {
                compactPath(pathToParent);
            }
        }
    }

    @Override
    public String toString() {
        return currentSymbols + " -> " + variant + " -> " + conditionals;
    }
}