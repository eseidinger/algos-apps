from typing import TypeVar, Iterable, Protocol, Sequence, Generic, Optional, Callable, Deque
from heapq import heappush, heappop

T = TypeVar('T')


def linear_contains(iterable: Iterable[T], key: T) -> bool:
    for item in iterable:
        if item == key:
            return True
    return False


C = TypeVar('C', bound='Comparable')


class Comparable(Protocol):
    def __eq__(self, other: any) -> bool:
        ...

    def __lt__(self: C, other: C) -> bool:
        ...

    def __gt__(self: C, other: C) -> bool:
        return (not self < other) and self != other

    def __le__(self: C, other: C) -> bool:
        return self < other or self == other

    def __ge__(self: C, other: C) -> bool:
        return not self < other


def binary_contains(sequence: Sequence[C], key: C) -> bool:
    low: int = 0
    high: int = len(sequence) - 1
    while low <= high:
        mid: int = (low + high) // 2
        if sequence[mid] < key:
            low = mid + 1
        elif sequence[mid] > key:
            high = mid - 1
        else:
            return True
    return False


class Stack(Generic[T]):
    def __init__(self) -> None:
        self._container: list[T] = []

    @property
    def empty(self) -> bool:
        return not self._container
    
    def content_copy(self) -> list[T]:
        return self._container.copy()

    def push(self, item: T) -> None:
        self._container.append(item)

    def pop(self) -> T:
        return self._container.pop()

    def __repr__(self) -> str:
        return repr(self._container)


class Node(Generic[T]):
    def __init__(self, state: T, parent: Optional["Node"],
                 cost: float = 0.0, heuristic: float = 0.0) -> None:
        self.state: T = state
        self.parent: Optional[Node] = parent
        self.cost: float = cost
        self.heuristic: float = heuristic

    def __lt__(self, other: "Node") -> bool:
        return (self.cost + self.heuristic) < (other.cost + other.heuristic)


def dfs(initial: T, goal_test: Callable[[T], bool],
        successors: Callable[[T], list[T]]) -> Optional[Node[T]]:
    frontier: Stack[Node[T]] = Stack()
    frontier.push(Node(initial, None))
    explored: set[T] = {initial}

    while not frontier.empty:
        current_node: Node[T] = frontier.pop()
        current_state: T = current_node.state
        if goal_test(current_state):
            return current_node
        for child in successors(current_state):
            if child in explored:
                continue
            explored.add(child)
            frontier.push(Node(child, current_node))
    return None


class DFS(Generic[T]):
    def __init__(self, initial: T, goal_test: Callable[[T], bool],
                 successors: Callable[[T], list[T]]) -> None:
        self._frontier: Stack[Node[T]] = Stack()
        self._current_node: Optional[Node[T]] = Node(initial, None)
        self._frontier.push(self._current_node)
        self._explored: set[T] = {initial}
        self._goal_test: Callable[[T], bool] = goal_test
        self._successors: Callable[[T], list[T]] = successors
        self._solution: Optional[Node[T]] = None

    @property
    def currentNode(self) -> Optional[Node[T]]:
        return self._current_node
    
    @property
    def solution(self) -> Optional[Node[T]]:
        return self._solution
    
    @property
    def frontier(self) -> Stack[Node[T]]:
        return self._frontier
    
    @property
    def explored(self) -> set[T]:
        return self._explored

    def step(self) -> bool:
        if self._frontier.empty:
            return True
        self._current_node: Node[T] = self._frontier.pop()
        current_state: T = self._current_node.state
        if self._goal_test(current_state):
            self._solution = self._current_node
            return True
        for child in self._successors(current_state):
            if child in self._explored:
                continue
            self._explored.add(child)
            self._frontier.push(Node(child, self._current_node))
        return False

    def solve(self) -> Optional[Node[T]]:
        while not self.step():
            pass
        return self._solution


def node_to_path(node: Node[T]) -> list[T]:
    path: list[T] = [node.state]
    while node.parent is not None:
        node = node.parent
        path.append(node.state)
    path.reverse()
    return path


class Queue(Generic[T]):
    def __init__(self) -> None:
        self._container: Deque[T] = Deque()

    @property
    def empty(self) -> bool:
        return not self._container

    def push(self, item: T) -> None:
        self._container.append(item)

    def pop(self) -> T:
        return self._container.popleft()

    def __repr__(self) -> str:
        return repr(self._container)


def bfs(initial: T, goal_test: Callable[[T], bool],
        successors: Callable[[T], list[T]]) -> Optional[Node[T]]:
    frontier: Queue[Node[T]] = Queue()
    frontier.push(Node(initial, None))
    explored: set[T] = {initial}

    while not frontier.empty:
        current_node: Node[T] = frontier.pop()
        current_state: T = current_node.state
        if goal_test(current_state):
            return current_node
        for child in successors(current_state):
            if child in explored:
                continue
            explored.add(child)
            frontier.push(Node(child, current_node))
    return None


class PriorityQueue(Generic[T]):
    def __init__(self) -> None:
        self._container: list[T] = []

    @property
    def empty(self) -> bool:
        return not self._container

    def push(self, item: T) -> None:
        heappush(self._container, item)

    def pop(self) -> T:
        return heappop(self._container)

    def __repr__(self) -> str:
        return repr(self._container)


def astar(initial: T, goal_test: Callable[[T], bool],
          successors: Callable[[T], list[T]],
          heuristic: Callable[[T], float]) -> Optional[Node[T]]:
    frontier: PriorityQueue[Node[T]] = PriorityQueue()
    frontier.push(Node(initial, None, 0.0, heuristic(initial)))
    explored: dict[T, float] = {initial: 0.0}

    while not frontier.empty:
        current_node: Node[T] = frontier.pop()
        current_state: T = current_node.state
        if goal_test(current_state):
            return current_node
        for child in successors(current_state):
            new_cost: float = current_node.cost + 1
            if child not in explored or explored[child] > new_cost:
                explored[child] = new_cost
                frontier.push(Node(child, current_node,
                              new_cost, heuristic(child)))
    return None
