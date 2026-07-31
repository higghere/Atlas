"""
Core Types & Dataclasses for Simulation Engine (v12)
"""
from dataclasses import dataclass, field
from typing import Any, Callable, Optional
from models.enums import TimeDomain, LODLevel, UnitType, CellDeathType, TraumaType, EventPriority, AdminRoute

@dataclass(frozen=True)
class Handle:
    index: int          # 32-bit slot index
    generation: int     # 32-bit generation counter for stale handle detection
    type_id: int        # 8-bit handle type identifier

    def to_uint64(self) -> int:
        return (self.type_id << 56) | (self.generation << 32) | self.index

# Typed Alias Handles
OrganHandle       = Handle
VesselHandle      = Handle
NerveHandle       = Handle
LymphHandle       = Handle
TissueHandle      = Handle
VariableHandle    = Handle
CapabilityHandle  = Handle
SystemHandle      = Handle
DiseaseHandle     = Handle
DrugHandle        = Handle
ResourceHandle    = Handle
RegionHandle      = Handle

@dataclass
class VariableMetadata:
    handle: VariableHandle
    symbol: str
    unit: UnitType
    min_value: float
    max_value: float
    normal_min: float
    normal_max: float
    precision: float
    display_name: str
    lod: LODLevel
    owner_solver: str
    persistence: bool = True

@dataclass
class Dimension:
    mass: float = 0.0          # [M]
    length: float = 0.0        # [L]
    time: float = 0.0          # [T]
    temperature: float = 0.0   # [Theta]
    substance: float = 0.0     # [N] (moles)

    def is_compatible(self, other: 'Dimension') -> bool:
        return (
            abs(self.mass - other.mass) < 1e-6 and
            abs(self.length - other.length) < 1e-6 and
            abs(self.time - other.time) < 1e-6 and
            abs(self.temperature - other.temperature) < 1e-6 and
            abs(self.substance - other.substance) < 1e-6
        )

@dataclass
class SimulationEvent:
    id: str
    priority: EventPriority
    tick_created: int
    duration_ticks: int
    payload: dict[str, Any]
    target_handle: Handle

@dataclass
class AABB:
    min_point: tuple[float, float, float]
    max_point: tuple[float, float, float]

    def intersects(self, other: 'AABB') -> bool:
        return (
            self.min_point[0] <= other.max_point[0] and self.max_point[0] >= other.min_point[0] and
            self.min_point[1] <= other.max_point[1] and self.max_point[1] >= other.min_point[1] and
            self.min_point[2] <= other.max_point[2] and self.max_point[2] >= other.min_point[2]
        )
