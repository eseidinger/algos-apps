"""
Test the functionality of the VariantTree module.
This module contains tests for the VariantTree class and its methods."""

from sympy import symbols
from sympy.logic.boolalg import BooleanTrue, to_dnf

from py_algos_eseidinger.complexity.varianttree import (
    Attribute,
    Variant,
    Condition,
    Part,
)


def test_dnf():
    """Test the conversion of a boolean expression to DNF.
    This test checks if the DNF of a boolean expression is correct.
    """
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)
    dnf = to_dnf(bool_expr)
    assert dnf == (A & B) | (B & C)


def test_minterms_for_boolean():
    """Test the conversion of a boolean expression to minterms.
    This test checks if the minterms of a boolean expression are correct.
    """
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)
    condition = Condition(bool_expr)
    assert condition._get_minterms([A, B, C]) == [3, 6, 7]
    assert condition._get_minterms([B, C, A]) == [5, 6, 7]
    assert condition._get_minterms([C, A, B]) == [3, 5, 7]


def test_get_boolean_expression_for_relevant_symobls():
    """Test the conversion of a boolean expression to a boolean expression
    with only relevant symbols.
    This test checks if the boolean expression with only relevant symbols
    is correct.
    """
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)
    condition = Condition(bool_expr)

    relevant_symbols = [B]
    relevant_expr = condition._get_boolean_expression_for_relevant_symbols(
        relevant_symbols
    )
    assert relevant_expr == B

    relevant_symbols = [A, C]
    relevant_expr = condition._get_boolean_expression_for_relevant_symbols(
        relevant_symbols
    )
    assert relevant_expr == A | C

    relevant_symbols = [C]
    relevant_expr = condition._get_boolean_expression_for_relevant_symbols(
        relevant_symbols
    )
    assert relevant_expr == BooleanTrue()

    relevant_symbols = []
    relevant_expr = condition._get_boolean_expression_for_relevant_symbols(
        relevant_symbols
    )
    assert relevant_expr == BooleanTrue()


def test_evaluate_variant():
    """Test the evaluation of a variant.
    This test checks if the evaluation of a variant is correct.
    """
    A, B, C = symbols("A, B, C")
    bool_expr_1 = B & (A | C)
    bool_expr_2 = C & (A | B)

    part_1 = Part("part_1", Condition(bool_expr_1))
    part_2 = Part("part_2", Condition(bool_expr_2))

    attributes = [Attribute(A, True), Attribute(B, None), Attribute(C, None)]
    variant = Variant(attributes)

    assert part_1.get_condition().test_condition(variant)
    assert part_2.get_condition().test_condition(variant)

    attributes = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
    variant = Variant(attributes)

    assert not part_1.get_condition().test_condition(variant)
    assert part_2.get_condition().test_condition(variant)
