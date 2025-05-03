"""
Test the functionality of the VariantTree module.
This module contains tests for the VariantTree class and its methods."""

from sympy import symbols
from sympy.logic.boolalg import BooleanTrue, to_dnf, truth_table, term_to_integer

from py_algos_eseidinger.complexity.varianttree import (
    Attribute,
    Variant,
    Condition,
    Part,
    VariantNode,
)


def test_dnf():
    """Test the conversion of a boolean expression to DNF.
    This test checks if the DNF of a boolean expression is correct.
    """
    A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
    bool_expr = B & (A | C)
    dnf = to_dnf(bool_expr)
    assert dnf == (A & B) | (B & C)


def test_minterms():
    """Test the conversion of a boolean expression to minterms.
    This test checks if the minterms of a boolean expression are correct.
    """
    A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
    bool_expr = (A | B) & C
    tt = truth_table(bool_expr, [A, B, C])
    minterms = []
    for row in tt:
        if row[1]:
            minterms.append(term_to_integer(row[0]))
    assert minterms == [3, 5, 7]


class TestAttribute:
    """Test the functionality of the Attribute class.
    This class contains tests for the Attribute class and its methods.
    """

    def test_str(self):
        """Test the string representation of an Attribute object.
        This test checks if the string representation is correct.
        """
        A = symbols("A")  # pylint: disable=invalid-name
        attribute = Attribute(A, True)
        assert str(attribute) == "A: True"
        attribute = Attribute(A, False)
        assert str(attribute) == "A: False"
        attribute = Attribute(A, None)
        assert str(attribute) == "A: None"


