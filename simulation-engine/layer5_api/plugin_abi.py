"""
Plugin ABI Interface (v12)
Formal plugin contract for registering knowledge assets, solvers, capabilities, and clinical rules.
"""
from abc import ABC, abstractmethod

class BasePluginABI(ABC):
    @property
    @abstractmethod
    def plugin_name(self) -> str: pass

    @property
    @abstractmethod
    def version(self) -> str: pass

    @abstractmethod
    def register_solvers(self) -> list: pass

    @abstractmethod
    def register_rules(self) -> list: pass
