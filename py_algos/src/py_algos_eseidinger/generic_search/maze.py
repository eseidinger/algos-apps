"""
Maze class for use with generic search algorithms.
This module provides a Maze class that represents a grid-based maze with
start and goal locations. It includes methods for generating the maze,
finding successors, marking paths, and calculating distances.
The Maze class is used in conjunction with search algorithms such as
depth-first search (DFS), breadth-first search (BFS), and A* search.
The maze is represented as a grid of cells, where each cell can be empty,
blocked, a start location, a goal location, or part of a path.
The maze can be generated randomly with a specified level of sparseness,
and the search algorithms can be visualized step by step.
"""

from typing import NamedTuple, Optional, Callable
from enum import Enum
import random
from math import sqrt

from py_algos_eseidinger.generic_search.generic_search import (
    Node,
    dfs,
    node_to_path,
    bfs,
    astar,
    DFS,
)


class Cell(str, Enum):
    """
    Enum representing the different types of cells in the maze.
    Each cell can be one of the following:
    - EMPTY: An empty cell.
    - BLOCKED: A blocked cell.
    - START: The starting cell.
    - GOAL: The goal cell.
    - PATH: A cell that is part of the path.
    - FRONTIER: A cell that is part of the frontier.
    - EXPLORED: A cell that has been explored.
    """
    EMPTY = " "
    BLOCKED = "X"
    START = "S"
    GOAL = "G"
    PATH = "*"
    FRONTIER = "O"
    EXPLORED = "."


class MazeLocation(NamedTuple):
    """
    NamedTuple representing a location in the maze.
    Each location is defined by its row and column indices.
    Attributes:
        row (int): The row index of the location.
        column (int): The column index of the location.
    """
    row: int
    column: int


class Maze:
    """
    Class representing a maze.
    The maze is represented as a grid of cells, where each cell can be empty,
    blocked, a start location, a goal location, or part of a path.
    The maze can be generated randomly with a specified level of sparseness.
    Attributes:
        rows (int): The number of rows in the maze.
        columns (int): The number of columns in the maze.
        sparseness (float): The level of sparseness for blocked cells.
        start (MazeLocation): The starting location in the maze.
        goal (MazeLocation): The goal location in the maze.
    """
    def __init__(
        self,
        rows: int = 10,
        columns: int = 10,
        sparseness: float = 0.2,
        start: MazeLocation = MazeLocation(0, 0),
        goal: MazeLocation = MazeLocation(9, 9),
    ) -> None:
        self._rows: int = rows
        self._columns: int = columns
        self.start: MazeLocation = start
        self.goal: MazeLocation = goal
        self._grid: list[list[Cell]] = [
            [Cell.EMPTY for c in range(columns)] for r in range(rows)
        ]
        self._randomly_fill(rows, columns, sparseness)
        self._grid[start.row][start.column] = Cell.START
        self._grid[goal.row][goal.column] = Cell.GOAL

    def _randomly_fill(self, rows: int, columns: int, sparseness: float):
        for row in range(rows):
            for column in range(columns):
                if random.uniform(0, 1.0) < sparseness:
                    self._grid[row][column] = Cell.BLOCKED

    def __str__(self) -> str:
        output: str = ""
        for row in self._grid:
            output += "".join([c.value for c in row]) + "\n"
        return output

    def goal_test(self, ml: MazeLocation) -> bool:
        """
        Check if the given maze location is the goal location.
        Args:
            ml (MazeLocation): The maze location to check.
        Returns:
            bool: True if the location is the goal, False otherwise.
        """
        return ml == self.goal

    def successors(self, ml: MazeLocation) -> list[MazeLocation]:
        """
        Find the successors of the given maze location.
        Args:
            ml (MazeLocation): The maze location to find successors for.
        Returns:
            list[MazeLocation]: A list of successor locations.
        """
        locations: list[MazeLocation] = []
        if (
            ml.row + 1 < self._rows
            and self._grid[ml.row + 1][ml.column] != Cell.BLOCKED
        ):
            locations.append(MazeLocation(ml.row + 1, ml.column))
        if ml.row - 1 >= 0 and self._grid[ml.row - 1][ml.column] != Cell.BLOCKED:
            locations.append(MazeLocation(ml.row - 1, ml.column))
        if (
            ml.column + 1 < self._columns
            and self._grid[ml.row][ml.column + 1] != Cell.BLOCKED
        ):
            locations.append(MazeLocation(ml.row, ml.column + 1))
        if ml.column - 1 >= 0 and self._grid[ml.row][ml.column - 1] != Cell.BLOCKED:
            locations.append(MazeLocation(ml.row, ml.column - 1))
        return locations

    def mark(self, path: list[MazeLocation]):
        """
        Mark the path in the maze.
        Args:
            path (list[MazeLocation]): The path to mark.
        """
        for maze_location in path:
            self._grid[maze_location.row][maze_location.column] = Cell.PATH
        self._grid[self.start.row][self.start.column] = Cell.START
        self._grid[self.goal.row][self.goal.column] = Cell.GOAL

    def mark_frontier(self, frontier: list[MazeLocation]):
        """
        Mark the frontier in the maze.
        Args:
            frontier (list[MazeLocation]): The frontier to mark.
        """
        for maze_location in frontier:
            self._grid[maze_location.row][maze_location.column] = Cell.FRONTIER
        self._grid[self.start.row][self.start.column] = Cell.START
        self._grid[self.goal.row][self.goal.column] = Cell.GOAL

    def mark_explored(self, explored: list[MazeLocation]):
        """
        Mark the explored locations in the maze.
        Args:
            explored (list[MazeLocation]): The explored locations to mark.
        """
        for maze_location in explored:
            self._grid[maze_location.row][maze_location.column] = Cell.EXPLORED
        self._grid[self.start.row][self.start.column] = Cell.START
        self._grid[self.goal.row][self.goal.column] = Cell.GOAL

    def clear(self, path: list[MazeLocation]):
        """
        Clear the path in the maze.
        Args:
            path (list[MazeLocation]): The path to clear.
        """
        for maze_location in path:
            self._grid[maze_location.row][maze_location.column] = Cell.EMPTY
        self._grid[self.start.row][self.start.column] = Cell.START
        self._grid[self.goal.row][self.goal.column] = Cell.GOAL

    def euclidean_distance(self, ml: MazeLocation) -> float:
        """
        Calculate the Euclidean distance from the given maze location to the goal.
        Args:
            ml (MazeLocation): The maze location to calculate the distance from.
        Returns:
            float: The Euclidean distance to the goal.
        """
        xdist: int = ml.column - self.goal.column
        ydist: int = ml.row - self.goal.row
        return sqrt((xdist * xdist) + (ydist * ydist))

    def manhattan_distance(self, ml: MazeLocation) -> float:
        """
        Calculate the Manhattan distance from the given maze location to the goal.
        Args:
            ml (MazeLocation): The maze location to calculate the distance from.
        Returns:
            float: The Manhattan distance to the goal.
        """
        xdist: int = abs(ml.column - self.goal.column)
        ydist: int = abs(ml.row - self.goal.row)
        return xdist + ydist


