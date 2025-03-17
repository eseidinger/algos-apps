# a pytest module to test creeating a logic expression using sympy logic

from sympy import symbols
from sympy.logic import SOPform
from sympy.logic.boolalg import Boolean, to_dnf

from python_algos.complexity.varianttree import (
    Attribute,
    Variant,
    Part,
    minterms_for_boolean,
    get_extended_minterms,
    get_boolean_expression_for_relevant_symbols,
)


def test_dnf():
    # create a logic expression using symbols
    # convert the expression to dnf
    # assert the dnf
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)
    dnf = to_dnf(bool_expr)
    assert dnf == (A & B) | (B & C)


def test_minterms_for_boolean():
    # create  a logic expressions using symbols
    # convert the dnf to minterms
    # assert the minterms
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)
    assert minterms_for_boolean(bool_expr, [A, B, C]) == [3, 6, 7]
    assert minterms_for_boolean(bool_expr, [B, C, A]) == [5, 6, 7]
    assert minterms_for_boolean(bool_expr, [C, A, B]) == [3, 5, 7]


def test_get_extended_minterms():
    # create a list of minterms
    # convert the minterms to dont cares
    # assert the dont cares
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)
    minterms = minterms_for_boolean(bool_expr, [B, C, A])
    assert get_extended_minterms(minterms, 0) == [5, 6, 7]
    assert get_extended_minterms(minterms, 1) == [4, 5, 6, 7]
    assert get_extended_minterms(minterms, 2) == [4, 5, 6, 7]
    assert get_extended_minterms(minterms, 3) == [0, 1, 2, 3, 4, 5, 6, 7]


def test_boolean_expression_from_minterms():
    # create a logic expression from minterms and dont_cares
    # assert the expression
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)

    minterms = minterms_for_boolean(bool_expr, [A, B, C])
    extended_minterms = get_extended_minterms(minterms, 0)
    sop_form = SOPform([A, B, C], extended_minterms)
    assert sop_form == (A & B) | (B & C)

    extended_minterms = get_extended_minterms(minterms, 1)
    sop_form = SOPform([A, B, C], extended_minterms)
    assert sop_form == B

    minterms = minterms_for_boolean(bool_expr, [B, C, A])
    extended_minterms = get_extended_minterms(minterms, 1)
    sop_form = SOPform([B, C, A], extended_minterms)
    assert sop_form == B

    minterms = minterms_for_boolean(bool_expr, [C, A, B])
    extended_minterms = get_extended_minterms(minterms, 1)
    sop_form = SOPform([C, A, B], extended_minterms)
    assert sop_form == A | C


def test_get_boolean_expression_for_relevant_symobls():
    # create a logic expression from minterms and dont_cares
    # assert the expression
    A, B, C = symbols("A, B, C")
    bool_expr = B & (A | C)

    relevant_symbols = [B]
    relevant_expr = get_boolean_expression_for_relevant_symbols(
        bool_expr, relevant_symbols
    )
    assert relevant_expr == B

    relevant_symbols = [A, C]
    relevant_expr = get_boolean_expression_for_relevant_symbols(
        bool_expr, relevant_symbols
    )
    assert relevant_expr == A | C

    relevant_symbols = [C]
    relevant_expr = get_boolean_expression_for_relevant_symbols(
        bool_expr, relevant_symbols
    )
    assert relevant_expr == True


def test_evaluate_variant():
    # create a variant with a part and attributes
    # assert the variant
    A, B, C = symbols("A, B, C")
    bool_expr_1 = B & (A | C)
    bool_expr_2 = C & (A | B)

    part_1 = Part("part_1", bool_expr_1)
    part_2 = Part("part_2", bool_expr_2)

    attributes = [Attribute(A, True), Attribute(B, None), Attribute(C, None)]
    variant = Variant(attributes)

    assert part_1.test_condition(variant)
    assert part_2.test_condition(variant)

    attributes = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
    variant = Variant(attributes)

    assert not part_1.test_condition(variant)
    assert part_2.test_condition(variant)

