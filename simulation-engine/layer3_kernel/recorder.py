"""
Event-Sourced Recorder Engine (v12)
Manages compressed delta logs, checkpoints, state hashing, and instant rollback.
"""
from dataclasses import dataclass
from layer2_body.state_store import UnifiedStateStore
from models.types import SimulationEvent

@dataclass
class CheckpointNode:
    tick: int
    raw_values: list[float]
    state_hash: str

class EventSourcedRecorder:
    def __init__(self, checkpoint_interval: int = 100):
        self.checkpoint_interval = checkpoint_interval
        self.checkpoints: dict[int, CheckpointNode] = {}
        self.event_log: list[tuple[int, SimulationEvent]] = []

    def record_tick(self, tick: int, store: UnifiedStateStore, events: list[SimulationEvent]):
        for e in events:
            self.event_log.append((tick, e))

        if tick % self.checkpoint_interval == 0:
            raw_copy = list(store.get_raw_array())
            import hashlib
            state_hash = hashlib.sha256(str(raw_copy).encode('utf-8')).hexdigest()
            self.checkpoints[tick] = CheckpointNode(tick=tick, raw_values=raw_copy, state_hash=state_hash)

    def rollback_to_checkpoint(self, tick: int, store: UnifiedStateStore) -> bool:
        if tick in self.checkpoints:
            cp = self.checkpoints[tick]
            for idx, val in enumerate(cp.raw_values):
                store._values[idx] = val
            return True
        return False
