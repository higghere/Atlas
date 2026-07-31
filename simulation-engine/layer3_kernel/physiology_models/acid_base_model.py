"""
Acid-Base Regulation Model (v12)
Henderson-Hasselbalch equation (pH = 6.1 + log([HCO3-]/0.03*pCO2)) and anion gap.
"""
import math
from layer3_kernel.physiology_models.base_model import PhysiologyModelContract
from layer1_knowledge.compiled_assets import CompiledAssets
from models.types import VariableHandle

class AcidBaseModel(PhysiologyModelContract):
    def __init__(self, v_pco2: VariableHandle, v_hco3: VariableHandle, v_ph: VariableHandle):
        self._v_pco2 = v_pco2
        self._v_hco3 = v_hco3
        self._v_ph = v_ph

    @property
    def name(self) -> str: return "AcidBaseModel"
    def initialize(self, compiled_assets: CompiledAssets, store) -> bool: return True
    def reset(self): pass
    def serialize(self) -> dict: return {"name": self.name}
    def validate(self) -> list[str]: return []

    def update(self, store, dt: float) -> dict[VariableHandle, float]:
        pco2 = store.get_variable(self._v_pco2)
        hco3 = store.get_variable(self._v_hco3)
        if hco3 <= 0: hco3 = 24.0
        if pco2 <= 0: pco2 = 40.0

        # Henderson-Hasselbalch: pH = 6.1 + log10(HCO3 / (0.03 * pCO2))
        ph_val = 6.1 + math.log10(hco3 / (0.03 * pco2))
        return {
            self._v_ph: max(6.8, min(7.8, ph_val))
        }
