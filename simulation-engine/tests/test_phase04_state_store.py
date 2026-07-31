"""
Phase 4 Verification Test Suite
Tests UnifiedStateStore array hot-path, ComponentPool O(1) swap-with-last compaction, and BVH spatial indexing.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer2_body.state_store import UnifiedStateStore
from layer2_body.component_pools import ComponentPool
from layer2_body.spatial_bvh import BVHSpatialIndex
from models.types import VariableHandle, TissueHandle, Handle, AABB

class TestPhase04StateStore(unittest.TestCase):
    def test_array_hot_path_state_store(self):
        store = UnifiedStateStore(initial_capacity=100)
        v1 = VariableHandle(index=42, generation=1, type_id=5)
        v2 = VariableHandle(index=150, generation=1, type_id=5) # Auto resize trigger

        store.set_variable(v1, 98.6)
        store.set_variable(v2, 120.0)

        self.assertEqual(store.get_variable(v1), 98.6)
        self.assertEqual(store.get_variable(v2), 120.0)
        self.assertGreaterEqual(len(store.get_raw_array()), 151)

    def test_component_pool_compaction(self):
        pool: ComponentPool[str] = ComponentPool(initial_capacity=10)
        pool.insert(1, "CompA")
        pool.insert(2, "CompB")
        pool.insert(3, "CompC")

        self.assertEqual(pool.size, 3)
        self.assertEqual(pool.get(2), "CompB")

        # Swap-with-last removal of entity 2
        pool.remove(2)
        self.assertEqual(pool.size, 2)
        self.assertIsNone(pool.get(2))
        self.assertEqual(pool.get(3), "CompC")

    def test_bvh_tissue_query(self):
        t1 = TissueHandle(index=1, generation=1, type_id=2)
        t2 = TissueHandle(index=2, generation=1, type_id=2)

        aabb1 = AABB((0, 0, 0), (10, 10, 10))
        aabb2 = AABB((20, 20, 20), (30, 30, 30))

        bvh = BVHSpatialIndex()
        bvh.build([(t1, aabb1), (t2, aabb2)])

        query_aabb = AABB((5, 5, 5), (15, 15, 15))
        hits = bvh.query_box(query_aabb)

        self.assertIn(t1, hits)
        self.assertNotIn(t2, hits)

if __name__ == '__main__':
    unittest.main()
