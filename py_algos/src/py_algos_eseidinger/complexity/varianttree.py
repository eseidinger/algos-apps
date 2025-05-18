"""
This modules contains classes and functions to create a variant tree from a list of possible
variants and a list of conditionals. The variant tree is a hierarchical structure where each node
represents a variant and its children represent the possible descendants of the variant.
The conditionals are used to test if a variant satisfies a condition and to get the set attributes
in the condition.
"""

from copy import deepcopy
from itertools import product
from typing import Generic, Optional, Protocol, Self, TypeVar, Any
from sympy import symbols, Symbol  # type: ignore
from sympy.logic import SOPform  # type: ignore
from sympy.logic.boolalg import Boolean, BooleanTrue, Or, to_dnf  # type: ignore


class Attribute:  # pylint: disable=too-few-public-methods
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

    def derive_variants(
        self, next_symbols: list[Symbol], values: list[list[bool]]
    ) -> list[Self]:
        """Return a list of derived variants with new attribute values
        This means that the new attribute values are added to the variant

        For example:
        A, B, C = symbols("A, B, C")

        original_variant = Variant([Attribute(A, True), Attribute(B, None), Attribute(C, None)])
        derived_variants = original_variant.derive_variants([B, C], [[True, False], [False, True]])
        derived_variants == [
            Variant([Attribute(A, True), Attribute(B, True), Attribute(C, False)]),
            Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)])
        ]
        """
        new_variants = []
        for value in values:
            new_variant = deepcopy(self)
            for attribute in new_variant.attributes:
                if attribute.symbol in next_symbols:
                    index = next_symbols.index(attribute.symbol)
                    attribute.value = value[index]
            new_variants.append(new_variant)
        return new_variants

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

    def solves(self, condition: "Condition") -> bool:
        """Return True if the variant satisfies the condition
        This method converts the condition to a list of possible variants
        and checks if the variant is derived from or equal to any of the possible variants
        """
        relevant_symbols = [
            attribute.symbol
            for attribute in self.attributes
            if attribute.value is not None
        ]
        possible_variants = condition.to_possible_variants(relevant_symbols)
        return any(
            self.is_derived_from_or_equal(possible_variant)
            for possible_variant in possible_variants
        )

class Condition:  # pylint: disable=too-few-public-methods
    """
    A class to represent a condition.
    A condition is a boolean expression.
    """

    def __init__(self, condition: Boolean):
        self.lenient_conditions: dict[tuple[Symbol], Boolean] = {}
        self.condition = condition
        self.dnf = to_dnf(condition)

    def check(self, variant: Variant) -> bool:
        """Check if the variant satisfies the condition
        This method substitutes the values of the variant into the condition
        and return the result.
        If the variant is empty, the result is True.
        Otherwise, a boolean expression is created with the relevant symbols
        and the values of the variant are substituted into the expression.

        For example:
        The boolean expression B & (A | C) would evaluate to True for the variant
        A = True, B = None, C = False
        because ignoring the value of B, the relevant expression is A | C
        """
        return variant.solves(self)

    def to_possible_variants(self, relevant_symbols: list[Symbol]) -> list[Variant]:
        """Return the possible variants of the condition
        This method uses the DNF of the condition to get the possible variants
        The possible variants are the minterms of the DNF
        """
        if isinstance(self.dnf, Or):
            terms = self.dnf.args
        else:
            terms = [self.dnf]
        possible_variants = []
        for term in terms:
            attributes = []
            for sym in relevant_symbols:
                if term.has(sym):
                    attributes.append(Attribute(sym, True))
                elif term.has(~sym):
                    attributes.append(Attribute(sym, False))
                else:
                    attributes.append(Attribute(sym, None))
            possible_variants.append(Variant(attributes))
        return possible_variants


class Conditional(Protocol):  # pylint: disable=too-few-public-methods
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


T = TypeVar("T", bound=Conditional)