class TestVariant:
    """Test the functionality of the Variant class.
    This class contains tests for the Variant class and its methods.
    """

    def test_str(self):
        """Test the string representation of a Variant object.
        This test checks if the string representation is correct.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        attributes = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        variant = Variant(attributes)
        assert str(variant) == "{A: True, B: False, C: None}"

    def test_get_attributes(self):
        """Test the get_attributes method of the Variant class.
        This test checks if the get_attributes method returns the correct
        attributes.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        attributes = [Attribute(B, False), Attribute(C, None), Attribute(A, True)]
        variant = Variant(attributes)
        assert variant.get_sorted_attributes() != attributes
        assert variant.get_sorted_attributes()[0].symbol == A
        assert variant.get_sorted_attributes()[1].symbol == B
        assert variant.get_sorted_attributes()[2].symbol == C
        assert variant.get_sorted_attributes()[0].value
        assert not variant.get_sorted_attributes()[1].value
        assert variant.get_sorted_attributes()[2].value is None

    def test_to_dict(self):
        """Test the to_dict method of the Variant class.
        This test checks if the to_dict method returns the correct dictionary.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        attributes = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        variant = Variant(attributes)
        assert variant.to_dict() == {A: True, B: False}

    def test_derive_variant(self):
        """Test the derive_variant method of the Variant class.
        The method derives a new variant from the original variant by setting
        the value of a specific unset attribute to a value.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        attributes = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        variant = Variant(attributes)
        derived_variant = variant.derive_variant(C, True)

        assert derived_variant.get_sorted_attributes()[0].symbol == A
        assert derived_variant.get_sorted_attributes()[1].symbol == B
        assert derived_variant.get_sorted_attributes()[2].symbol == C
        assert derived_variant.get_sorted_attributes()[0].value
        assert not derived_variant.get_sorted_attributes()[1].value
        assert derived_variant.get_sorted_attributes()[2].value

    def test_derive_variants(self):
        """Test the derive_variants method of the Variant class.
        This method derives a list of new variants from the original variant
        by setting the value of a specific unset attribute to a value.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name

        original_variant = Variant(
            [Attribute(A, True), Attribute(B, None), Attribute(C, None)]
        )
        derived_variants = original_variant.derive_variants(
            [B, C], [[True, False], [False, True]]
        )
        assert derived_variants == [
            Variant([Attribute(A, True), Attribute(B, True), Attribute(C, False)]),
            Variant([Attribute(A, True), Attribute(B, False), Attribute(C, True)]),
        ]

    def test_equal(self):
        """Test the equality operator of the Variant class.
        This test checks if two variants are equal.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        attributes_1 = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        attributes_2 = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        variant_1 = Variant(attributes_1)
        variant_2 = Variant(attributes_2)
        assert variant_1 == variant_2

        attributes_3 = [Attribute(A, True), Attribute(B, False), Attribute(C, True)]
        variant_3 = Variant(attributes_3)
        assert not variant_1 == variant_3

    def test_is_derived_from_or_equal(self):
        """Test the is_derived method of the Variant class.
        This method tests if all attributes of the derived variant
        are set in the original variant and have the same value.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        original_variant = Variant(
            [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        )
        derived_variant = Variant(
            [Attribute(A, True), Attribute(B, False), Attribute(C, True)]
        )
        assert derived_variant.is_derived_from_or_equal(original_variant)
        assert not original_variant.is_derived_from_or_equal(derived_variant)

    def test_is_possible(self):
        """Test the is_possible method of the Variant class.
        This method checks if any of the possible variants is derived from or equal to the variant.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        possible_variants = [
            Variant([Attribute(A, True), Attribute(B, True), Attribute(C, False)]),
            Variant([Attribute(A, True), Attribute(B, True), Attribute(C, True)]),
        ]
        possible_variant = Variant(
            [Attribute(A, True), Attribute(B, True), Attribute(C, None)]
        )
        impossible_variant = Variant(
            [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        )
        assert possible_variant.is_possible(possible_variants)
        assert not impossible_variant.is_possible(possible_variants)

    def test_is_final(self):
        """Test the is_final method of the Variant class.
        This method checks if every relevant attribute of the variant has a value.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        attributes = [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        variant = Variant(attributes)
        assert not variant.is_final([A, B, C])
        assert variant.is_final([A, B])

    def test_is_empty(self):
        """Test the is_empty method of the Variant class.
        This method checks if all attributes of the variant have no value.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        emtpy_variant = Variant(
            [Attribute(A, None), Attribute(B, None), Attribute(C, None)]
        )
        non_empty_variant = Variant(
            [Attribute(A, True), Attribute(B, False), Attribute(C, None)]
        )
        assert emtpy_variant.is_empty()
        assert not non_empty_variant.is_empty()


class TestCondition:
    """Test the functionality of the Condition class.
    This class contains tests for the Condition class and its methods.
    """

    def test_get_minterms(self):
        """Test the conversion of a boolean expression to minterms.
        This test checks if the minterms of a boolean expression are correct.
        """
        A, B, C = symbols("A, B, C")
        bool_expr = B & (A | C)
        condition = Condition(bool_expr)
        assert condition._get_minterms(  # pylint: disable=protected-access
            [A, B, C]
        ) == [3, 6, 7]
        assert condition._get_minterms(  # pylint: disable=protected-access
            [B, C, A]
        ) == [5, 6, 7]
        assert condition._get_minterms(  # pylint: disable=protected-access
            [C, A, B]
        ) == [3, 5, 7]

    def test_get_boolean_expression_for_relevant_symobls(self):
        """Test the conversion of a boolean expression to a boolean expression
        with only relevant symbols.
        This test checks if the boolean expression with only relevant symbols
        is correct.
        """
        A, B, C = symbols("A, B, C")
        bool_expr = B & (A | C)
        condition = Condition(bool_expr)

        relevant_symbols = tuple([B])
        relevant_expr = condition._get_boolean_expression_for_relevant_symbols(  # pylint: disable=protected-access
            relevant_symbols
        )
        assert relevant_expr == B

        relevant_symbols = (A, C)
        relevant_expr = condition._get_boolean_expression_for_relevant_symbols(  # pylint: disable=protected-access
            relevant_symbols
        )
        assert relevant_expr == A | C

        relevant_symbols = tuple([C])
        relevant_expr = condition._get_boolean_expression_for_relevant_symbols(  # pylint: disable=protected-access
            relevant_symbols
        )
        assert relevant_expr == BooleanTrue()

        relevant_symbols = tuple()
        relevant_expr = condition._get_boolean_expression_for_relevant_symbols(  # pylint: disable=protected-access
            relevant_symbols
        )
        assert relevant_expr == BooleanTrue()

    def test_check(self):
        """Test the check method of the Condition class.
        This methods checks if a variant satisfies the condition.
        """
        A, B, C = symbols("A, B, C")
        bool_expr = B & (A | C)
        condition = Condition(bool_expr)

        attributes = [Attribute(A, True), Attribute(B, False), Attribute(C, True)]
        variant = Variant(attributes)
        assert not condition.check(variant)

        attributes = [Attribute(A, True), Attribute(B, True), Attribute(C, True)]
        variant = Variant(attributes)
        assert condition.check(variant)

        attributes = [Attribute(A, True), Attribute(B, None), Attribute(C, False)]
        variant = Variant(attributes)
        assert condition.check(variant)

        attributes = [Attribute(A, False), Attribute(B, None), Attribute(C, False)]
        variant = Variant(attributes)
        assert not condition.check(variant)


class TestVariantNode:
    """Test the functionality of the VariantNode class.
    This class contains tests for the VariantNode class and its methods.
    """

    def test_get_leafs(self):
        """Test the get_leafs method of the VariantNode class."""
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        symbol_order = [[A], [B], [C]]
        root_variant = VariantNode.create_root_variant(symbol_order)

        variant_1 = Variant(
            [Attribute(A, True), Attribute(B, True), Attribute(C, False)]
        )
        variant_2 = Variant(
            [Attribute(A, True), Attribute(B, False), Attribute(C, True)]
        )
        variant_3 = Variant(
            [Attribute(A, False), Attribute(B, True), Attribute(C, True)]
        )
        possible_variants = [variant_1, variant_2, variant_3]

        part_1 = Part("Part 1", Condition(B & (A | C)))
        part_2 = Part("Part 2", Condition(C & (A | B)))
        all_conditionals = [part_1, part_2]

        tree = VariantNode(
            [], root_variant, symbol_order, possible_variants, all_conditionals
        )

        leafs = tree.get_leafs()
        assert len(leafs) == 3
        assert leafs[0].variant == variant_3
        assert leafs[1].variant == variant_2
        assert leafs[2].variant == variant_1
        assert leafs[0].conditionals == [part_1, part_2]
        assert leafs[1].conditionals == [part_2]
        assert leafs[2].conditionals == [part_1]

    def test_collapse(self):
        """Test the collapse method of the VariantNode class.
        This method collapses the tree to a single node.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        symbol_order = [[A], [B], [C]]
        root_variant = VariantNode.create_root_variant(symbol_order)

        variant_1 = Variant(
            [Attribute(A, True), Attribute(B, True), Attribute(C, False)]
        )
        variant_2 = Variant(
            [Attribute(A, True), Attribute(B, False), Attribute(C, True)]
        )
        variant_3 = Variant(
            [Attribute(A, False), Attribute(B, True), Attribute(C, True)]
        )
        possible_variants = [variant_1, variant_2, variant_3]

        part_1 = Part("Part 1", Condition(B & (A | C)))
        part_2 = Part("Part 2", Condition(C & (A | B)))
        all_conditionals = [part_1, part_2]

        tree = VariantNode(
            [], root_variant, symbol_order, possible_variants, all_conditionals
        )

        tree.collapse([B], [C])
        leafs = tree.get_leafs()
        assert len(leafs) == 3
        assert leafs[0].variant == variant_3
        assert leafs[1].variant == variant_2
        assert leafs[2].variant == variant_1
        assert leafs[0].conditionals == [part_1, part_2]
        assert leafs[1].conditionals == [part_2]
        assert leafs[2].conditionals == [part_1]
        assert leafs[0].current_symbols == [B, C]
        assert leafs[1].current_symbols == [B, C]
        assert leafs[2].current_symbols == [B, C]
        assert leafs[0].parent.current_symbols == [A]
        assert leafs[1].parent.current_symbols == [A]
        assert leafs[2].parent.current_symbols == [A]

    def test_create_collapsed_tree(self):
        """Test the create_collapsed_tree method of the VariantNode class.
        This method creates a tree that is collapsed from the beginning.
        """
        A, B, C = symbols("A, B, C")  # pylint: disable=invalid-name
        symbol_order = [[A], [B, C]]
        root_variant = VariantNode.create_root_variant(symbol_order)

        variant_1 = Variant(
            [Attribute(A, True), Attribute(B, True), Attribute(C, False)]
        )
        variant_2 = Variant(
            [Attribute(A, True), Attribute(B, False), Attribute(C, True)]
        )
        variant_3 = Variant(
            [Attribute(A, False), Attribute(B, True), Attribute(C, True)]
        )
        possible_variants = [variant_1, variant_2, variant_3]

        part_1 = Part("Part 1", Condition(B & (A | C)))
        part_2 = Part("Part 2", Condition(C & (A | B)))
        all_conditionals = [part_1, part_2]

        tree = VariantNode(
            [], root_variant, symbol_order, possible_variants, all_conditionals
        )

        tree.collapse([B], [C])
        leafs = tree.get_leafs()
        assert len(leafs) == 3
        assert leafs[0].variant == variant_3
        assert leafs[1].variant == variant_2
        assert leafs[2].variant == variant_1
        assert leafs[0].conditionals == [part_1, part_2]
        assert leafs[1].conditionals == [part_2]
        assert leafs[2].conditionals == [part_1]
        assert leafs[0].current_symbols == [B, C]
        assert leafs[1].current_symbols == [B, C]
        assert leafs[2].current_symbols == [B, C]
        assert leafs[0].parent.current_symbols == [A]
        assert leafs[1].parent.current_symbols == [A]
        assert leafs[2].parent.current_symbols == [A]
