"""
Phase 6 Verification Test Suite
Tests EventDispatcher priority ordering, TaskGraphBuilder read/write conflict grouping, and SolverExecutor pipeline.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer3_kernel.event_dispatcher import EventDispatcher
from layer3_kernel.task_graph import TaskGraphBuilder
from layer3_kernel.solver_executor import SolverExecutor
from layer3_kernel.solvers.base_solver import SolverContract
from layer3_kernel.transaction_manager import StateTransaction
from layer2_body.state_store import UnifiedStateStore
from models.types import SimulationEvent, VariableHandle, Handle
from models.enums import EventPriority, TimeDomain, LODLevel

class DummySolver(SolverContract):
    def __init__(self, name_str: str, priority_val: int, reads_set: set, writes_set: set):
        self._name = name_str
        self._priority = priority_val
        self._reads = reads_set
        self._writes = writes_set

    @property
    def name(self) -> str: return self._name
    @property
    def execution_domain(self) -> TimeDomain: return TimeDomain.CIRCULATION
    @property
    def priority(self) -> int: return self._priority
    @property
    def required_lod(self) -> LODLevel: return LODLevel.LOD0_ORGAN
    @property
    def deterministic(self) -> bool: return True
    @property
    def reads(self) -> set: return self._reads
    @property
    def writes(self) -> set: return self._writes

    def preconditions(self, store) -> bool: return True
    def execute(self, store, tx: StateTransaction) -> bool:
        for w in self._writes:
            tx.set(w, tx.get(w) + 1.0)
        return True
    def postconditions(self, tx: StateTransaction) -> bool: return True
    def rollback(self, tx: StateTransaction): pass

class TestPhase06TaskGraph(unittest.TestCase):
    def test_event_priority_ordering(self):
        dispatcher = EventDispatcher()
        target = Handle(index=1, generation=1, type_id=1)
        
        e1 = SimulationEvent("ev1", EventPriority.PHYSIOLOGY_UPDATE, 1, 0, {}, target)
        e2 = SimulationEvent("ev2", EventPriority.EXTERNAL_INPUT, 1, 0, {}, target)
        e3 = SimulationEvent("ev3", EventPriority.TRAUMA_IMPACT, 1, 0, {}, target)

        dispatcher.emit(e1)
        dispatcher.emit(e2)
        dispatcher.emit(e3)

        processed = dispatcher.process_queue()
        # Expect order: EXTERNAL_INPUT (0), TRAUMA_IMPACT (1), PHYSIOLOGY_UPDATE (4)
        self.assertEqual(processed[0].id, "ev2")
        self.assertEqual(processed[1].id, "ev3")
        self.assertEqual(processed[2].id, "ev1")

    def test_task_graph_stage_grouping(self):
        v1 = VariableHandle(index=1, generation=1, type_id=5)
        v2 = VariableHandle(index=2, generation=1, type_id=5)

        s1 = DummySolver("solver1", 1, reads_set={v1}, writes_set={v2})
        s2 = DummySolver("solver2", 2, reads_set={v1}, writes_set=set()) # Reads v1, no conflict with s1!
        s3 = DummySolver("solver3", 3, reads_set={v2}, writes_set={v1}) # Conflicts with s1 (writes v1, reads v2)

        stages = TaskGraphBuilder.build_execution_stages([s1, s2, s3])
        # Expect s1 and s2 in Stage 1, s3 pushed to Stage 2
        self.assertEqual(len(stages), 2)
        self.assertIn(s1, stages[0])
        self.assertIn(s2, stages[0])
        self.assertIn(s3, stages[1])

    def test_solver_executor(self):
        store = UnifiedStateStore(initial_capacity=10)
        v1 = VariableHandle(index=1, generation=1, type_id=5)
        s1 = DummySolver("s1", 1, set(), {v1})
        
        executor = SolverExecutor([s1])
        txs = executor.execute_all(store, base_tick=1)
        
        self.assertEqual(len(txs), 1)
        self.assertEqual(store.get_variable(v1), 1.0)

if __name__ == '__main__':
    unittest.main()
