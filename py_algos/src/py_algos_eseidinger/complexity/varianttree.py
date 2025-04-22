"""
This modules contains classes and functions to create a variant tree from a list of possible
variants and a list of parts. The variant tree is a hierarchical structure where each node
represents a variant and its children represent the possible descendants of the variant.
The parts are used to test if a variant satisfies a condition and to get the set attributes
in the condition.
"""

from copy import deepcopy
from typing import Optional, Protocol, Self
from sympy import symbols, Symbol
from sympy.logic import SOPform
from sympy.logic.boolalg import Boolean, BooleanTrue, truth_table, term_to_integer


class Attribute:
    """
    A class to represent an attribute of a variant
    """

    def __init__(self, sym: Symbol, value: Optional[bool] = None):
        self.symbol = sym
        self.value = value

    def __str__(self):
        return f"{self.symbol}: {self.value}"

    def __repr__(self):
        return f"{self.symbol}: {self.value}"


class Variant:
    """
    A class to represent a variant
    """

    def __init__(self, attributes: list[Attribute]):
        self.attributes = attributes

    def __str__(self):
        return " ".join(map(str, self.attributes))

    def __repr__(self):
        return " ".join(map(repr, self.attributes))

    def get_sorted_attributes(self) -> list[Attribute]:
        """Return the attributes sorted by symbol"""
        return sorted(self.attributes, key=lambda x: str(x.symbol))

    def to_dict(self):
        """Return a dictionary of the attributes"""
        return {
            attr.symbol: attr.value
            for attr in self.attributes
            if attr.value is not None
        }

    def is_subvariant_of(self, other_variant: Self) -> bool:
        """Return True if the variant is a subvariant of another variant"""
        return all(
            self_attr.value == other_attr.value
            for self_attr, other_attr in zip(
                self.get_sorted_attributes(), other_variant.get_sorted_attributes()
            )
            if other_attr.value is not None
        )

    def is_supervariant_of(self, other_variant: Self) -> bool:
        """Return True if the variant is an supervariant of another variant"""
        return other_variant.is_subvariant_of(self)

    def create_subvariant(self, symbol: Symbol, value: bool) -> Self:
        """Return a subvariant variant with a new attribute value"""
        new_variant = deepcopy(self)
        for attribute in new_variant.attributes:
            if attribute.symbol == symbol:
                attribute.value = value
        return new_variant

    def is_possible(self, possible_variants: list[Self]) -> bool:
        """Return True if the variant is possible"""
        return any(
            self.is_supervariant_of(possible_variant)
            for possible_variant in possible_variants
        )

    def is_final(self, symbol_order: list[Symbol]) -> bool:
        """Return True if the variant is final"""
        attributes_with_value = [
            attribute.symbol
            for attribute in self.attributes
            if attribute.value is not None
        ]
        return set(attributes_with_value) == set(symbol_order)

    def is_empty(self) -> bool:
        """Return True if the variant is empty"""
        return all(attribute.value is None for attribute in self.attributes)


class Condition:
    """
    A class to represent a condition
    """

    def __init__(self, condition: Boolean):
        self.condition = condition

    def test_condition(self, variant: Variant) -> bool:
        """Test if the variant satisfies the condition"""
        if variant.is_final(self.condition.free_symbols):
            return self.condition.subs(variant.to_dict())
        if variant.is_empty():
            return False
        relevant_symbols = [
            attr.symbol for attr in variant.attributes if attr.value is not None
        ]
        relevant_condition = self._get_boolean_expression_for_relevant_symbols(
            relevant_symbols
        )
        return relevant_condition.subs(variant.to_dict())

    def _get_minterms(self, ordered_symbols: list[Symbol]) -> list[int]:
        """Convert a boolean expression to a list of minterms"""
        minterms = []
        tt = truth_table(self.condition, ordered_symbols)
        for row in tt:
            if row[1]:
                minterms.append(term_to_integer(row[0]))
        sorted_minterms = sorted(minterms)
        return sorted_minterms

    def _get_boolean_expression_for_relevant_symbols(
        self, relevant_symbols=list[Symbol]
    ) -> Boolean:
        """
        Return a boolean expression where only the relevant symbols
        have an influence on the result
        """
        if len(relevant_symbols) == 0:
            return BooleanTrue()
        ordered_symbols = relevant_symbols.copy()
        ordered_symbols.extend(
            [
                symbol
                for symbol in self.condition.free_symbols
                if symbol not in relevant_symbols
            ]
        )
        minterms = self._get_minterms(ordered_symbols)
        nof_irrelevant_symbols = len(ordered_symbols) - len(relevant_symbols)
        minified_minterms = {minterm >> nof_irrelevant_symbols for minterm in minterms}
        return SOPform(relevant_symbols, minified_minterms)


