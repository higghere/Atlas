"""
Phase 7 Verification Test Suite
Tests VariableRegistry metadata and Dual ConstraintEngine hard clamping & soft warning checks.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.variable_registry import VariableRegistry
from layer3_kernel.constraint_engine import ConstraintEngine
from layer3_kernel.transaction_manager import StateTransaction
from models.types import VariableHandle
from models.enums import UnitType, LODLevel

class TestPhase07Constraints(unittest.TestCase):
    def test_variable_registry_metadata(self):
        reg = VariableRegistry()
        v_glucose = VariableHandle(index=1, generation=1, type_id=5)
        
        meta = reg.register_variable(
            handle=v_glucose,
            symbol="blood.glucose.concentration",
            unit=UnitType.MG_DL,
            min_value=0.0,
            max_value=1000.0,
            normal_min=70.0,
            normal_max=99.0,
            precision=1.0,
            display_name="Blood Glucose"
        )

        self.assertIsNotNone(meta)
        self.assertEqual(reg.get_metadata(v_glucose).display_name, "Blood Glucose")

    def test_dual_constraint_clamping_and_warnings(self):
        reg = VariableRegistry()
        store = UnifiedStateStore(initial_capacity=10)
        v_vol = VariableHandle(index=1, generation=1, type_id=5)
        
        reg.register_variable(
            handle=v_vol,
            symbol="blood.volume.total",
            unit=UnitType.ML,
            min_value=0.0,            # Hard min (Cannot be negative volume)
            max_value=10000.0,        # Hard max
            normal_min=4500.0,        # Soft normal min
            normal_max=5500.0,        # Soft normal max
            precision=10.0,
            display_name="Total Blood Volume"
        )

        engine = ConstraintEngine(reg)

        # 1. Test Soft Warning (3500ml is hypovolemia, but physically possible)
        tx1 = StateTransaction(store, tick=1)
        tx1.set(v_vol, 3500.0)
        res1 = engine.validate(tx1)
        self.assertEqual(tx1.get(v_vol), 3500.0) # Unclamped
        self.assertTrue(any("SOFT CLINICAL WARNING" in v for v in res1.violations))

        # 2. Test Hard Clamp (-500ml is physically impossible -> Clamped to 0.0)
        tx2 = StateTransaction(store, tick=1)
        tx2.set(v_vol, -500.0)
        res2 = engine.validate(tx2)
        self.assertEqual(tx2.get(v_vol), 0.0) # Clamped to 0.0
        self.assertTrue(any("HARD CONSTRAINT CLAMP" in v for v in res2.violations))

if __name__ == '__main__':
    unittest.main()
