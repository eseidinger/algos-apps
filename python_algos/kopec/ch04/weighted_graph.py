from typing import TypeVar, Generic
from kopec.ch04.graph import Graph
from kopec.ch04.weighted_edge import WeightedEdge

V = TypeVar('V')

class WeightedGraph(Generic[V], Graph[V]):
    def __init__(self, vertices: list[V] = []) -> None:
        self._vertices: list[V] = vertices
        self._edges: list[list[WeightedEdge]] = [[] for _ in vertices]

    def add_edge_by_indices(self, u: int, v: int, weight: float) -> None:
        edge: WeightedEdge = WeightedEdge(u, v, weight)
        self.add_edge(edge)

    def add_edge_by_vertices(self, first: V, second: V, weight: float) -> None:
        u: int = self._vertices.index(first)
        v: int = self._vertices.index(second)
        self.add_edge_by_indices(u, v, weight)

    def neighbors_for_index_with_weights(self, index: int) -> list[tuple[V, float]]:
        distance_tuples: list[tuple[V, float]] = []
        for edge in self.edges_for_index(index):
            distance_tuples.append((self.vertex_at(edge.v), edge.weight))
        return distance_tuples
    
    def __str__(self) -> str:
        desc: str = ""
        for i in range(self.vertex_count):
            desc += f"{self.vertex_at(i)} -> {self.neighbors_for_index_with_weights(i)}\n"
        return desc
    