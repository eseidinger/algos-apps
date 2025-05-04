package de.eseidinger.algos.complexity;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

class VariantTreeUtils {
    public static <T extends Conditional> void printTree(
            VariantNode<T> node,
            String markerStr,
            List<Boolean> levelMarkers,
            java.util.function.Function<VariantNode<T>, String> strFunc
    ) {
        String emptyStr = " ".repeat(markerStr.length());
        String connectionStr = "|" + emptyStr.substring(1);

        int levelMarkersLimit = levelMarkers.size();
        if (levelMarkersLimit > 0) {
            levelMarkersLimit = levelMarkersLimit - 1;
        }
        String markers = levelMarkers.stream()
                .limit(levelMarkersLimit)
                .map(draw -> draw ? connectionStr : emptyStr)
                .collect(Collectors.joining(""));
        String lastMarker = levelMarkers.isEmpty() ? "" : markerStr;
        System.out.println(markers + lastMarker + strFunc.apply(node));

        for (int i = 0; i < node.getChildren().size(); i++) {
            boolean isLast = i == node.getChildren().size() - 1;
            printTree(node.getChildren().get(i), markerStr, new ArrayList<>(levelMarkers) {{
                add(!isLast);
            }}, strFunc);
        }
    }
}
