from copy import deepcopy
from typing import Optional
from sympy import symbols, sympify, Symbol
from sympy.logic import SOPform
from sympy.logic.boolalg import Boolean, truth_table, term_to_integer


class Attribute:

    def __init__(self, sym: Symbol, value: Optional[bool] = None):
        self.symbol = sym
        self.value = value

    def __str__(self):
        return f"{self.symbol}: {self.value}"

    def __repr__(self):
        return f"{self.symbol}: {self.value}"
    

class Variant:

    def __init__(self, attributes: list[Attribute]):
        self.attributes = attributes

    def __str__(self):
        return "\n".join(map(str, self.attributes))

    def __repr__(self):
        return "\n".join(map(repr, self.attributes))
    
    def get_sorted_attributes(self) -> list[Attribute]:
        """Return the attributes sorted by symbol"""
        return sorted(self.attributes, key=lambda x: x.symbol)

    def to_dict(self):
        return {
            attr.symbol: attr.value
            for attr in self.attributes
            if attr.value is not None
        }
    
    def is_descendant_of(self, other_variant: Variant) -> bool:
        """Return True if the variant is a descendant of another variant"""
        return all(
            self_attr.value == other_attr.value
            for self_attr, other_attr in zip(self.get_sorted_attributes(), other_variant.get_sorted_attributes())
            if other_attr.value is not None
        )
    
    def is_ancestor_of(self, other_variant: Variant) -> bool:
        """Return True if the variant is an ancestor of another variant"""
        return other_variant.is_descendant_of(self)
    
    def create_descendant(self, symbol: Symbol, value: bool) -> Variant:
        """Return a descendant variant with a new attribute"""
        new_variant = deepcopy(self)
        for attribute in new_variant.attributes:
            if attribute.symbol == symbol:
                attribute.value = value
        return new_variant
      
    def for_relevant_symbols(self, relevant_symbols: list[Symbol]) -> Variant:
        """Return a variant with only relevant symbols"""
        new_variant = deepcopy(self)
        for attribute in new_variant.attributes:
            if attribute.symbol not in relevant_symbols:
                attribute.value = None
        return new_variant


class Part:

    def __init__(self, name, condition: Boolean):
        self.name = name
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

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class VariantNode:
    
    def __init__(self, variant: Variant):
        self.variant = variant
        self.children = []

    def add_child(self, child):
        self.children.append(child)

    def __str__(self):
        return f"{self.variant} -> {self.children}"

    def __repr__(self):
        return f"{self.variant} -> {self.children}"


def is_possible_variant(variant: Variant, possible_variants: list[Variant]) -> bool:
    """Return True if the variant is possible"""
    return any(
        variant.is_ancestor_of(possible_variant) for possible_variant in possible_variants
    )


def add_nodes(variant_node: VariantNode, possible_variants: list[Variant], symbol_order: list[Symbol]):
    """Add nodes to a variant node"""
    for value in [True, False]:
        new_variant = variant_node.variant.create_descendant(symbol_order[0], value)
        if is_possible_variant(new_variant, possible_variants):
            new_node = VariantNode(new_variant)
            variant_node.add_child(new_node)
            if len(symbol_order) > 1:
                add_nodes(new_node, possible_variants, [symbol_order[i] for i in range(1, len(symbol_order))])


def construct_variant_tree(possible_variants: list[Variant], symbol_order: list[Symbol]) -> VariantNode:
    """Construct a variant tree from possible variants and parts"""
    # create a root node with the first part
    # for each variant, create a node with the variant
    # for each node, add a child to the root node
    # return the root node
    root = VariantNode(Variant([Attribute(symbol) for symbol in symbol_order]))
    add_nodes(root, possible_variants, [symbol_order[i] for i in range(1, len(symbol_order))])

    

def string_to_boolean(string: str) -> Boolean:
    """Convert a string to a sympy boolean expression"""
    return sympify(string)


def minterms_for_boolean(
    bool_expr: Boolean, ordered_symbols: list[Symbol]
) -> list[int]:
    """Convert a dnf to a list of minterms"""
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
    """Return an extended list of minterms with irrelevant symbols"""
    # set lower bits of minterms to 0 (length of nof_irreleveant_symobls)
    # create a list lower_dont_cares with bit range 0 to nof_irreleveant_symobls
    # for each minterm, create a list of extended_minterms with the minterm added
    # to the lower_dont_cares
    # return the concatenated list of extended_minterms
    lower_dont_cares = list(range(2**nof_irreleveant_symobls))
    minterms_msb = {
        minterm >> nof_irreleveant_symobls << nof_irreleveant_symobls
        for minterm in minterms
    }
    extended_minterms = set()
    for minterm in minterms_msb:
        extended_minterms.update([minterm + lower for lower in lower_dont_cares])
    return sorted(list(extended_minterms))


def get_boolean_expression_for_irrelevant_symbols(
    boolean_expr: Boolean, irrelevant_symbols=list[Symbol]
) -> Boolean:
    """Return a boolean expression for irrelevant symbols"""
    # get the ordered symbols from the boolean expression
    # get the minterms for the boolean expression
    # get the extended minterms for the minterms
    # create a dnf from the extended minterms
    # return the dnf
    ordered_symbols = [
        symbol
        for symbol in boolean_expr.free_symbols
        if symbol not in irrelevant_symbols
    ]
    ordered_symbols.extend(irrelevant_symbols)
    minterms = minterms_for_boolean(boolean_expr, ordered_symbols)
    extended_minterms = get_extended_minterms(minterms, len(irrelevant_symbols))
    return SOPform(ordered_symbols, extended_minterms)


def get_boolean_expression_for_relevant_symbols(
    boolean_expr: Boolean, relevant_symbols=list[Symbol]
) -> Boolean:
    """Return a boolean expression for relevant symbols"""
    # get the ordered symbols from the boolean expression
    # get the minterms for the boolean expression
    # get the extended minterms for the minterms
    # create a dnf from the extended minterms
    # return the dnf
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
