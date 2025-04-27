import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.List;

public class VariantNodeTest {
    private VariantNode variantNode;
    private Variant variant;
    private List<String> currentSymbols;
    private List<String> symbolOrder;

    @BeforeEach
    public void setUp() {
        currentSymbols = Arrays.asList("A", "B");
        symbolOrder = Arrays.asList("A", "B", "C");
        Attribute attr1 = new Attribute("A", true);
        Attribute attr2 = new Attribute("B", false);
        variant = new Variant(Arrays.asList(attr1, attr2));
        variantNode = new VariantNode(currentSymbols, symbolOrder, variant, List.of());
    }

    @Test
    public void testAddChild() {
        VariantNode childNode = new VariantNode(Arrays.asList("C"), symbolOrder, variant, List.of());
        variantNode.addChild(childNode);
        assertEquals(1, variantNode.children.size());
        assertEquals(childNode, variantNode.children.get(0));
        assertEquals(variantNode, childNode.parent);
    }

    @Test
    public void testFindNodesHavingAllSymbols() {
        VariantNode childNode = new VariantNode(Arrays.asList("A", "B"), symbolOrder, variant, List.of());
        variantNode.addChild(childNode);
        List<VariantNode> foundNodes = variantNode.findNodesHavingAllSymbols(Arrays.asList("A", "B"));
        assertEquals(1, foundNodes.size());
        assertEquals(childNode, foundNodes.get(0));
    }

    @Test
    public void testGetPathToParentNode() {
        VariantNode childNode = new VariantNode(Arrays.asList("C"), symbolOrder, variant, List.of());
        variantNode.addChild(childNode);
        List<VariantNode> path = childNode.getPathToParentNode(List.of(variantNode));
        assertEquals(2, path.size());
        assertEquals(childNode, path.get(0));
        assertEquals(variantNode, path.get(1));
    }

    @Test
    public void testCompactPath() {
        VariantNode childNode = new VariantNode(Arrays.asList("C"), symbolOrder, variant, List.of());
        variantNode.addChild(childNode);
        List<VariantNode> path = List.of(variantNode, childNode);
        variantNode.compactPath(path);
        assertEquals(1, variantNode.children.size());
        assertEquals(variantNode, childNode.parent);
    }

    @Test
    public void testCollapse() {
        VariantNode leafNode = new VariantNode(Arrays.asList("C"), symbolOrder, variant, List.of());
        variantNode.addChild(leafNode);
        variantNode.collapse(Arrays.asList("A"), Arrays.asList("C"));
        assertEquals(0, variantNode.children.size());
    }

    @Test
    public void testToString() {
        String expectedString = "[A, B] -> " + variant.toString() + " -> []";
        assertEquals(expectedString, variantNode.toString());
    }
}