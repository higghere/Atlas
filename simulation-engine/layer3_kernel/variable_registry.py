"""
Variable Registry Metadata System (v12)
Maintains rich clinical and technical metadata for every VariableHandle.
"""
from models.types import VariableHandle, VariableMetadata
from models.enums import UnitType, LODLevel

class VariableRegistry:
    def __init__(self):
        self._metadata_by_index: dict[int, VariableMetadata] = {}

    def register_variable(
        self,
        handle: VariableHandle,
        symbol: str,
        unit: UnitType,
        min_value: float,
        max_value: float,
        normal_min: float,
        normal_max: float,
        precision: float,
        display_name: str,
        lod: LODLevel = LODLevel.LOD0_ORGAN,
        owner_solver: str = "core"
    ) -> VariableMetadata:
        meta = VariableMetadata(
            handle=handle,
            symbol=symbol,
            unit=unit,
            min_value=min_value,
            max_value=max_value,
            normal_min=normal_min,
            normal_max=normal_max,
            precision=precision,
            display_name=display_name,
            lod=lod,
            owner_solver=owner_solver
        )
        self._metadata_by_index[handle.index] = meta
        return meta

    def get_metadata(self, handle: VariableHandle) -> VariableMetadata | None:
        return self._metadata_by_index.get(handle.index)
