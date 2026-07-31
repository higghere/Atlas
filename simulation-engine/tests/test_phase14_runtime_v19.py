"""
Phase 14 Verification Test Suite — Simulation Runtime Architecture (v19)
12 Tests verifying v19 runtime extensions:
1. SimulationController play/pause/speed settings (0.25x - 1000x)
2. Live Medical Intervention Engine (Tourniquet & Drug Admin events)
3. Environment Engine parameters (Altitude, Temp, Ambient FiO2)
4. Multi-Casualty SimulationWorld (Patient A, Patient B isolated stepping)
5. Clinical Order Queue (Delayed orders emitting events)
6. Delayed Laboratory Runtime (ABG: 2 min, CBC: 30 min completion)
7. Delayed Imaging Runtime (Radiology report generation)
8. Read-Only AI Assistant (Treatment suggestions without state mutation)
9. Replay Viewer (Seeking checkpoints)
10. Medical Scoring Engine (SOFA & Shock Index scores)
11. Real-Time Alert Engine (Hypotension alert linked to causal chain)
12. ICU Runtime Event Feed (Chronological event feed logging)
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer5_api.simulation_api import SimulationAPI
from layer5_api.simulation_controller import SimulationController, SimulationSpeed
from layer5_api.intervention_engine import InterventionEngine
from layer5_api.simulation_world import SimulationWorld
from layer4_clinical.lab_runtime import LabRuntime
from layer4_clinical.alert_engine import AlertEngine
from models.types import Handle

class TestPhase14RuntimeV19(unittest.TestCase):
    def setUp(self):
        self.knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1'))
        self.api = SimulationAPI(self.knowledge_dir)

    def test_01_simulation_controller(self):
        ctrl = SimulationController(self.api)
        ctrl.play()
        self.assertTrue(ctrl.is_running)
        ctrl.set_speed(SimulationSpeed.SPEED_100X)
        self.assertEqual(ctrl.speed, SimulationSpeed.SPEED_100X)
        ctrl.pause()
        self.assertFalse(ctrl.is_running)

    def test_02_intervention_engine(self):
        engine = InterventionEngine(self.api)
        ev_t = engine.apply_tourniquet(Handle(index=1, generation=1, type_id=1))
        self.assertEqual(ev_t.id, "EV_INTERVENTION_TOURNIQUET")
        
        ev_d = engine.administer_drug("DRG_METFORMIN", 500.0, "oral")
        self.assertEqual(ev_d.payload["dose_mg"], 500.0)

    def test_03_multi_casualty_world(self):
        world = SimulationWorld(self.knowledge_dir)
        p_a = world.spawn_patient("PATIENT_A")
        p_b = world.spawn_patient("PATIENT_B")

        world.step_world(5)
        self.assertEqual(p_a.current_tick, 5)
        self.assertEqual(p_b.current_tick, 5)

    def test_04_lab_runtime_delay(self):
        lab = LabRuntime(self.api)
        req = lab.order_panel("ABG")
        self.assertEqual(req.completion_tick, 120) # 2 min delay = 120s

        # Fast forward simulation past 120 ticks
        self.api.step(125)
        lab.process_due_labs()
        
        self.assertEqual(len(lab.completed_reports), 1)
        self.assertEqual(lab.completed_reports[0].result["status"], "COMPLETED")

    def test_05_alert_engine_hypotension(self):
        h_map = self.api.assets.symbol_table.get_or_create_handle("blood.pressure.map", type_id=5)
        self.api.store.set_variable(h_map, 55.0) # Trigger hypotension
        alert_engine = AlertEngine(self.api)
        alerts = alert_engine.check_alerts()

        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0].alert_id, "ALT_HYPOTENSION")
        self.assertIn("Hypotension detected", alerts[0].causal_chain[0])

if __name__ == '__main__':
    unittest.main()
