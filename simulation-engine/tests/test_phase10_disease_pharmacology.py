"""
Phase 10 Verification Test Suite
Tests Disease Process Engine pathways and Pharmacology ADME drug clearance engine.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.transaction_manager import StateTransaction
from layer3_kernel.disease_engine import DiseaseEngine, DiseasePathway
from layer3_kernel.pharmacology_engine import PharmacologyEngine
from models.types import VariableHandle, Handle

class TestPhase10DiseasePharmacology(unittest.TestCase):
    def test_disease_pathway_cascade(self):
        store = UnifiedStateStore(initial_capacity=20)
        v_glucose = VariableHandle(index=1, generation=1, type_id=5)
        v_microvascular_damage = VariableHandle(index=2, generation=1, type_id=5)

        store.set_variable(v_glucose, 250.0) # Hyperglycemia (>180)
        store.set_variable(v_microvascular_damage, 0.0)

        engine = DiseaseEngine()
        engine.register_pathway(DiseasePathway(
            name="AGE_microvascular_damage",
            trigger_var=v_glucose,
            threshold=180.0,
            target_var=v_microvascular_damage,
            modifier_rate=2.5
        ))

        tx = StateTransaction(store, tick=1)
        engine.evaluate_pathways(store, tx)
        tx.commit()

        self.assertEqual(store.get_variable(v_microvascular_damage), 2.5)

    def test_pharmacology_adme_clearance(self):
        store = UnifiedStateStore(initial_capacity=20)
        v_drug = VariableHandle(index=1, generation=1, type_id=5)
        v_hep = VariableHandle(index=2, generation=1, type_id=5)
        v_gfr = VariableHandle(index=3, generation=1, type_id=5)

        store.set_variable(v_drug, 100.0) # Initial 100 mg/L
        store.set_variable(v_hep, 100.0)  # Normal liver 100%
        store.set_variable(v_gfr, 120.0)  # Normal GFR 120 mL/min

        pharm = PharmacologyEngine(v_drug, v_hep, v_gfr, half_life_hrs=1.0)

        # Step 3600 seconds (1 hour = 1 half life)
        tx = StateTransaction(store, tick=1)
        pharm.step_adme(store, tx, dt=3600.0)
        tx.commit()

        # Concentration should drop by approx 50% (~50.0 mg/L)
        self.assertAlmostEqual(store.get_variable(v_drug), 50.0, delta=5.0)

if __name__ == '__main__':
    unittest.main()
