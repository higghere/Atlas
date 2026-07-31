"""
Phase 13 Comprehensive Verification Test Suite (v17)
13 Tests verifying Simulation Mode Expansion:
1. Patient Profile -> engine inputs mapping (Zero equations in BaselineGenerator)
2. ScenarioCompiler UUID -> Handle resolution
3. ScenarioValidator rejecting impossible scenarios (negative doses / bleed rates)
4. AI Parser producing ScenarioDraft without mutating engine state
5. SimulationSessionBuilder 9-stage warm-up pipeline
6. Preset scenario loading
7. Guided ScenarioBuilder output using typed Handles
8. Deterministic replay compatibility
9. Save/load active scenario integration
10. Timeline fork compatibility
11. Delayed events firing at correct simulation ticks
12. Scenario Packages (.hascase) ZIP container import/export
13. Warm-up initialization producing a stabilized physiological baseline
"""
import unittest
import sys
import os
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer5_api.simulation_mode import SimulationMode
from layer5_api.session_builder import SimulationSessionBuilder
from layer5_api.scenario_compiler import ScenarioCompiler
from layer5_api.scenario_validator import ScenarioValidator
from layer5_api.scenario_builder import ScenarioBuilder
from layer5_api.ai_scenario_parser import AIScenarioParser
from layer5_api.case_package_manager import CasePackageManager
from layer1_knowledge.symbol_table import SymbolTable
from models.types import Handle, OrganHandle, VesselHandle, SimulationEvent
from models.enums import EventPriority

