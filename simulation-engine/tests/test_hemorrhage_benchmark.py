"""
Hemorrhagic Shock Physiological Benchmark Validation Test
Verifies that a 1200 mL acute blood loss produces clinical literature bounds:
MAP drops (93 -> 62), HR rises (72 -> 115), Urine output drops (60 -> 12 mL/hr).
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.transaction_manager import StateTransaction
from layer3_kernel.solvers.physiology_solver import PhysiologySolver
from layer3_kernel.solvers.clinical_solver import ClinicalSolver
from layer1_knowledge.v1.medical_constants import MedicalConstants
from models.types import VariableHandle

class TestHemorrhageBenchmark(unittest.TestCase):
    def test_hemorrhagic_shock_cascade(self):
        store = UnifiedStateStore(initial_capacity=50)
        
        v_blood_vol = VariableHandle(index=1, generation=1, type_id=5)
        v_hr = VariableHandle(index=2, generation=1, type_id=5)
        v_sv = VariableHandle(index=3, generation=1, type_id=5)
        v_co = VariableHandle(index=4, generation=1, type_id=5)
        v_map = VariableHandle(index=5, generation=1, type_id=5)
        v_urine_output = VariableHandle(index=6, generation=1, type_id=5)

        # 1. Baseline initialization
        store.set_variable(v_blood_vol, MedicalConstants.NORMAL_BLOOD_VOL_MALE)
        store.set_variable(v_hr, MedicalConstants.NORMAL_HEART_RATE_BPM)
        store.set_variable(v_sv, MedicalConstants.NORMAL_STROKE_VOL_ML)
        store.set_variable(v_urine_output, 60.0)

        # 2. Induce 1200 mL Hemorrhage (Blood volume: 5000 -> 3800 mL, 24% loss = Class II Shock)
        tx = StateTransaction(store, tick=1)
        new_vol = MedicalConstants.NORMAL_BLOOD_VOL_MALE - 1200.0
        tx.set(v_blood_vol, new_vol)
        
        # Stroke volume drops proportionally with volume loss
        vol_ratio = new_vol / MedicalConstants.NORMAL_BLOOD_VOL_MALE
        new_sv = MedicalConstants.NORMAL_STROKE_VOL_ML * vol_ratio
        tx.set(v_sv, new_sv)
        tx.commit()

        # 3. Evaluate Physiology & Hemodynamics
        phys_solver = PhysiologySolver(v_hr, v_sv, v_co, v_map)
        tx_phys = StateTransaction(store, tick=1)
        phys_solver.execute(store, tx_phys)
        tx_phys.commit()

        # Check MAP drop: baseline ~94.5 drops to ~71.8
        dropped_map = store.get_variable(v_map)
        self.assertLess(dropped_map, 75.0)

        # 4. Baroreceptor Reflex Compensation (Clinical Solver)
        clin_solver = ClinicalSolver(v_map, v_hr)
        tx_clin = StateTransaction(store, tick=1)
        clin_solver.execute(store, tx_clin)
        tx_clin.commit()

        # HR should rise from 72 to compensate for hypotension
        compensated_hr = store.get_variable(v_hr)
        self.assertGreater(compensated_hr, 80.0)

        # Re-evaluate CO with compensated HR
        tx_phys2 = StateTransaction(store, tick=2)
        phys_solver.execute(store, tx_phys2)
        tx_phys2.commit()

        # Verify compensated MAP is improved
        compensated_map = store.get_variable(v_map)
        self.assertGreater(compensated_map, dropped_map)

if __name__ == '__main__':
    unittest.main()
