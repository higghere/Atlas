"""
Symbol Table Engine (v12)
Assigns 64-bit uint Handles (Handle(index, generation, type_id)) to string UUIDs.
Builds bidirectional lookup tables between string UUIDs and runtime integer handles.
"""
from models.types import Handle, VariableHandle, OrganHandle, VesselHandle, TissueHandle, CapabilityHandle

class SymbolTable:
    def __init__(self):
        self._uuid_to_handle: dict[str, Handle] = {}
        self._handle_to_uuid: dict[int, str] = {}
        self._next_indices: dict[int, int] = {} # type_id -> next free index

    def get_or_create_handle(self, uuid_str: str, type_id: int) -> Handle:
        if uuid_str in self._uuid_to_handle:
            return self._uuid_to_handle[uuid_str]

        index = self._next_indices.get(type_id, 1)
        self._next_indices[type_id] = index + 1
        generation = 1

        handle = Handle(index=index, generation=generation, type_id=type_id)
        uint64 = handle.to_uint64()

        self._uuid_to_handle[uuid_str] = handle
        self._handle_to_uuid[uint64] = uuid_str

        return handle

    def get_handle(self, uuid_str: str) -> Handle | None:
        return self._uuid_to_handle.get(uuid_str)

    def get_uuid(self, handle: Handle) -> str | None:
        return self._handle_to_uuid.get(handle.to_uint64())

    def clear(self):
        self._uuid_to_handle.clear()
        self._handle_to_uuid.clear()
        self._next_indices.clear()
