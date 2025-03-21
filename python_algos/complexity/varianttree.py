"""
This modules contains classes and functions to create a variant tree from a list of possible
variants and a list of parts. The variant tree is a hierarchical structure where each node
represents a variantand its children represent the possible descendants of the variant.
The parts are used to test if a variant satisfies a condition and to get the set attributes
in the condition.
"""

from copy import deepcopy
from typing import Optional, Self
from sympy import symbols, sympify, Symbol
from sympy.logic import SOPform
from sympy.logic.boolalg import Boolean, truth_table, term_to_integer, integer_to_term


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


class Condition:
    """
    A class to represent a condition
    """

    def __init__(self, condition: Boolean):
        self.condition = condition

    def test_condition(self, variant: Variant) -> bool:
        """Test if the variant satisfies the condition"""
        relevant_symbols = [
            attr.symbol for attr in variant.attributes if attr.value is not None
        ]
        relevant_condition = get_boolean_expression_for_relevant_symbols(
            self.condition, relevant_symbols
        )
        return relevant_condition.subs(variant.to_dict())

    def get_relevant_attributes(self, variant: Variant) -> list[Symbol]:
        """Return the set attributes in the condition"""
        relevant_symbols = [
            attr.symbol for attr in variant.attributes if attr.value is not None
        ]
        relevant_condition = get_boolean_expression_for_relevant_symbols(
            self.condition, relevant_symbols
        )
        all_symbols = [attr.symbol for attr in variant.attributes]
        minterms = minterms_for_boolean(relevant_condition, all_symbols)
        minterm_lists = [
            integer_to_term(minterm, len(all_symbols)) for minterm in minterms
        ]
        minterm_vector_sum = [sum(minterm) for minterm in zip(*minterm_lists)]
        return [
            all_symbols[i] for i in range(len(all_symbols)) if minterm_vector_sum[i] > 0
        ]

    def get_necessary_attributes(self, variant) -> list[Symbol]:
        """Return attributes necessary for the condition"""
        relevant_symbols = [
            attr.symbol for attr in variant.attributes if attr.value is not None
        ]
        relevant_condition = get_boolean_expression_for_relevant_symbols(
            self.condition, relevant_symbols
        )
        all_symbols = [attr.symbol for attr in variant.attributes]
        minterms = minterms_for_boolean(relevant_condition, all_symbols)
        minterm_lists = [
            integer_to_term(minterm, len(all_symbols)) for minterm in minterms
        ]
        minterm_vector_sum = [sum(minterm) for minterm in zip(*minterm_lists)]
        return [
            all_symbols[i]
            for i in range(len(all_symbols))
            if minterm_vector_sum[i] == len(minterms)
        ]


class Part(Condition):
    """
    A class to represent a part
    """

    def __init__(self, name: str, condition: Boolean):
        super().__init__(condition)
        self.name = name

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class VariantNode:
    """
    A class to represent a node in a variant tree
    """

    def __init__(self, variant: Variant, all_conditions: list[Condition]):
        self.variant = variant
        self.conditions = []
        for condition in all_conditions:
            if condition.test_condition(variant):
                self.conditions.append(condition)
        self.children = []

    def add_child(self, child):
        """Add a child to the node"""
        self.children.append(child)

    def __str__(self):
        relevant_attributes = [
            part.get_relevant_attributes(self.variant) for part in self.conditions
        ]
        flat_relevant_attributes = {
            item for sublist in relevant_attributes for item in sublist
        }
        necessary_attributes = [
            part.get_necessary_attributes(self.variant) for part in self.conditions
        ]
        flat_necessary_attributes = {
            item for sublist in necessary_attributes for item in sublist
        }
        return f"{self.variant} -> {self.conditions} -> {flat_relevant_attributes} -> {flat_necessary_attributes}"


def add_nodes(
    variant_node: VariantNode,
    possible_variants: list[Variant],
    symbol_order: list[Symbol],
    conditions: list[Condition],
):
    """Add nodes to a variant node"""
    for value in [True, False]:
        new_variant = variant_node.variant.create_subvariant(symbol_order[0], value)
        if new_variant.is_possible(possible_variants):
            new_node = VariantNode(new_variant, conditions)
            variant_node.add_child(new_node)
            if len(symbol_order) > 1:
                add_nodes(
                    new_node,
                    possible_variants,
                    [symbol_order[i] for i in range(1, len(symbol_order))],
                    conditions,
                )


def construct_variant_tree(
    possible_variants: list[Variant],
    symbol_order: list[Symbol],
    conditions: list[Condition],
) -> VariantNode:
    """Construct a variant tree from possible variants and conditions that need to be satisfied"""
    root = VariantNode(
        Variant([Attribute(symbol) for symbol in symbol_order]), conditions
    )
    add_nodes(
        root,
        possible_variants,
        [symbol_order[i] for i in range(0, len(symbol_order))],
        conditions,
    )
    return root


def string_to_boolean(string: str) -> Boolean:
    """Convert a string to a sympy boolean expression"""
    return sympify(string)


def minterms_for_boolean(
    bool_expr: Boolean, ordered_symbols: list[Symbol]
) -> list[int]:
    """Convert a boolean expression to a list of minterms"""
    minterms = []
    tt = truth_table(bool_expr, ordered_symbols)
    for row in tt:
        if row[1]:
            minterms.append(term_to_integer(row[0]))
    sorted_minterms = sorted(minterms)
    return sorted_minterms


def get_extended_minterms(
    minterms: list[int], nof_irreleveant_symobls: int
) -> list[int]:
    """Return an extended list of minterms where the LSBs have no influence on the result"""
    minterm_lsbs = list(range(2**nof_irreleveant_symobls))
    minterms_msbs = {
        minterm >> nof_irreleveant_symobls << nof_irreleveant_symobls
        for minterm in minterms
    }
    extended_minterms = set()
    for msb in minterms_msbs:
        extended_minterms.update([msb + lsb for lsb in minterm_lsbs])
    return sorted(list(extended_minterms))


def get_boolean_expression_for_relevant_symbols(
    boolean_expr: Boolean, relevant_symbols=list[Symbol]
) -> Boolean:
    """
    Return a boolean expression where only the relevant symbols
    have an influence on the result
    """
    ordered_symbols = relevant_symbols.copy()
    ordered_symbols.extend(
        [
            symbol
            for symbol in boolean_expr.free_symbols
            if symbol not in relevant_symbols
        ]
    )
    minterms = minterms_for_boolean(boolean_expr, ordered_symbols)
    extended_minterms = get_extended_minterms(
        minterms, len(ordered_symbols) - len(relevant_symbols)
    )
    return SOPform(ordered_symbols, extended_minterms)


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
    A, B, C = symbols("A, B, C")
    part_1 = Part("Part 1", B & (A | C))
    part_2 = Part("Part 2", C & (A | B))

    variant_1 = Variant([Attribute(A, True), Attribute(B, True), Attribute(C, False)])
    variant_2 = Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)])
    variant_3 = Variant([Attribute(A, False), Attribute(B, True), Attribute(C, True)])

    tree = construct_variant_tree(
        [variant_1, variant_2, variant_3], [A, B, C], [part_1, part_2]
    )
    print_tree(tree)


if __name__ == "__main__":
    main()