def euclidean_distance(goal: MazeLocation) -> Callable[[MazeLocation], float]:
    """
    Create a distance function that calculates the Euclidean distance
    from a given maze location to the goal.
    Args:
        goal (MazeLocation): The goal location to calculate the distance to.
    Returns:
        Callable[[MazeLocation], float]: A function that takes a MazeLocation
        and returns the Euclidean distance to the goal.
    """
    def distance(ml: MazeLocation) -> float:
        xdist: int = ml.column - goal.column
        ydist: int = ml.row - goal.row
        return sqrt((xdist * xdist) + (ydist * ydist))

    return distance


def manhattan_distance(goal: MazeLocation) -> Callable[[MazeLocation], float]:
    """
    Create a distance function that calculates the Manhattan distance
    from a given maze location to the goal.
    Args:
        goal (MazeLocation): The goal location to calculate the distance to.
    Returns:
        Callable[[MazeLocation], float]: A function that takes a MazeLocation
        and returns the Manhattan distance to the goal.
    """
    def distance(ml: MazeLocation) -> float:
        xdist: int = abs(ml.column - goal.column)
        ydist: int = abs(ml.row - goal.row)
        return xdist + ydist

    return distance


def main_step_by_step() -> None:
    """
    Main function to demonstrate the step-by-step execution of the DFS algorithm
    on a randomly generated maze.
    It creates a maze, initializes the DFS algorithm, and prints the maze
    at each step, marking the explored locations, frontier, and path.
    """
    m: Maze = Maze(sparseness=0.2)
    print(m)
    dfs: DFS = DFS(m.start, m.goal_test, m.successors)
    while not dfs.step():
        current_solution: Optional[Node[MazeLocation]] = dfs.currentNode
        current_path = node_to_path(current_solution)
        current_frontier = [n.state for n in dfs.frontier.content_copy()]
        m.mark_explored(dfs.explored)
        m.mark_frontier(current_frontier)
        m.mark(current_path)
        print(m)
        print(current_frontier)
        m.clear(dfs.explored)
        m.clear(current_frontier)
        m.clear(current_path)
    if dfs.solution is None:
        print("No solution found with depth-first search!")
    else:
        solution: Optional[Node[MazeLocation]] = dfs.solution
        path = node_to_path(solution)
        current_frontier = [n.state for n in dfs.frontier.content_copy()]
        m.mark_explored(dfs.explored)
        m.mark_frontier(current_frontier)
        m.mark(path)
        print(m)
        print(current_frontier)
        m.clear(dfs.explored)
        m.clear(current_frontier)
        m.clear(path)


def main() -> None:
    """
    Main function to demonstrate the use of different search algorithms
    (DFS, BFS, A*) on a randomly generated maze.
    It creates a maze, initializes the search algorithms, and prints the maze
    at each step, marking the explored locations, frontier, and path.
    """
    m: Maze = Maze(sparseness=0.2)
    print(m)
    solution1: Optional[Node[MazeLocation]] = dfs(m.start, m.goal_test, m.successors)
    if solution1 is None:
        print("No solution found with depth-first search!")
    else:
        path1: list[MazeLocation] = node_to_path(solution1)
        m.mark(path1)
        print(m)
        m.clear(path1)
        print(m)

    solution2: Optional[Node[MazeLocation]] = bfs(m.start, m.goal_test, m.successors)
    if solution2 is None:
        print("No solution found with breadth-first search!")
    else:
        path2: list[MazeLocation] = node_to_path(solution2)
        m.mark(path2)
        print(m)
        m.clear(path2)
        print(m)

    distance: Callable[[MazeLocation], float] = manhattan_distance(m.goal)
    solution3: Optional[Node[MazeLocation]] = astar(
        m.start, m.goal_test, m.successors, distance
    )
    if solution3 is None:
        print("No solution found with A*!")
    else:
        path3: list[MazeLocation] = node_to_path(solution3)
        m.mark(path3)
        print(m)
        m.clear(path3)


if __name__ == "__main__":
    main_step_by_step()
