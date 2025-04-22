"""
Tests for generic search algorithms.
These tests are designed to ensure that the search algorithms work correctly and efficiently.
"""
from py_algos_eseidinger.generic_search.generic_search import (
    linear_contains,
)

def test_linear_contains():
    """
    Test the linear_contains function.
    """
    # Test with a list containing the target
    lst = [1, 2, 3, 4, 5]
    target = 3
    assert linear_contains(lst, target) is True

    # Test with a list not containing the target
    lst = [1, 2, 4, 5]
    target = 3
    assert linear_contains(lst, target) is False

    # Test with an empty list
    lst = []
    target = 3
    assert linear_contains(lst, target) is False

    # Test with a single element list containing the target
    lst = [3]
    target = 3
    assert linear_contains(lst, target) is True

    # Test with a single element list not containing the target
    lst = [2]
    target = 3
    assert linear_contains(lst, target) is False
