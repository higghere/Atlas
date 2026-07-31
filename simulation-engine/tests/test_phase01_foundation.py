"""
Phase 1 Verification Test Suite
Tests Enums, Types, Handles, MathUtils, UnitEngine, and Numerical Integrators.
"""
import unittest
import sys
import os

# Ensure simulation-engine is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.enums import TimeDomain, LODLevel, UnitType, EventPriority
from models.types import Handle, AABB, VariableMetadata
from layer3_kernel.math_utils import MathUtils
from layer3_kernel.units import UnitEngine
from layer3_kernel.solvers.integrators import Integrators

class TestPhase01Foundation(unittest.TestCase):
    def test_handle_bitpacking(self):
        # type_id=2 (Organ), generation=5, index=42
        handle = Handle(index=42, generation=5, type_id=2)
        uint64 = handle.to_uint64()
        self.assertIsInstance(uint64, int)
        
        # Verify type_id is in top 8 bits
        extracted_type = (uint64 >> 56) & 0xFF
        self.assertEqual(extracted_type, 2)
        
        # Verify generation is in middle 24 bits
        extracted_gen = (uint64 >> 32) & 0xFFFFFF
        self.assertEqual(extracted_gen, 5)

        # Verify index is in low 32 bits
        extracted_idx = uint64 & 0xFFFFFFFF
        self.assertEqual(extracted_idx, 42)

    def test_kahan_stable_sum(self):
        # Accumulate small floats that usually cause accumulation drift
        small_vals = [0.1] * 1000
        standard_sum = sum(small_vals)
        kahan_sum = MathUtils.stable_sum(small_vals)
        self.assertAlmostEqual(kahan_sum, 100.0, places=6)

    def test_unit_dimensional_validation(self):
        # mmHg and kPa are compatible pressure units
        self.assertTrue(UnitEngine.validate_addition(UnitType.MMHG, UnitType.KPA))
        
        # mmHg (pressure) and mL (volume) are incompatible
        self.assertFalse(UnitEngine.validate_addition(UnitType.MMHG, UnitType.ML))
        
        # Unit conversion test
        kpa_val = UnitEngine.convert(100.0, UnitType.MMHG, UnitType.KPA)
        self.assertAlmostEqual(kpa_val, 13.3322, places=3)

    def test_rk4_integrator(self):
        # Exponential growth / decay test: dy/dt = -y, exact solution y(t) = y0 * e^(-t)
        # Integrate from y0 = 100 with dt = 0.1 over 10 steps (t = 1.0)
        y = 100.0
        dt = 0.1
        decay_rate = -1.0
        
        def derivative(val):
            return decay_rate * val

        for _ in range(10):
            y = Integrators.rk4(y, dt, derivative)

        # Exact y(1.0) = 100 * e^(-1) ≈ 36.787944117
        import math
        exact = 100.0 * math.exp(-1.0)
        self.assertAlmostEqual(y, exact, places=4)

    def test_aabb_intersection(self):
        box1 = AABB(min_point=(0, 0, 0), max_point=(10, 10, 10))
        box2 = AABB(min_point=(5, 5, 5), max_point=(15, 15, 15))
        box3 = AABB(min_point=(20, 20, 20), max_point=(30, 30, 30))

        self.assertTrue(box1.intersects(box2))
        self.assertFalse(box1.intersects(box3))

if __name__ == '__main__':
    unittest.main()
