"""
Compiled Assets Container (v12)
Immutable container for runtime compiled assets.
"""
from dataclasses import dataclass, field
from typing import Any
from models.types import Handle

@dataclass(frozen=True)
class CompiledAssets:
    organs: dict[Handle, dict[str, Any]]
    tissues: dict[Handle, dict[str, Any]]
    vessels: dict[Handle, dict[str, Any]]
    nerves: dict[Handle, dict[str, Any]]
    equations: dict[Handle, Any]
    symbol_table: Any
