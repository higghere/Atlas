"""
Base Physiology Model Contract (v12)
Decouples pure medical science rate models from numerical solvers.
"""
from abc import ABC, abstractmethod
from typing import Any
from layer1_knowledge.compiled_assets import CompiledAssets

class PhysiologyModelContract(ABC):
    @property
    @abstractmethod
    def name(self) -> str: pass

    @abstractmethod
    def initialize(self, compiled_assets: CompiledAssets, store) -> bool: pass

    @abstractmethod
    def update(self, store, dt: float) -> dict[Any, float]:
        """Returns dictionary of rates of change / derivatives or target variable values"""
        pass

    @abstractmethod
    def reset(self): pass

    @abstractmethod
    def serialize(self) -> dict: pass

    @abstractmethod
    def validate(self) -> list[str]: pass
