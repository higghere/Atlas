"""
Base Solver Contract Interface (v12)
Defines the standard solver lifecycle, contracts, read/write sets, and rollbacks.
"""
from abc import ABC, abstractmethod
from models.enums import TimeDomain, LODLevel
from models.types import VariableHandle, ResourceHandle
from layer3_kernel.transaction_manager import StateTransaction

class SolverContract(ABC):
    @property
    @abstractmethod
    def name(self) -> str: pass

    @property
    @abstractmethod
    def execution_domain(self) -> TimeDomain: pass

    @property
    @abstractmethod
    def priority(self) -> int: pass  # Lower value = higher execution priority

    @property
    @abstractmethod
    def required_lod(self) -> LODLevel: pass

    @property
    @abstractmethod
    def deterministic(self) -> bool: pass

    @property
    @abstractmethod
    def reads(self) -> set[VariableHandle]: pass

    @property
    @abstractmethod
    def writes(self) -> set[VariableHandle]: pass

    @property
    def resources_consumed(self) -> set[ResourceHandle]:
        return set()

    @property
    def resources_produced(self) -> set[ResourceHandle]:
        return set()

    @abstractmethod
    def preconditions(self, store) -> bool: pass

    @abstractmethod
    def execute(self, store, tx: StateTransaction) -> bool: pass

    @abstractmethod
    def postconditions(self, tx: StateTransaction) -> bool: pass

    @abstractmethod
    def rollback(self, tx: StateTransaction): pass