class VariantNode(Generic[T]):
    """
    A class to represent a node in a variant tree.

    Each node has a list of current symbols and a variant.
    The current symbols are the symbols last set in the variant.
    The variant is derived from node's parent variant using the current symbols.
    The leafs of the tree represent the possible variants.
    The conditionals are assigned to the leaf nodes.

    The tree is created by recursively creating child nodes for each set of symbols
    in the symbol order. The child nodes are created by deriving possible variants
    from the parent variant, adding a new set of symbols with all possible values.
    Child nodes are created until all symbols are set in the current  node's variant.
    The conditionals are assigned to the leaf nodes by checking if the condition
    of the conditional is satisfied by the variant.

    For example:

    A, B, C = symbols("A, B, C")
    symbol_order = [[A], [B], [C]]
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

    A tree can also be crated with collapsed nodes from the beginning.
    The example below leads to the same tree as above:

    symbol_order = [[A], [B, C]]
    root_variant = VariantNode.create_root_variant(symbol_order)
    tree_2 = VariantNode(
        [], root_variant, symbol_order, possible_variants, all_conditionals
    )

    Not every symbol in the conditions needs to be present in the tree.
    For example, disregarding the symbol C:

    root_variant = VariantNode.create_root_variant([[A], [B]])
    tree_2 = VariantNode(
        [], root_variant, [[A], [B]], [variant_1, variant_2, variant_3], [part_1, part_2]
    )

    leads to the following tree:

    [] -> {A: None, B: None} -> []
    +- [A] -> {A: True, B: None} -> []
    |  +- [B] -> {A: True, B: True} -> [Part 1, Part 2]
    |  +- [~B] -> {A: True, B: False} -> [Part 2]
    +- [~A] -> {A: False, B: None} -> []
    +- [B] -> {A: False, B: True} -> [Part 1, Part 2]
    """

    def __init__(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        self,
        current_symbols: list[Symbol],
        variant: Variant,
        symbol_order: list[list[Symbol]],
        possible_variants: list[Variant],
        all_conditionals: list[T],
    ):
        """
        Initialize a variant tree
        :param current_symbols: The symbols last set in the variant, empty list for root
        :param variant: The variant of the node.
        For the root node, this is a variant with all symbols set to None
        :param symbol_order: The order of the symbols determines the order of levels in the tree
        :param all_conditionals: The conditional which are assigned to leaf nodes
        """
        self.node_props: dict[str, Any] = {}
        self.children: list[Self] = []
        self.parent = None
        self.current_symbols = current_symbols
        self.variant = variant
        self.conditionals = []
        flat_symbols = [sym for sublist in symbol_order for sym in sublist]
        if variant.is_final(flat_symbols):
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
    def create_root_variant(symbol_order: list[list[Symbol]]) -> Variant:
        """Create a root variant with all symbols set to None"""
        symbols_flat = [sym for sublist in symbol_order for sym in sublist]
        return Variant([Attribute(sym, None) for sym in symbols_flat])

    @staticmethod
    def bool_from_integer(value: int, nof_bits: int) -> list[bool]:
        """Convert an integer to a list of booleans
        The list is the binary representation of the integer
        The length of the list is nof_bits
        """
        return [bool(int(bit)) for bit in bin(value)[2:].zfill(nof_bits)]

    def _create_child_nodes(
        self,
        symbol_order: list[list[Symbol]],
        all_conditionals: list[T],
        possible_variants: list[Variant],
    ):
        """Add nodes to a variant node"""
        next_symbols = self._get_next_symbols(symbol_order)
        if len(next_symbols) == 0:
            return
        nof_variants = 2 ** len(next_symbols)
        bool_values = [
            VariantNode.bool_from_integer(i, len(next_symbols))
            for i in range(nof_variants)
        ]
        variants = self.variant.derive_variants(next_symbols, bool_values)
        for variant in variants:
            if variant.is_possible(possible_variants):
                child = VariantNode(
                    next_symbols,
                    variant,
                    symbol_order,
                    possible_variants,
                    all_conditionals,
                )
                self._add_child(child)

    def _get_next_symbols(self, symbol_order: list[list[Symbol]]) -> list[Symbol]:
        """Return the next symbol in the symbol order"""
        if len(self.current_symbols) == 0:
            return symbol_order[0]
        try:
            index = symbol_order.index(self.current_symbols)
            return symbol_order[index + 1]
        except IndexError:
            return []

    def _add_child(self, child):
        """Add a child to the node"""
        self.children.append(child)
        child.parent = self

    def _find_nodes_having_all_symbols(
        self, search_symbols: list[Symbol]
    ) -> list[Self]:
        """Find all children having all search_symbols"""
        if self.current_symbols == search_symbols:
            return [self]
        found_nodes = []
        for child in self.children:
            found_nodes.extend(
                child._find_nodes_having_all_symbols(search_symbols)
            )  # pylint: disable=protected-access
        return found_nodes

    def _get_path_to_parent_node(self, parent_nodes: list[Self]) -> list[Self]:
        """Get the path to the parent node
        This method returns the path to one of the possible parent nodes
        """
        if self in parent_nodes or self.parent is None:
            return [self]
        return [self] + self.parent._get_path_to_parent_node(
            parent_nodes
        )  # pylint: disable=protected-access

    def _compact_path(self, path_to_head: list[Self]) -> None:
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
        if new_parent is None:
            return
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
            path_to_head = leaf_node._get_path_to_parent_node(
                head_nodes
            )  # pylint: disable=protected-access
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

    def _symbol_to_string(self, sym: Symbol) -> str:
        """Convert a symbol to a string"""
        variant_map = self.variant.to_dict()
        if sym in variant_map:
            if variant_map[sym] is True:
                return f"{sym}"
            return f"~{sym}"
        return str(sym)

    def __str__(self):
        conditional_str = ", ".join(map(str, self.conditionals))
        symbol_strings = ", ".join(map(self._symbol_to_string, self.current_symbols))
        return f"[{symbol_strings}] -> {self.variant} -> [{conditional_str}]"


