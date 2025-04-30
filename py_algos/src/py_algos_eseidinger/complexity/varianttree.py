"""
This modules contains classes and functions to create a variant tree from a list of possible
variants and a list of conditionals. The variant tree is a hierarchical structure where each node
represents a variant and its children represent the possible descendants of the variant.
The conditionals are used to test if a variant satisfies a condition and to get the set attributes
in the condition.
"""

from copy import deepcopy
from typing import Optional, Protocol, Self
from sympy import symbols, Symbol
from sympy.logic import SOPform
from sympy.logic.boolalg import Boolean, BooleanTrue, truth_table, term_to_integer


class Attribute:
    """
    A class to represent an attribute of a variant.
    An attribute is a symbol with an optional value.
    """

    def __init__(self, sym: Symbol, value: Optional[bool] = None):
        self.symbol = sym
        self.value = value

    def __str__(self):
        return f"{self.symbol}: {self.value}"


class Variant:
    """
    A class to represent a variant.
    A variant is a list of attributes.
    """

    def __init__(self, attributes: list[Attribute]):
        self.attributes = attributes

    def __str__(self):
        attributes = ", ".join(map(str, self.attributes))
        return f"{{{attributes}}}"

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

    def __eq__(self, value):
        return isinstance(value, Variant) and self.to_dict() == value.to_dict()

    def is_derived_from_or_equal(self, other_variant: Self) -> bool:
        """Return True if the variant is derived from another variant
        This means that all attributes of the other variant are present in this variant
        and have the same value.
        If the value of the attribute in the other variant is None, it is ignored.

        For example:
        A, B, C = symbols("A, B, C")

        original_variant = Variant([Attribute(A, True), Attribute(B, False), Attribute(C, None)])
        derived_variant = Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)])

        derived_variant.is_derived_from_or_equal(original_variant) == True
        original_variant.is_derived_from_or_equal(derived_variant) == False
        """
        return all(
            self_attr.value == other_attr.value
            for self_attr, other_attr in zip(
                self.get_sorted_attributes(), other_variant.get_sorted_attributes()
            )
            if other_attr.value is not None
        )

    def derive_variant(self, symbol: Symbol, value: bool) -> Self:
        """Return a derived variant with a new attribute value
        This means that the new attribute value is added to the variant

        For example:
        A, B, C = symbols("A, B, C")

        original_variant = Variant([Attribute(A, True), Attribute(B, False), Attribute(C, None)])
        derived_variant = original_variant.derive_variant(C, True)

        derived_variant == Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)])
        """
        new_variant = deepcopy(self)
        for attribute in new_variant.attributes:
            if attribute.symbol == symbol:
                attribute.value = value
        return new_variant

    def is_possible(self, possible_variants: list[Self]) -> bool:
        """Return True if the variant is possible
        This means that any of the possible variants is derived from or equal to this variant
        """
        return any(
            possible_variant.is_derived_from_or_equal(self)
            for possible_variant in possible_variants
        )

    def is_final(self, relevant_symbols: list[Symbol]) -> bool:
        """Return True if the variant is final
        This means that all relevant attributes of the variant have a value
        """
        return all(
            attribute.value is not None
            for attribute in self.attributes
            if attribute.symbol in relevant_symbols
        )

    def is_empty(self) -> bool:
        """Return True if the variant is empty"""
        return all(attribute.value is None for attribute in self.attributes)


