"""
Versioned State Transaction Manager (v12)
Manages working buffer mutations, copy-on-write read isolation, and atomic commits.
"""
from models.types import VariableHandle
from layer2_body.state_store import UnifiedStateStore

class StateTransaction:
    def __init__(self, base_store: UnifiedStateStore, tick: int, version: str = "A"):
        self.base_store = base_store
        self.tick = tick
        self.version = version
        self._working_buffer: dict[int, float] = {}

    def get(self, handle: VariableHandle) -> float:
        idx = handle.index
        if idx in self._working_buffer:
            return self._working_buffer[idx]
        return self.base_store.get_variable(handle)

    def set(self, handle: VariableHandle, value: float):
        self._working_buffer[handle.index] = float(value)

    def get_modified_variables(self) -> dict[int, float]:
        return self._working_buffer

    def commit(self):
        """Atomic commit of working buffer to base state store"""
        for idx, val in self._working_buffer.items():
            handle = VariableHandle(index=idx, generation=1, type_id=5)
            self.base_store.set_variable(handle, val)
        self._working_buffer.clear()

    def rollback(self):
        """Discard working buffer mutations"""
        self._working_buffer.clear()
