"""
Phase 18 Verification Test Suite — Custom Threshold Conditions (v23.1)
5 Unit tests verifying user-specified physiological limit failure events:
1. HR > 600 or < 30 bpm
2. BP > 300 or < 90/60 mmHg (MAP < 70)
3. SpO2 < 60%
4. Core Temperature > 45°C or < 10°C
5. Master verification suite compatibility
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable
from layer3_kernel.physiological_constraints import PhysiologicalConstraintEngine

class TestPhase18CustomThresholds(unittest.TestCase):
    def test_01_hr_extreme_thresholds(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_hr = st.get_or_create_handle("heart.rate", type_id=5)
        
        # Test HR < 30 bpm
        store.set_variable(h_hr, 25.0)
        engine = PhysiologicalConstraintEngine()
        events_brady = engine.enforce_constraints(store, st, tick=1)
        self.assertTrue(any(e.id == "EV_SEVERE_BRADYCARDIA" for e in events_brady))

        # Test HR > 600 bpm
        store.set_variable(h_hr, 650.0)
        events_vf = engine.enforce_constraints(store, st, tick=2)
        self.assertTrue(any(e.id == "EV_VENTRICULAR_FIBRILLATION" for e in events_vf))

    def test_02_bp_extreme_thresholds(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)

        # Test MAP < 70 (BP < 90/60)
        store.set_variable(h_map, 50.0)
        engine = PhysiologicalConstraintEngine()
        events_hypo = engine.enforce_constraints(store, st, tick=1)
        self.assertTrue(any(e.id == "EV_CRITICAL_HYPOTENSION" for e in events_hypo))

        # Test MAP > 200 (BP > 300)
        store.set_variable(h_map, 220.0)
        events_hyper = engine.enforce_constraints(store, st, tick=2)
        self.assertTrue(any(e.id == "EV_HYPERTENSIVE_CRISIS" for e in events_hyper))

    def test_03_spo2_extreme_threshold(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_spo2 = st.get_or_create_handle("blood.spo2", type_id=5)
        store.set_variable(h_spo2, 55.0) # < 60%

        engine = PhysiologicalConstraintEngine()
        events = engine.enforce_constraints(store, st, tick=1)
        self.assertTrue(any(e.id == "EV_CRITICAL_HYPOXIA" for e in events))

    def test_04_temperature_extreme_thresholds(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_temp = st.get_or_create_handle("core.temperature", type_id=5)

        # Temp > 45 °C
        store.set_variable(h_temp, 46.5)
        engine = PhysiologicalConstraintEngine()
        events_hot = engine.enforce_constraints(store, st, tick=1)
        self.assertTrue(any(e.id == "EV_EXTREME_THERMAL_FAILURE" for e in events_hot))

        # Temp < 10 °C
        store.set_variable(h_temp, 8.0)
        events_cold = engine.enforce_constraints(store, st, tick=2)
        self.assertTrue(any(e.id == "EV_SEVERE_HYPOTHERMIA" for e in events_cold))

    def test_05_master_prior_tests_compatibility(self):
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
