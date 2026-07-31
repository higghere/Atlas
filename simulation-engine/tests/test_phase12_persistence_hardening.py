"""
Phase 12 Verification Test Suite
Tests EventSourcedRecorder, SaveFileManager ZIP packaging, DiagnosticsManager, and SimulationAPI Facade.
"""
import unittest
import sys
import os
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.recorder import EventSourcedRecorder
from layer5_api.save_manager import SaveFileManager
from layer1_knowledge.manifest import SimulationManifest
from layer3_kernel.diagnostics_manager import DiagnosticsManager
from layer5_api.simulation_api import SimulationAPI
from models.types import VariableHandle, Handle

class TestPhase12PersistenceHardening(unittest.TestCase):
    def test_save_and_load_file_manager(self):
        store = UnifiedStateStore(initial_capacity=50)
        v1 = VariableHandle(index=5, generation=1, type_id=5)
        store.set_variable(v1, 42.5)

        manifest = SimulationManifest()

        with tempfile.NamedTemporaryFile(suffix='.has', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            # 1. Save
            SaveFileManager.save_simulation(tmp_path, store, manifest, current_tick=100)
            
            # Clear store
            store.clear()
            self.assertEqual(store.get_variable(v1), 0.0)

            # 2. Load
            loaded_manifest = SaveFileManager.load_simulation(tmp_path, store)
            self.assertEqual(loaded_manifest["current_tick"], 100)
            self.assertEqual(store.get_variable(v1), 42.5)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_diagnostics_causal_tracing(self):
        diag = DiagnosticsManager()
        diag.log_cause("blood.creatinine", "Kidney filtration dropped due to GFR 30 mL/min")
        diag.log_cause("blood.creatinine", "Creatinine clearance reduced")
        diag.log_cause("blood.glucose", "Insulin released")

        chain = diag.trace_causal_chain("blood.creatinine")
        self.assertEqual(len(chain), 2)
        self.assertTrue(all("creatinine" in entry for entry in chain))

    def test_simulation_facade_api(self):
        knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1'))
        api = SimulationAPI(knowledge_dir)

        api.step(10)
        self.assertEqual(api.current_tick, 10)

        # Test variable set/get via string UUID
        res = api.set_variable("VES_AORTA", 120.0)
        self.assertTrue(res)
        self.assertEqual(api.get_variable("VES_AORTA"), 120.0)

if __name__ == '__main__':
    unittest.main()
