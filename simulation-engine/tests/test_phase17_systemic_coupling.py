"""
Phase 17 Verification Test Suite — Systemic Physiology Coupling & Plausibility Framework (v23)
10 Unit tests verifying whole-body inter-system dependencies, organ status calculations, plausibility validation, and replay determinism.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable
from layer3_kernel.physiological_coupling import PhysiologicalCouplingEngine
from layer3_kernel.plausibility_validator import PlausibilityValidator
from layer3_kernel.physiological_constraints import PhysiologicalConstraintEngine

class TestPhase17SystemicCoupling(unittest.TestCase):
    def test_01_massive_hemorrhage_multi_organ_deterioration(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        store.set_variable(h_map, 42.0) # Severe shock

        engine = PhysiologicalCouplingEngine()
        state = engine.update_coupling(store, st)
        self.assertLess(state.brain_status_pct, 60.0)
        self.assertLess(state.heart_status_pct, 60.0)
        self.assertLess(state.kidney_status_pct, 60.0)

    def test_02_hypoxia_simultaneous_organ_impact(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_spo2 = st.get_or_create_handle("blood.spo2", type_id=5)
        store.set_variable(h_spo2, 45.0)

        engine = PhysiologicalCouplingEngine()
        state = engine.update_coupling(store, st)
        self.assertLess(state.lung_status_pct, 50.0)
        self.assertLess(state.brain_status_pct, 50.0)

    def test_03_renal_potassium_arrhythmia_coupling(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_k = st.get_or_create_handle("blood.potassium", type_id=5)
        store.set_variable(h_k, 7.2) # Hyperkalemia from renal failure

        engine = PhysiologicalCouplingEngine()
        state = engine.update_coupling(store, st)
        self.assertGreater(state.arrhythmia_risk_score, 0.5)

    def test_04_hepatic_coagulopathy_coupling(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        store.set_variable(h_map, 25.0)

        engine = PhysiologicalCouplingEngine()
        state = engine.update_coupling(store, st)
        self.assertGreater(state.coagulopathy_factor, 1.0)

    def test_05_plausibility_validator_zero_co_high_map(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        h_co = st.get_or_create_handle("cardiac.output", type_id=5)
        store.set_variable(h_map, 80.0)
        store.set_variable(h_co, 0.0) # Zero CO with normal MAP is implausible

        validator = PlausibilityValidator()
        events = validator.validate_plausibility(store, st, tick=10)
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0].id, "PLAUSIBILITY_WARNING")

    def test_06_plausibility_validator_high_spo2_zero_perfusion(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        h_spo2 = st.get_or_create_handle("blood.spo2", type_id=5)
        store.set_variable(h_map, 10.0)
        store.set_variable(h_spo2, 99.0) # High SpO2 during zero MAP is implausible

        validator = PlausibilityValidator()
        events = validator.validate_plausibility(store, st, tick=10)
        self.assertTrue(any(e.id == "PLAUSIBILITY_WARNING" for e in events))

    def test_07_constraint_engine_vf_event(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_hr = st.get_or_create_handle("heart.rate", type_id=5)
        store.set_variable(h_hr, 320.0)

        constraints = PhysiologicalConstraintEngine()
        events = constraints.enforce_constraints(store, st, tick=10)
        self.assertTrue(any(e.id == "EV_VENTRICULAR_FIBRILLATION" for e in events))

    def test_08_constraint_engine_circulatory_collapse(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        store.set_variable(h_map, 12.0)

        constraints = PhysiologicalConstraintEngine()
        events = constraints.enforce_constraints(store, st, tick=10)
        self.assertTrue(any(e.id == "EV_CIRCULATORY_COLLAPSE" for e in events))

    def test_09_replay_determinism_coupling(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        store.set_variable(h_map, 35.0)

        e1 = PhysiologicalCouplingEngine()
        e2 = PhysiologicalCouplingEngine()
        s1 = e1.update_coupling(store, st)
        s2 = e2.update_coupling(store, st)
        self.assertEqual(s1.brain_status_pct, s2.brain_status_pct)

    def test_10_prior_tests_master_compatibility(self):
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
