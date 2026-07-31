"""
Endocrine Axis Model (v12)
HPA, HPT, and Pancreatic Beta/Alpha cell feedback loops.
"""
from layer3_kernel.physiology_models.base_model import PhysiologyModelContract
from layer1_knowledge.compiled_assets import CompiledAssets
from models.types import VariableHandle

class EndocrineModel(PhysiologyModelContract):
    def __init__(self, v_glucose: VariableHandle, v_insulin: VariableHandle):
        self._v_glucose = v_glucose
        self._v_insulin = v_insulin

    @property
    def name(self) -> str: return "EndocrineModel"
    def initialize(self, compiled_assets: CompiledAssets, store) -> bool: return True
    def reset(self): pass
    def serialize(self) -> dict: return {"name": self.name}
    def validate(self) -> list[str]: return []

    def update(self, store, dt: float) -> dict[VariableHandle, float]:
        glucose = store.get_variable(self._v_glucose)
        # Pancreatic beta cells release insulin proportionally to hyperglycemia
        insulin_secretion = max(0.0, (glucose - 90.0) * 0.1)
        return {
            self._v_insulin: insulin_secretion
        }
