"""
Phase 5 Verification Test Suite
Tests StateTransaction atomic commit & rollback, Multi-Rate Scheduler timing, and LODScheduler acuity scaling.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.transaction_manager import StateTransaction
from layer3_kernel.scheduler import Scheduler, TimeDomain
from layer3_kernel.lod_scheduler import LODScheduler, LODLevel
from models.types import VariableHandle

class TestPhase05Scheduler(unittest.TestCase):
    def test_state_transaction_commit_rollback(self):
        store = UnifiedStateStore(initial_capacity=50)
        var = VariableHandle(index=10, generation=1, type_id=5)
        store.set_variable(var, 100.0)

        # 1. Test Rollback
        tx = StateTransaction(store, tick=1)
        tx.set(var, 200.0)
        self.assertEqual(tx.get(var), 200.0)
        self.assertEqual(store.get_variable(var), 100.0) # Base store untouched
        
        tx.rollback()
        self.assertEqual(tx.get(var), 100.0) # Reverted

        # 2. Test Atomic Commit
        tx2 = StateTransaction(store, tick=1)
        tx2.set(var, 300.0)
        tx2.commit()
        self.assertEqual(store.get_variable(var), 300.0) # Base store updated

    def test_multi_rate_scheduler(self):
        scheduler = Scheduler(fixed_dt=0.001) # 1ms steps
        
        # Initial tick 0 should trigger all domains
        due = scheduler.get_due_domains()
        self.assertIn(TimeDomain.ELECTRICAL, due)
        self.assertIn(TimeDomain.CARDIAC, due)

        # Advance 5ms -> ELECTRICAL should trigger, CARDIAC should not
        for _ in range(5):
            scheduler.advance()
        due_5ms = scheduler.get_due_domains()
        self.assertIn(TimeDomain.ELECTRICAL, due_5ms)
        self.assertNotIn(TimeDomain.CARDIAC, due_5ms)

    def test_lod_scheduler_acuity(self):
        self.assertEqual(LODScheduler.compute_active_lod(0.0), LODLevel.LOD0_ORGAN)
        self.assertEqual(LODScheduler.compute_active_lod(0.5), LODLevel.LOD2_FUNCTIONAL)
        self.assertEqual(LODScheduler.compute_active_lod(0.9), LODLevel.LOD3_POPULATION)

if __name__ == '__main__':
    unittest.main()
