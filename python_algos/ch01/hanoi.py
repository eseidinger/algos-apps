from typing import TypeVar, Generic

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._container: list[T] = []
    def push(self, item: T) -> None:
        self._container.append(item)
    def pop(self) -> T:
        return self._container.pop()
    def __repr__(self) -> str:
        return repr(self._container)
    
num_discs: int = 3

tower_a: Stack[int] = Stack()
tower_b: Stack[int] = Stack()
tower_c: Stack[int] = Stack()

for i in range(1, num_discs + 1):
    tower_a.push(i)

def hanoi(begin: Stack[int], end: Stack[int], temp: Stack[int], n: int) -> None:
    if n == 1:
        end.push(begin.pop())
    else:
        hanoi(begin, temp, end, n - 1)
        print(tower_a)
        print(tower_b)
        print(tower_c)
        print()
        hanoi(begin, end, temp, 1)
        print(tower_a)
        print(tower_b)
        print(tower_c)
        print()
        hanoi(temp, end, begin, n - 1)
        print(tower_a)
        print(tower_b)
        print(tower_c)
        print()

if __name__ == "__main__":
    print(tower_a)
    print(tower_b)
    print(tower_c)
    print()
    hanoi(tower_a, tower_b, tower_c, num_discs)
    print(tower_a)
    print(tower_b)
    print(tower_c)
