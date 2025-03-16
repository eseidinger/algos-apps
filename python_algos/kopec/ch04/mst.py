from typing import TypeVar, Optional
from kopec.ch04.weighted_graph import WeightedGraph
from kopec.ch04.weighted_edge import WeightedEdge
from kopec.ch02.generic_search import PriorityQueue

V = TypeVar('V')

WeightedPath = list[WeightedEdge]

def total_weight(wp: WeightedPath) -> float:
    return sum([e.weight for e in wp])

def mst(wg: WeightedGraph[V], start: int = 0) -> Optional[WeightedPath]:
    if start > (wg.vertex_count - 1) or start < 0:
        return None
    result: WeightedPath = []
    pq: PriorityQueue[WeightedEdge] = PriorityQueue()
    visited: list[bool] = [False] * wg.vertex_count

    def visit(index: int):
        visited[index] = True
        for edge in wg.edges_for_index(index):
            if not visited[edge.v]:
                pq.push(edge)

    visit(start)

    while not pq.empty:
        edge = pq.pop()
        if visited[edge.v]:
            continue
        result.append(edge)
        visit(edge.v)
    return result

def print_weighted_path(wg: WeightedGraph, wp: WeightedPath) -> None:
    for edge in wp:
        print(f"{wg.vertex_at(edge.u)} {edge.weight}> {wg.vertex_at(edge.v)}")
    print(f"Total weight: {total_weight(wp)}")
