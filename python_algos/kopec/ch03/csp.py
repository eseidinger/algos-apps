from typing import Generic, TypeVar, Optional
from abc import ABC, abstractmethod

V = TypeVar('V')
D = TypeVar('D')

class Constraint(Generic[V, D], ABC):
    def __init__(self, variables: list[V]) -> None:
        self.variables = variables

    @abstractmethod
    def satisfied(self, assignment: dict[V, D]) -> bool:
        ...

class CSP(Generic[V, D]):
    def __init__(self, variables: list[V], domains: dict[V, list[D]]) -> None:
        self.variables: list[V] = variables
        self.domains: dict[V, list[D]] = domains
        self.constraints: dict[V, list[Constraint[V, D]]] = {}
        for variable in self.variables:
            self.constraints[variable] = []
            if variable not in self.domains:
                raise LookupError("Every variable should have a domain assigned to it.")
            
    def add_constraint(self, constraint: Constraint[V, D]) -> None:
        for variable in constraint.variables:
            if variable not in self.variables:
                raise LookupError("Variable in constraint not in CSP.")
            else:
                self.constraints[variable].append(constraint)

    def consistent(self, variable: V, assignment: dict[V, D]) -> bool:
        for constraint in self.constraints[variable]:
            if not constraint.satisfied(assignment):
                return False
        return True
    
    def backtracking_search(self, assignment: dict[V, D] = {}) -> Optional[dict[V, D]]:
        if len(assignment) == len(self.variables):
            return assignment
        
        unassigned: list[V] = [v for v in self.variables if v not in assignment]

        first: V = unassigned[0]
        for value in self.domains[first]:
            local_assignment = assignment.copy()
            local_assignment[first] = value
            if self.consistent(first, local_assignment):
                result: Optional[dict[V, D]] = self.backtracking_search(local_assignment)
                if result is not None:
                    return result
        return None
    