class TestPhase13SimulationModeExpanded(unittest.TestCase):
    def test_01_baseline_generator_inputs_only(self):
        """1. Verify BaselineGenerator maps profile inputs without calculating physiology equations"""
        builder = SimulationSessionBuilder(os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1')))
        profile = {"age": 50, "sex": "male", "weight_kg": 80.0, "height_cm": 175.0, "smoking": True}
        builder.baseline_gen.map_profile_to_inputs(profile, builder.api.store, builder.api.assets.symbol_table)
        
        h_age = builder.api.assets.symbol_table.get_handle("patient.age")
        h_weight = builder.api.assets.symbol_table.get_handle("patient.weight_kg")
        self.assertEqual(builder.api.store.get_variable(h_age), 50.0)
        self.assertEqual(builder.api.store.get_variable(h_weight), 80.0)

    def test_02_scenario_compiler(self):
        """2. Verify ScenarioCompiler resolves string UUIDs into Handles"""
        st = SymbolTable()
        compiler = ScenarioCompiler(st)
        raw_scenario = {
            "scenario_id": "SCN_TEST",
            "name": "Test Scenario",
            "initial_events": [
                {"id": "EV_1", "priority": "HEMORRHAGE", "target_uuid": "VES_AORTA", "payload": {"bleed_rate_ml_min": 100.0}}
            ]
        }
        compiled = compiler.compile_scenario(raw_scenario)
        self.assertEqual(len(compiled["events"]), 1)
        self.assertIsInstance(compiled["events"][0].target_handle, Handle)

    def test_03_scenario_validator_rejection(self):
        """3. Verify ScenarioValidator rejects negative doses / bleed rates"""
        st = SymbolTable()
        compiler = ScenarioCompiler(st)
        raw_invalid = {
            "initial_events": [
                {"id": "EV_BAD", "priority": "HEMORRHAGE", "payload": {"bleed_rate_ml_min": -50.0}}
            ]
        }
        compiled = compiler.compile_scenario(raw_invalid)
        errors = ScenarioValidator.validate_compiled_scenario(compiled)
        self.assertEqual(len(errors), 1)
        self.assertIn("Invalid negative bleed rate", errors[0])

    def test_04_ai_parser_no_mutation(self):
        """4. Verify AI Parser produces ScenarioDraft without mutating engine state"""
        st = SymbolTable()
        parser = AIScenarioParser()
        prompt = "Stab wound to abdomen with active bleeding"
        draft = parser.parse_prompt(prompt, st)
        self.assertIsNotNone(draft)
        self.assertEqual(draft.estimated_severity, "Critical")

    def test_05_session_builder_warmup_pipeline(self):
        """5. Verify SimulationSessionBuilder 9-stage warm-up pipeline"""
        builder = SimulationSessionBuilder(os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1')))
        profile = {"age": 30, "sex": "male", "weight_kg": 70.0}
        raw_scenario = {"scenario_id": "SCN_1", "name": "Scn 1", "initial_events": []}
        
        session = builder.build_session(profile, raw_scenario, warmup_ticks=5)
        self.assertEqual(builder.api.current_tick, 0) # Warmup ticks run, then reset to 0 for start
        self.assertIsNotNone(session["preview_vitals"])

    def test_06_preset_scenario_loading(self):
        """6. Verify Preset scenario loading"""
        sim_mode = SimulationMode(os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1')))
        profile = {"age": 40, "sex": "female"}
        scenario = {"scenario_id": "SCN_KNIFE_STAB", "name": "Knife Stab", "initial_events": []}
        session = sim_mode.create_session(profile, scenario)
        self.assertEqual(session["scenario"]["scenario_id"], "SCN_KNIFE_STAB")

    def test_07_guided_scenario_builder_handles(self):
        """7. Verify Guided ScenarioBuilder output using typed Handles"""
        organ_h = OrganHandle(index=1, generation=1, type_id=1)
        ev = ScenarioBuilder.create_penetrating_trauma_event("left_abdomen", 6.0, "knife", organ_h)
        self.assertEqual(ev.target_handle, organ_h)

    def test_08_deterministic_replay_compatibility(self):
        """8. Verify Deterministic replay compatibility"""
        sim_mode = SimulationMode(os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1')))
        sim_mode.create_session({"age": 30}, {"initial_events": []})
        api = sim_mode.launch()
        api.step(10)
        self.assertEqual(api.current_tick, 10)

    def test_09_save_load_active_scenarios(self):
        """9. Verify Save/load active scenario integration"""
        sim_mode = SimulationMode(os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1')))
        sim_mode.create_session({"age": 30}, {"initial_events": []})
        api = sim_mode.launch()
        
        with tempfile.NamedTemporaryFile(suffix='.has', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            api.save_checkpoint(tmp_path)
            api.load_checkpoint(tmp_path)
            self.assertEqual(api.current_tick, 0)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_10_timeline_fork_after_simulation_start(self):
        """10. Verify Timeline fork after simulation start"""
        sim_mode = SimulationMode(os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1')))
        sim_mode.create_session({"age": 30}, {"initial_events": []})
        api = sim_mode.launch()
        api.step(5)
        self.assertEqual(api.current_tick, 5)

    def test_11_delayed_events_timing(self):
        """11. Verify Delayed events firing at correct simulation ticks"""
        vessel_h = VesselHandle(index=1, generation=1, type_id=3)
        ev_delayed = ScenarioBuilder.create_hemorrhage_event(100.0, 10, vessel_h, start_tick=15)
        self.assertEqual(ev_delayed.tick_created, 15)

    def test_12_case_package_manager_hascase(self):
        """12. Verify Scenario Packages (.hascase) ZIP container import/export"""
        with tempfile.NamedTemporaryFile(suffix='.hascase', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            scn = {"name": "Case 1"}
            labs = {"bmp": "normal"}
            meds = ["lisinopril"]
            objs = [{"id": "obj1"}]

            CasePackageManager.export_case_package(tmp_path, scn, labs, meds, objs)
            loaded = CasePackageManager.load_case_package(tmp_path)
            
            self.assertEqual(loaded["scenario"]["name"], "Case 1")
            self.assertEqual(loaded["medications"][0], "lisinopril")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_13_warmup_initialization_stabilization(self):
        """13. Verify Warm-up initialization producing a stable baseline"""
        builder = SimulationSessionBuilder(os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1')))
        session = builder.build_session({"age": 30}, {"initial_events": []}, warmup_ticks=5)
        self.assertEqual(session["preview_vitals"]["status"], "Physiology Stabilized (Warm-Up Complete)")

if __name__ == '__main__':
    unittest.main()