class Conditional(Protocol):
    """
    A protocol to represent an object that has a condition
    """

    def get_condition(self) -> Condition:
        """Return the condition of the object"""


class Part(Conditional):
    """
    A class to represent a part
    """

    def __init__(self, name: str, condition: Condition):
        self.condition = condition
        self.name = name

    def get_condition(self) -> Condition:
        """Return the condition of the part"""
        return self.condition

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class VariantNode:
    """
    A class to represent a node in a variant tree
    """

    def __init__(
        self,
        current_symbol: Symbol,
        symbol_order: list[Symbol],
        variant: Variant,
        all_conditionals: list[Conditional],
    ):
        self.current_symbol = current_symbol
        self.variant = variant
        self.conditionals = []
        if variant.is_final(symbol_order):
            for conditional in all_conditionals:
                if conditional.get_condition().test_condition(variant):
                    self.conditionals.append(conditional)
        self.children = []

    def add_child(self, child):
        """Add a child to the node"""
        self.children.append(child)

    def __str__(self):
        return f"{self.variant} -> {self.conditionals}"


def get_next_symbol(
    symbol_order: list[Symbol], current_symbol: Symbol
) -> Optional[Symbol]:
    """Return the next symbol in the symbol order"""
    if current_symbol is None:
        return symbol_order[0]
    try:
        index = symbol_order.index(current_symbol)
        return symbol_order[index + 1]
    except IndexError:
        return None

def add_nodes(
    variant_node: VariantNode,
    possible_variants: list[Variant],
    symbol_order: list[Symbol],
    conditions: list[Condition],
):
    """Add nodes to a variant node"""
    next_symbol = get_next_symbol(symbol_order, variant_node.current_symbol)
    if next_symbol is None:
        return
    for value in [True, False]:
        new_variant = variant_node.variant.create_subvariant(next_symbol, value)
        if new_variant.is_possible(possible_variants):
            new_node = VariantNode(next_symbol, symbol_order, new_variant, conditions)
            variant_node.add_child(new_node)
            add_nodes(
                new_node,
                possible_variants,
                symbol_order,
                conditions,
            )


def construct_variant_tree(
    possible_variants: list[Variant],
    symbol_order: list[Symbol],
    conditions: list[Condition],
) -> VariantNode:
    """Construct a variant tree from possible variants and conditions that need to be satisfied"""
    root = VariantNode(
        None,
        symbol_order,
        Variant([Attribute(symbol) for symbol in symbol_order]),
        conditions,
    )
    add_nodes(
        root,
        possible_variants,
        symbol_order,
        conditions,
    )
    return root


def print_tree(node, marker_str="+- ", level_markers=None):
    """
    Recursive function that prints the hierarchical structure of a tree
    including markers that indicate parent-child relationships between nodes.

    Parameters:
    - root: node instance, possibly containing children Nodes
    - marker_str: String to print in front of each node  ("+- " by default)
    - level_markers: Internally used by recursion to indicate where to
                    print markers and connections (see explanations below)

    Example output:

    1
    +- 1.1
    |  +- 1.1.1
    |  |  +- 1.1.1.1
    |  |  +- 1.1.1.2
    |  +- 1.1.2
    |  |  +- 1.1.2.1
    |  |  +- 1.1.2.2
    |  |  +- 1.1.2.3
    |  |     +- 1.1.2.3.1
    |  +- 1.1.3
    +- 1.2
    |  +- 1.2.1
    |  +- 1.2.2
    +- 1.3
    +- 1.4
       +- 1.4.1
       +- 1.4.2
    """
    if level_markers is None:
        level_markers = []

    empty_str = " " * len(marker_str)
    connection_str = "|" + empty_str[:-1]

    level = len(level_markers)
    markers = "".join(
        map(lambda draw: connection_str if draw else empty_str, level_markers[:-1])
    )
    markers += marker_str if level > 0 else ""
    print(f"{markers}{node}")

    for i, child in enumerate(node.children):
        is_last = i == len(node.children) - 1
        print_tree(child, marker_str, [*level_markers, not is_last])


def main():
    """
    Example usage of the variant tree
    """
    A, B, C = symbols("A, B, C")
    part_1 = Part("Part 1", Condition(B & (A | C)))
    part_2 = Part("Part 2", Condition(C & (A | B)))

    variant_1 = Variant([Attribute(A, True), Attribute(B, True), Attribute(C, False)])
    variant_2 = Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)])
    variant_3 = Variant([Attribute(A, False), Attribute(B, True), Attribute(C, True)])

    tree = construct_variant_tree(
        [variant_1, variant_2, variant_3], [A, B, C], [part_1, part_2]
    )
    print_tree(tree)

    tree_2 = construct_variant_tree(
        [variant_1, variant_2, variant_3], [A, B], [part_1, part_2]
    )
    print_tree(tree_2)


if __name__ == "__main__":
    main()