class Condition:
    """
    A class to represent a condition.
    A condition is a boolean expression.
    """

    def __init__(self, condition: Boolean):
        self.condition = condition

    def check(self, variant: Variant) -> bool:
        """Check if the variant satisfies the condition
        This method substitutes the values of the variant into the condition
        and return the result.
        If the variant is empty, the result is False.
        Otherwise, a boolean expression is created with the relevant symbols
        and the values of the variant are substituted into the expression.

        For example:
        The boolean expression B & (A | C) would evaluate to True for the variant
        A = True, B = None, C = False
        because ignoring the value of B, the relevant expression is A | C
        """
        if variant.is_empty():
            return False
        relevant_symbols = [
            attr.symbol for attr in variant.attributes if attr.value is not None
        ]
        relevant_condition = self._get_boolean_expression_for_relevant_symbols(
            relevant_symbols
        )
        return relevant_condition.subs(variant.to_dict())

    def _get_minterms(self, symbol_order: list[Symbol]) -> list[int]:
        """Convert a boolean expression to a list of minterms
        This method uses the truth table to get the minterms of the boolean expression

        For example:
        The boolean expression B & (A | C) has the following truth table for symbol order A, B, C:
        A | B | C | B & (A | C)
        -------------------------
        0 | 0 | 0 | 0
        0 | 0 | 1 | 0
        0 | 1 | 0 | 0
        0 | 1 | 1 | 1
        1 | 0 | 0 | 0
        1 | 0 | 1 | 0
        1 | 1 | 0 | 1
        1 | 1 | 1 | 1
        The minterms are the binary input values of the rows where the result is 1
        The minterms are:
        3, 6, 7
        """
        minterms = []
        tt = truth_table(self.condition, symbol_order)
        for row in tt:
            if row[1]:
                minterms.append(term_to_integer(row[0]))
        sorted_minterms = sorted(minterms)
        return sorted_minterms

    def _get_boolean_expression_for_relevant_symbols(
        self, relevant_symbols=list[Symbol]
    ) -> Boolean:
        """Return a boolean expression where only the relevant symbols
        have an influence on the result.
        This method uses the minterms of the boolean expression to get
        the relevant boolean expression

        For example:
        The boolean expression B & (A | C) has the following truth table:
        A | B | C | B & (A | C)
        -------------------------
        0 | 0 | 0 | 0
        0 | 0 | 1 | 0
        0 | 1 | 0 | 0
        0 | 1 | 1 | 1
        1 | 0 | 0 | 0
        1 | 0 | 1 | 0
        1 | 1 | 0 | 1
        1 | 1 | 1 | 1

        If only symbols A and C are relevant, column B can be ignored,
        which results in the following minterms:
        A | C | ?
        -------------------------
        0 | 1 | 1
        1 | 0 | 1
        1 | 1 | 1

        In this case it is obvious that the result is A | C

        But in general the SOP / DNF can be calculated by using the minterms
        of the boolean expression, which would be in this case:
        (~A & C) | (A & ~C) | (A & C)
        """
        # The condition is always true if there are no relevant symbols
        if len(relevant_symbols) == 0:
            return BooleanTrue()
        # relevant symbols come first in the ordered symbols
        ordered_symbols = relevant_symbols.copy()
        ordered_symbols.extend(
            [
                symbol
                for symbol in self.condition.free_symbols
                if symbol not in relevant_symbols
            ]
        )
        # The condition doesn't change if all symbols are relevant
        if len(ordered_symbols) == len(relevant_symbols):
            return self.condition
        minterms = self._get_minterms(ordered_symbols)
        nof_irrelevant_symbols = len(ordered_symbols) - len(relevant_symbols)
        # The irrelevant symbols are the LSBs of the minterms and can be ignored by shifting
        # the minterms to the right
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
    A class to represent a very simple conditional
    """

    def __init__(self, name: str, condition: Condition):
        self.condition = condition
        self.name = name

    def get_condition(self) -> Condition:
        """Return the condition of the part"""
        return self.condition

    def __str__(self):
        return self.name


class VariantNode:
    """
    A class to represent a node in a variant tree.

    Each node has a list of current symbols and a variant.
    The current symbols are the symbols last set in the variant.
    The variant is derived from node's parent variant using the current symbols.
    The leafs of the tree represent the possible variants.
    The conditionals are assigned to the leaf nodes.

    The tree is created by recursively creating child nodes for each symbol
    in the symbol order. The child nodes are created by deriving the variant
    from the parent variant using the current symbol and the value of the symbol.
    The child nodes are created until all symbols are set in the variant.
    The conditionals are assigned to the leaf nodes by checking if the condition
    of the conditional is satisfied by the variant.

    For example:

    A, B, C = symbols("A, B, C")
    symbol_order = [A, B, C]
    root_variant = VariantNode.create_root_variant(symbol_order)

    variant_1 = Variant([Attribute(A, True), Attribute(B, True), Attribute(C, False)])
    variant_2 = Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)])
    variant_3 = Variant([Attribute(A, False), Attribute(B, True), Attribute(C, True)])
    possible_variants = [variant_1, variant_2, variant_3]

    part_1 = Part("Part 1", Condition(B & (A | C)))
    part_2 = Part("Part 2", Condition(C & (A | B)))
    all_conditionals = [part_1, part_2]

    tree = VariantNode(
        [], root_variant, symbol_order, possible_variants, all_conditionals
    )

    leads to the following tree:

    [] -> {A: None, B: None, C: None} -> []
    +- [A] -> {A: True, B: None, C: None} -> []
    |  +- [B] -> {A: True, B: True, C: None} -> []
    |  |  +- [~C] -> {A: True, B: True, C: False} -> [Part 1]
    |  +- [~B] -> {A: True, B: False, C: None} -> []
    |     +- [C] -> {A: True, B: False, C: True} -> [Part 2]
    +- [~A] -> {A: False, B: None, C: None} -> []
    +- [B] -> {A: False, B: True, C: None} -> []
        +- [C] -> {A: False, B: True, C: True} -> [Part 1, Part 2]


    Not every symbol in the conditions needs to be present in the tree.
    For example, disregarding the symbol C:

    root_variant = VariantNode.create_root_variant([A, B])
    tree_2 = VariantNode(
        [], root_variant, [A, B], [variant_1, variant_2, variant_3], [part_1, part_2]
    )

    leads to the following tree:

    [] -> {A: None, B: None} -> []
    +- [A] -> {A: True, B: None} -> []
    |  +- [B] -> {A: True, B: True} -> [Part 1, Part 2]
    |  +- [~B] -> {A: True, B: False} -> [Part 2]
    +- [~A] -> {A: False, B: None} -> []
    +- [B] -> {A: False, B: True} -> [Part 1, Part 2]

    Nodes can also be collapsed to reduce the size of the tree.
    For example, collapsing the nodes with the symbols B and C

    tree.collapse([B], [C])

    leads to the following tree:

    [] -> {A: None, B: None, C: None} -> []
    +- [A] -> {A: True, B: None, C: None} -> []
    |  +- [B, ~C] -> {A: True, B: True, C: False} -> [Part 1]
    |  +- [~B, C] -> {A: True, B: False, C: True} -> [Part 2]
    +- [~A] -> {A: False, B: None, C: None} -> []
    +- [B, C] -> {A: False, B: True, C: True} -> [Part 1, Part 2]
    """

    def __init__(
        self,
        current_symbols: list[Symbol],
        variant: Variant,
        symbol_order: list[Symbol],
        possible_variants: list[Variant],
        all_conditionals: list[Conditional],
    ):
        """
        Initialize a variant tree
        :param current_symbols: The symbols last set in the variant, empty list for root
        :param variant: The variant of the node.
        For the root node, this is a variant with all symbols set to None
        :param symbol_order: The order of the symbols determines the order of levels in the tree
        :param all_conditionals: The conditional which are assigned to leaf nodes
        """
        self.children = []
        self.parent = None
        self.current_symbols = current_symbols
        self.variant = variant
        self.conditionals = []
        if variant.is_final(symbol_order):
            for conditional in all_conditionals:
                if conditional.get_condition().check(variant):
                    self.conditionals.append(conditional)
        else:
            self._create_child_nodes(
                symbol_order,
                all_conditionals,
                possible_variants,
            )

    @staticmethod
    def create_root_variant(symbol_order: list[Symbol]) -> Variant:
        """Create a root variant with all symbols set to None"""
        return Variant([Attribute(symbol, None) for symbol in symbol_order])

    def _create_child_nodes(
        self,
        symbol_order: list[Symbol],
        all_conditionals: list[Conditional],
        possible_variants: list[Variant],
    ):
        """Add nodes to a variant node"""
        next_symbol = self._get_next_symbol(symbol_order)
        if next_symbol is None:
            return
        for value in [True, False]:
            new_variant = self.variant.derive_variant(next_symbol, value)
            if new_variant.is_possible(possible_variants):
                new_node = VariantNode(
                    [next_symbol],
                    new_variant,
                    symbol_order,
                    possible_variants,
                    all_conditionals,
                )
                self._add_child(new_node)

    def _get_next_symbol(self, symbol_order: list[Symbol]) -> Optional[Symbol]:
        """Return the next symbol in the symbol order"""
        current_symbol = (
            self.current_symbols[-1] if len(self.current_symbols) > 0 else None
        )
        if current_symbol is None:
            return symbol_order[0]
        try:
            index = symbol_order.index(current_symbol)
            return symbol_order[index + 1]
        except IndexError:
            return None

    def _add_child(self, child):
        """Add a child to the node"""
        self.children.append(child)
        child.parent = self

    def _find_nodes_having_all_symbols(self, search_symbols: list[Symbol]) -> list[Self]:
        """Find all children having all search_symbols"""
        if self.current_symbols == search_symbols:
            return [self]
        found_nodes = []
        for child in self.children:
            found_nodes.extend(child._find_nodes_having_all_symbols(search_symbols))
        return found_nodes

    def _get_path_to_parent_node(self, parent_nodes: list[Self]) -> list[Self]:
        """Get the path to the parent node
        This method returns the path to one of the possible parent nodes
        """
        if self in parent_nodes:
            return [self]
        return [self] + self.parent._get_path_to_parent_node(parent_nodes)

    def _compact_path(self, path_to_head: list[Self]) -> Self:
        """Compact the path to the head node
        This means collecting all symbols on the path and setting them to the tail node.
        All other nodes on the path are removed.
        """
        new_symbols = []
        for node in path_to_head:
            new_symbols.extend(node.current_symbols)
        new_symbols.reverse()
        head = path_to_head[-1]
        new_parent = head.parent
        try:
            new_parent.children.remove(head)
        except ValueError:
            # The node may have been already removed as it can be the root of multiple paths
            pass
        tail = path_to_head[0]
        new_parent.children.append(tail)
        tail.parent = new_parent
        tail.current_symbols = new_symbols

    def collapse(self, head_symbols: list[Symbol], tail_symbols: list[Symbol]):
        """Collapse nodes
        This method collapses all paths from nodes having
        all root symbols to nodes having all leaf symbols
        @param head_symbols: The symbols of the head nodes (closer to the root)
        @param tail_symbols: The symbols of the tail nodes (closer to the leafs)
        
        For example:
        Consider the following tree:
        []
         +- [A]
         |   +- [B]
         |   |   +- [C]
         |   |   +- [~C]
         |   +- [~B]
         |       +- [C]
         |       +- [~C]
         +- [~A]
             +- [B]
             |   +- [C]
             |   +- [~C]
             +- [~B]
                 +- [C]
                 +- [~C]

        If we collapse the nodes having all root symbols [B]
        to the nodes having all leaf symbols [C],
        the result is:
        []
         +- [A]
         |   +- [B, C]
         |   +- [B, ~C]
         |   +- [~B, C]
         |   +- [~B, ~C]
         +- [~A]
             +- [B, C]
             +- [B, ~C]
             +- [~B, C]
             +- [~B, ~C]

        The number of leafs is not changed, but the number of nodes is reduced
        """
        head_nodes = self._find_nodes_having_all_symbols(head_symbols)
        tail_nodes = self._find_nodes_having_all_symbols(tail_symbols)
        for leaf_node in tail_nodes:
            path_to_head = leaf_node._get_path_to_parent_node(head_nodes)
            if len(path_to_head) > 0:
                self._compact_path(path_to_head)

    def get_leafs(self) -> list[Self]:
        """Get all leaf nodes"""
        if len(self.children) == 0:
            return [self]
        leafs = []
        for child in self.children:
            leafs.extend(child.get_leafs())
        return leafs

    def _symbol_to_string(self, symbol: Symbol) -> str:
        """Convert a symbol to a string"""
        variant_map = self.variant.to_dict()
        if symbol in variant_map:
            if variant_map[symbol] is True:
                return f"{symbol}"
            else:
                return f"~{symbol}"
        return str(symbol)

    def __str__(self):
        conditional_str = ", ".join(map(str, self.conditionals))
        symbol_strings = ", ".join(map(self._symbol_to_string, self.current_symbols))
        return f"[{symbol_strings}] -> {self.variant} -> [{conditional_str}]"


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
    symbol_order = [A, B, C]
    root_variant = VariantNode.create_root_variant(symbol_order)

    variant_1 = Variant([Attribute(A, True), Attribute(B, True), Attribute(C, False)])
    variant_2 = Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)])
    variant_3 = Variant([Attribute(A, False), Attribute(B, True), Attribute(C, True)])
    possible_variants = [variant_1, variant_2, variant_3]

    part_1 = Part("Part 1", Condition(B & (A | C)))
    part_2 = Part("Part 2", Condition(C & (A | B)))
    all_conditionals = [part_1, part_2]

    tree = VariantNode(
        [], root_variant, symbol_order, possible_variants, all_conditionals
    )
    print("Before collapsing:")
    print_tree(tree)

    tree.collapse([B], [C])
    print("\nAfter collapsing:")
    print_tree(tree)
    print("\n")

    print("Tree with only two symbols:")
    symbol_order = [A, B]
    root_variant = VariantNode.create_root_variant(symbol_order)
    tree_2 = VariantNode(
        [], root_variant, symbol_order, possible_variants, all_conditionals
    )
    print_tree(tree_2)


if __name__ == "__main__":
    main()
