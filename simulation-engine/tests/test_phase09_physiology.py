"""
Phase 9 Verification Test Suite
Tests Decoupled Physiology Models (Cardiovascular, Respiratory, Renal, Acid-Base, Endocrine).
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.physiology_models.cardiovascular_model import CardiovascularModel
from layer3_kernel.physiology_models.respiratory_model import RespiratoryModel
from layer3_kernel.physiology_models.renal_model import RenalModel
from layer3_kernel.physiology_models.acid_base_model import AcidBaseModel
from layer3_kernel.physiology_models.endocrine_model import EndocrineModel
from models.types import VariableHandle

class TestPhase09Physiology(unittest.TestCase):
    def test_acid_base_henderson_hasselbalch(self):
        store = UnifiedStateStore(initial_capacity=20)
        v_pco2 = VariableHandle(index=1, generation=1, type_id=5)
        v_hco3 = VariableHandle(index=2, generation=1, type_id=5)
        v_ph = VariableHandle(index=3, generation=1, type_id=5)

        store.set_variable(v_pco2, 40.0) # Normal pCO2
        store.set_variable(v_hco3, 24.0) # Normal HCO3

        model = AcidBaseModel(v_pco2, v_hco3, v_ph)
        rates = model.update(store, dt=1.0)
        
        # pH = 6.1 + log10(24 / (0.03 * 40)) = 6.1 + log10(20) ≈ 7.40
        self.assertAlmostEqual(rates[v_ph], 7.40, places=2)

    def test_renal_gfr_creatinine_model(self):
        store = UnifiedStateStore(initial_capacity=20)
        v_gfr = VariableHandle(index=1, generation=1, type_id=5)
        v_creat = VariableHandle(index=2, generation=1, type_id=5)
        v_bun = VariableHandle(index=3, generation=1, type_id=5)

        store.set_variable(v_gfr, 30.0) # Severe GFR drop (30 mL/min)

        model = RenalModel(v_gfr, v_creat, v_bun)
        rates = model.update(store, dt=1.0)

        # Creatinine should double (0.8 * 120 / 30 = 3.2 mg/dL)
        self.assertAlmostEqual(rates[v_creat], 3.2, places=2)

if __name__ == '__main__':
    unittest.main()
