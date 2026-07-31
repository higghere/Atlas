"""
Component Pool Implementation (v12)
Data-oriented contiguous component array storage with swap-with-last O(1) removal.
"""
from typing import TypeVar, Generic

T = TypeVar('T')

class ComponentPool(Generic[T]):
    def __init__(self, initial_capacity: int = 1024):
        self.capacity = initial_capacity
        self.sparse: list[int] = [-1] * initial_capacity   # EntityID -> Dense Index
        self.dense: list[int] = [0] * initial_capacity     # Dense Index -> EntityID
        self.components: list[T | None] = [None] * initial_capacity
        self.size = 0

    def _resize_sparse(self, new_cap: int):
        if new_cap > len(self.sparse):
            self.sparse.extend([-1] * (new_cap - len(self.sparse)))

    def insert(self, entity_id: int, component: T):
        self._resize_sparse(entity_id + 1)
        
        if self.size >= len(self.dense):
            new_cap = len(self.dense) * 2
            self.dense.extend([0] * (new_cap - len(self.dense)))
            self.components.extend([None] * (new_cap - len(self.components)))

        dense_idx = self.size
        self.sparse[entity_id] = dense_idx
        self.dense[dense_idx] = entity_id
        self.components[dense_idx] = component
        self.size += 1

    def remove(self, entity_id: int):
        if entity_id >= len(self.sparse) or self.sparse[entity_id] == -1:
            return

        dense_idx = self.sparse[entity_id]
        last_entity = self.dense[self.size - 1]
        last_component = self.components[self.size - 1]

        # Swap with last
        self.components[dense_idx] = last_component
        self.dense[dense_idx] = last_entity
        self.sparse[last_entity] = dense_idx

        self.sparse[entity_id] = -1
        self.components[self.size - 1] = None
        self.size -= 1

    def get(self, entity_id: int) -> T | None:
        if entity_id >= len(self.sparse):
            return None
        dense_idx = self.sparse[entity_id]
        if dense_idx == -1:
            return None
        return self.components[dense_idx]
