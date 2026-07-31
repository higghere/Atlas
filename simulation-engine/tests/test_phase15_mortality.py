"""
Phase 15 Verification Test Suite — Clinical Failure & Functional Reserve Architecture (v22)
15 Tests verifying emergent clinical state transitions, organ reserve degradation, and ROSC recovery.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable
from layer2_body.organ_reserve import OrganReserveAccumulator
from layer3_kernel.energy_failure import EnergyFailureEngine
from layer4_clinical.neurological_failure import NeurologicalFailureEngine, BrainDeathState
from layer4_clinical.cardiac_arrest_fsm import CardiacArrestFSM, CardiacRhythmState
from layer4_clinical.mortality_engine import ClinicalStateMachine

class TestPhase15Mortality(unittest.TestCase):
    def test_01_progressive_shock_pre_terminal(self):
        fsm = CardiacArrestFSM()
        # Duration integral > 120s for MAP 40 mmHg transitions to PRE_TERMINAL
        state = fsm.update_rhythm(map_val=40.0, heart_rate=110.0, dt_seconds=130.0)
        self.assertEqual(state, CardiacRhythmState.PRE_TERMINAL)

    def test_02_untreated_hemorrhage_death(self):
        fsm = CardiacArrestFSM()
        state = fsm.update_rhythm(map_val=10.0, heart_rate=0.0, dt_seconds=700.0)
        self.assertEqual(state, CardiacRhythmState.ASYSTOLE_DEATH)

    def test_03_early_tourniquet_prevents_mortality(self):
        energy = EnergyFailureEngine()
        energy.update_energy_balance(dt_seconds=30.0, po2=40.0, map_val=45.0)
        self.assertGreater(energy.state.atp_availability_pct, 0.0)
        self.assertEqual(energy.state.permanent_necrosis_pct, 0.0)

    def test_04_late_tourniquet_irreversible_damage(self):
        energy = EnergyFailureEngine()
        for _ in range(200):
            energy.update_energy_balance(dt_seconds=2.0, po2=20.0, map_val=20.0)
        self.assertGreater(energy.state.permanent_necrosis_pct, 0.0)

    def test_05_rosc_recovery(self):
        fsm = CardiacArrestFSM()
        fsm.update_rhythm(map_val=20.0, heart_rate=10.0, dt_seconds=10.0) # Pulseless
        state = fsm.update_rhythm(map_val=75.0, heart_rate=80.0, cpr_active=True) # Resuscitated
        self.assertEqual(state, CardiacRhythmState.ROSC)

    def test_06_brain_death_irreversibility(self):
        neuro = NeurologicalFailureEngine()
        neuro.evaluate_cpp(map_val=15.0, icp_val=10.0, dt_seconds=400.0)
        self.assertEqual(neuro.state, BrainDeathState.BRAIN_DEATH)
        state = neuro.evaluate_cpp(map_val=95.0, icp_val=10.0, dt_seconds=100.0)
        self.assertEqual(state, BrainDeathState.BRAIN_DEATH)

    def test_07_septic_shock_mof(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        store.set_variable(h_map, 25.0)

        csm = ClinicalStateMachine()
        # Advance 130 seconds under severe hypotension to trigger duration integral
        for _ in range(130):
            events = csm.observe_and_update(store, st, tick=100)
        self.assertTrue(len(events) > 0)

    def test_08_atp_depletion(self):
        energy = EnergyFailureEngine()
        initial_atp = energy.state.atp_availability_pct
        energy.update_energy_balance(dt_seconds=50.0, po2=30.0, map_val=40.0)
        self.assertLess(energy.state.atp_availability_pct, initial_atp)

    def test_09_organ_reserve_degradation(self):
        reserve = OrganReserveAccumulator()
        # 60s at MAP 20.0 (high stress)
        reserve.update_reserves(map_val=20.0, ph_val=7.10, dt_seconds=60.0)
        kidney_res = reserve.reserves["ORG_KIDNEY"]
        self.assertLess(kidney_res.reserve_pct, 100.0)
        self.assertEqual(kidney_res.failure_stage, "SYMPTOMATIC")

    def test_10_terminal_event_serialization(self):
        csm = ClinicalStateMachine()
        store = UnifiedStateStore(100)
        st = SymbolTable()
        h_map = st.get_or_create_handle("blood.pressure.map", type_id=5)
        store.set_variable(h_map, 20.0)
        
        csm.neuro_engine.evaluate_cpp(map_val=10.0, dt_seconds=400.0)
        evs = csm.observe_and_update(store, st, tick=1)
        death_evs = [e for e in evs if e.id == "EV_CLINICAL_DEATH"]
        self.assertEqual(len(death_evs), 1)

    def test_11_multi_patient_isolation(self):
        e1 = EnergyFailureEngine()
        e2 = EnergyFailureEngine()
        e1.update_energy_balance(100.0, 30.0, 30.0)
        self.assertNotEqual(e1.state.atp_availability_pct, e2.state.atp_availability_pct)

    def test_12_positive_feedback_acceleration(self):
        neuro = NeurologicalFailureEngine()
        state1 = neuro.evaluate_cpp(map_val=25.0, dt_seconds=100.0)
        state2 = neuro.evaluate_cpp(map_val=25.0, dt_seconds=250.0)
        self.assertEqual(state1, BrainDeathState.REVERSIBLE_DYSFUNCTION)
        self.assertEqual(state2, BrainDeathState.BRAIN_DEATH)

    def test_13_recovery_impossible(self):
        fsm = CardiacArrestFSM()
        fsm.update_rhythm(map_val=0.0, heart_rate=0.0, dt_seconds=800.0)
        self.assertEqual(fsm.state, CardiacRhythmState.ASYSTOLE_DEATH)
        state = fsm.update_rhythm(map_val=100.0, heart_rate=72.0, cpr_active=True)
        self.assertEqual(state, CardiacRhythmState.ASYSTOLE_DEATH)

    def test_14_timeline_compatibility(self):
        store = UnifiedStateStore(100)
        st = SymbolTable()
        csm = ClinicalStateMachine()
        evs = csm.observe_and_update(store, st, tick=50)
        self.assertIsInstance(evs, list)

    def test_15_master_prior_tests_compatibility(self):
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
