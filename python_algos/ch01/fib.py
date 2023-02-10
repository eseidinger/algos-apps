from functools import lru_cache
from typing import Dict
import doctest
import math


def fib1(n: int) -> int:
    """
    Calculates the Fibonacci number of a integer n.

    >>> [ fib1(i) for i in range(12) ]
    [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

    n must not be negative
    >>> fib1(-1)
    Traceback (most recent call last):
        ...
    ValueError: n must be >= 0

    n must not be too big to fit the call stack:
    >>> fib1(1000)
    Traceback (most recent call last):
        ...
    RecursionError: maximum recursion depth exceeded while calling a Python object


    Factorials of floats are OK, but the float must be an exact integer:
    >>> fib1(11.1)
    Traceback (most recent call last):
        ...
    ValueError: n must be exact integer
    >>> fib1(11.0)
    89

    It must also not be ridiculously large:
    >>> fib1(1e100)
    Traceback (most recent call last):
        ...
    OverflowError: n too large
    """
    if not n >= 0:
        raise ValueError("n must be >= 0")
    if math.floor(n) != n:
        raise ValueError("n must be exact integer")
    if n+1 == n:  # catch a value like 1e300
        raise OverflowError("n too large")
    if n < 2:
        return n
    n = int(n)
    return fib1(n - 1) + fib1(n - 2)


def fib2(n: int) -> int:
    """
    Calculates the Fibonacci number of a integer n.

    >>> [ fib2(i) for i in range(12) ]
    [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

    n must not be negative
    >>> fib2(-1)
    Traceback (most recent call last):
        ...
    ValueError: n must be >= 0

    n must not be too big to fit the call stack:
    >>> fib2(1000)
    Traceback (most recent call last):
        ...
    RecursionError: maximum recursion depth exceeded while calling a Python object


    Factorials of floats are OK, but the float must be an exact integer:
    >>> fib2(11.1)
    Traceback (most recent call last):
        ...
    ValueError: n must be exact integer
    >>> fib2(11.0)
    89

    It must also not be ridiculously large:
    >>> fib2(1e100)
    Traceback (most recent call last):
        ...
    OverflowError: n too large
    """
    if not n >= 0:
        raise ValueError("n must be >= 0")
    if math.floor(n) != n:
        raise ValueError("n must be exact integer")
    if n+1 == n:  # catch a value like 1e300
        raise OverflowError("n too large")
    memo: Dict[int, int] = {0: 0, 1: 1}
    if n not in memo:
        memo[n] = fib2(n - 1) + fib2(n - 2)
    return memo[n]



@lru_cache(maxsize=None)
def fib3(n: int) -> int:
    """
    Calculates the Fibonacci number of a integer n.

    >>> [ fib3(i) for i in range(12) ]
    [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

    n must not be negative
    >>> fib3(-1)
    Traceback (most recent call last):
        ...
    ValueError: n must be >= 0

    n must not be too big to fit the call stack:
    >>> fib3(1000)
    Traceback (most recent call last):
        ...
    RecursionError: maximum recursion depth exceeded in comparison


    Factorials of floats are OK, but the float must be an exact integer:
    >>> fib3(11.1)
    Traceback (most recent call last):
        ...
    ValueError: n must be exact integer
    >>> fib3(11.0)
    89

    It must also not be ridiculously large:
    >>> fib3(1e100)
    Traceback (most recent call last):
        ...
    OverflowError: n too large
    """
    if not n >= 0:
        raise ValueError("n must be >= 0")
    if math.floor(n) != n:
        raise ValueError("n must be exact integer")
    if n+1 == n:  # catch a value like 1e300
        raise OverflowError("n too large")
    if n < 2:
        return n
    n = int(n)
    return fib3(n - 1) + fib3(n - 2)


def fib4(n: int) -> int:
    """
    Calculates the Fibonacci number of a integer n.

    >>> [ fib4(i) for i in range(12) ]
    [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    >>> fib4(1000)
    43466557686937456435688527675040625802564660517371780402481729089536555417949051890403879840079255169295922593080322634775209689623239873322471161642996440906533187938298969649928516003704476137795166849228875

    n must not be negative
    >>> fib4(-1)
    Traceback (most recent call last):
        ...
    ValueError: n must be >= 0



    Factorials of floats are OK, but the float must be an exact integer:
    >>> fib4(11.1)
    Traceback (most recent call last):
        ...
    ValueError: n must be exact integer
    >>> fib4(11.0)
    89

    It must also not be ridiculously large:
    >>> fib4(1e100)
    Traceback (most recent call last):
        ...
    OverflowError: n too large
    """
    if not n >= 0:
        raise ValueError("n must be >= 0")
    if math.floor(n) != n:
        raise ValueError("n must be exact integer")
    if n+1 == n:  # catch a value like 1e300
        raise OverflowError("n too large")
    if n < 2:
        return n
    if n == 0: return n
    n = int(n)
    last: int = 0
    next: int = 1
    for _ in range(1, n):
        last, next = next, last + next
    return next


if __name__ == "__main__":
    doctest.testmod()
