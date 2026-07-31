"""
Phase 8 Verification Test Suite
Tests LocalizedResourceEngine microcirculation physics and 4 Core Solvers.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer2_body.resource_transport import LocalizedResourceEngine, MicrocirculationSegment
from layer3_kernel.transaction_manager import StateTransaction
from layer3_kernel.solvers.physiology_solver import PhysiologySolver
from layer3_kernel.solvers.biochemistry_solver import BiochemistrySolver
from layer3_kernel.solvers.clinical_solver import ClinicalSolver
from models.types import VariableHandle, VesselHandle, TissueHandle

class TestPhase08Transport(unittest.TestCase):
    def test_localized_microcirculation_transport(self):
        store = UnifiedStateStore(initial_capacity=50)
        
        v_art_p = VariableHandle(index=1, generation=1, type_id=5)
        v_ven_p = VariableHandle(index=2, generation=1, type_id=5)
        v_t_o2 = VariableHandle(index=3, generation=1, type_id=5)
        v_t_atp = VariableHandle(index=4, generation=1, type_id=5)

        store.set_variable(v_art_p, 100.0) # Arterial pressure 100 mmHg
        store.set_variable(v_ven_p, 5.0)   # Venous pressure 5 mmHg
        store.set_variable(v_t_o2, 90.0)   # Initial tissue O2 90%
        store.set_variable(v_t_atp, 95.0)  # Initial tissue ATP 95%

        engine = LocalizedResourceEngine()
        seg = MicrocirculationSegment(
            vessel_handle=VesselHandle(index=1, generation=1, type_id=3),
            tissue_handle=TissueHandle(index=1, generation=1, type_id=2),
            radius_mm=2.0,
            length_mm=10.0,
            viscosity_cp=3.5,
            capillary_area_cm2=5.0
        )
        engine.register_segment(seg)

        tx = StateTransaction(store, tick=1)
        engine.step_transport(store, tx, dt=0.1, v_art_press=v_art_p, v_ven_press=v_ven_p, v_tissue_o2=v_t_o2, v_tissue_atp=v_t_atp)

        self.assertNotEqual(tx.get(v_t_o2), 90.0)
        self.assertGreater(tx.get(v_t_o2), 0.0)

    def test_solvers_execution_cascade(self):
        store = UnifiedStateStore(initial_capacity=50)
        
        v_hr = VariableHandle(index=1, generation=1, type_id=5)
        v_sv = VariableHandle(index=2, generation=1, type_id=5)
        v_co = VariableHandle(index=3, generation=1, type_id=5)
        v_map = VariableHandle(index=4, generation=1, type_id=5)
        v_glucose = VariableHandle(index=5, generation=1, type_id=5)
        v_insulin = VariableHandle(index=6, generation=1, type_id=5)
        v_creat = VariableHandle(index=7, generation=1, type_id=5)
        v_gfr = VariableHandle(index=8, generation=1, type_id=5)

        store.set_variable(v_hr, 75.0)
        store.set_variable(v_sv, 70.0)
        store.set_variable(v_glucose, 150.0)
        store.set_variable(v_insulin, 10.0)
        store.set_variable(v_gfr, 60.0) # Impaired GFR (60 mL/min)

        # 1. Physiology Solver
        phys_solver = PhysiologySolver(v_hr, v_sv, v_co, v_map)
        tx1 = StateTransaction(store, tick=1)
        phys_solver.execute(store, tx1)
        tx1.commit()

        self.assertEqual(store.get_variable(v_co), 5250.0) # 75 * 70
        self.assertAlmostEqual(store.get_variable(v_map), 94.5, places=2) # 5250 * 0.018

        # 2. Biochemistry Solver
        biochem_solver = BiochemistrySolver(v_glucose, v_insulin, v_creat, v_gfr)
        tx2 = StateTransaction(store, tick=1)
        biochem_solver.execute(store, tx2)
        tx2.commit()

        self.assertEqual(store.get_variable(v_glucose), 130.0) # 150 - (10 * 2)
        self.assertAlmostEqual(store.get_variable(v_creat), 1.6, places=2) # 0.8 * (120/60)

        # 3. Clinical Baroreceptor Solver
        store.set_variable(v_map, 50.0) # Trigger hypotension
        clin_solver = ClinicalSolver(v_map, v_hr)
        tx3 = StateTransaction(store, tick=1)
        clin_solver.execute(store, tx3)
        tx3.commit()

        self.assertEqual(store.get_variable(v_hr), 135.0) # 75 + (90 - 50) * 1.5

if __name__ == '__main__':
    unittest.main()
