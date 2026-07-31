"""
Runtime State Store (Array Hot-Path) (v12)
Stores canonical variables in flat contiguous Python lists indexed directly by integer variable handle indices.
Eliminates dictionary lookups in hot simulation loops.
"""
from typing import Any
from models.types import VariableHandle

class UnifiedStateStore:
    def __init__(self, initial_capacity: int = 10000):
        self._capacity = initial_capacity
        # Contiguous array for variable values indexed by handle.index
        self._values: list[float] = [0.0] * initial_capacity

    def ensure_capacity(self, index: int):
        if index >= len(self._values):
            new_cap = max(index + 1, len(self._values) * 2)
            self._values.extend([0.0] * (new_cap - len(self._values)))

    def get_variable(self, handle: VariableHandle) -> float:
        idx = handle.index
        if idx >= len(self._values):
            return 0.0
        return self._values[idx]

    def set_variable(self, handle: VariableHandle, value: float):
        idx = handle.index
        self.ensure_capacity(idx)
        self._values[idx] = float(value)

    def get_raw_array(self) -> list[float]:
        return self._values

    def clear(self):
        self._values = [0.0] * len(self._values)
