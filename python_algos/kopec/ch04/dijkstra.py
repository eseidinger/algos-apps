from typing import TypeVar, Optional
from dataclasses import dataclass
from kopec.ch04.mst import WeightedPath, print_weighted_path
from kopec.ch04.weighted_graph import WeightedGraph
from kopec.ch04.weighted_edge import WeightedEdge
from kopec.ch02.generic_search import PriorityQueue

V = TypeVar('V')

@dataclass
class DijkstraNode:
    vertex: int
    distance: float

    def __lt__(self, other: "DijkstraNode") -> bool:
        return self.distance < other.distance
    
    def __eq__(self, other: "DijkstraNode") -> bool:
        return self.distance == other.distance
    
def dijkstra(wg: WeightedGraph[V], root: V) -> tuple[list[Optional[float]], dict[int, WeightedEdge]]:
    first: int = wg.index_of(root)
    distances: list[Optional[float]] = [None] * wg.vertex_count
    distances[first] = 0
    path_dict: dict[int, WeightedEdge] = {}
    pq: PriorityQueue[DijkstraNode] = PriorityQueue()
    pq.push(DijkstraNode(first, 0))
    while not pq.empty:
        u: int = pq.pop().vertex
        dist_u: float = distances[u]
        for we in wg.edges_for_index(u):
            dist_v: float = distances[we.v]
            if dist_v is None or dist_v > we.weight + dist_u:
                distances[we.v] = we.weight + dist_u
                path_dict[we.v] = we
                pq.push(DijkstraNode(we.v, we.weight + dist_u))
    return distances, path_dict

def distance_list_to_vertex_dict(wg: WeightedGraph[V], distances: list[Optional[float]]) -> dict[V, Optional[float]]:
    distance_dict: dict[V, Optional[float]] = {}
    for i in range(len(distances)):
        distance_dict[wg.vertex_at(i)] = distances[i]
    return distance_dict

def path_dict_to_path(start: int, end: int, path_dict: dict[int, WeightedEdge]) -> WeightedPath:
    if len(path_dict) == 0:
        return []
    edge_path: WeightedPath = []
    e: WeightedEdge = path_dict[end]
    edge_path.append(e)
    while e.u != start:
        e = path_dict[e.u]
        edge_path.append(e)
    return list(reversed(edge_path))