def print_tree(node, marker_str="+- ", level_markers=None, str_func=str):
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
    print(f"{markers}{str_func(node)}")

    for i, child in enumerate(node.children):
        is_last = i == len(node.children) - 1
        print_tree(child, marker_str, [*level_markers, not is_last], str_func=str_func)


def collect_child_conditionals(node: VariantNode) -> set[Conditional]:
    """
    Collect all conditionals from the tree
    """
    conditionals = set()
    for child in node.children:
        conditionals.update(collect_child_conditionals(child))
    conditionals.update(node.conditionals)
    node.conditionals = list(conditionals)
    node.node_props["conditional_count"] = len(conditionals)
    return conditionals


def print_conditionals(node: VariantNode):
    """
    Print the conditionals of the tree
    """
    return f"{str(node)} -> {node.node_props['conditional_count']} conditionals"


def main():
    """
    Example usage of the variant tree
    """
    A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
    symbol_order = [[A], [B], [C]]
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

    collect_child_conditionals(tree)
    print("\nWith collected conditionals:")
    print_tree(tree, str_func=print_conditionals)

    tree.collapse([B], [C])
    print("\nAfter collapsing:")
    print_tree(tree, str_func=print_conditionals)
    print("\n")

    print("Collapsed tree")
    symbol_order = [[A], [B, C]]
    root_variant = VariantNode.create_root_variant(symbol_order)
    tree_2 = VariantNode(
        [], root_variant, symbol_order, possible_variants, all_conditionals
    )
    print_tree(tree_2)
    print("\n")

    print("Tree with only two symbols:")
    symbol_order = [[A], [B]]
    root_variant = VariantNode.create_root_variant(symbol_order)
    tree_3 = VariantNode(
        [], root_variant, symbol_order, possible_variants, all_conditionals
    )
    print_tree(tree_3)


if __name__ == "__main__":
    main()
