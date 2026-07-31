"""
Persistent Simulation Session Object & Metadata Container (v18)
Stores complete session state, metadata, patient profile, scenario, baseline snapshot, and objectives.
"""
from dataclasses import dataclass, field
from typing import Any
import uuid

@dataclass
class SessionMetadata:
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    creation_time_iso: str = "2026-07-31T20:15:00Z"
    engine_version: str = "18.0.0"
    knowledge_hash: str = "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
    plugin_hash: str = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    scenario_hash: str = "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2"
    patient_hash: str = "b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b"
    seed: int = 42
    author: str = "User"
    notes: str = ""

@dataclass
class SimulationSession:
    metadata: SessionMetadata
    patient_profile: dict[str, Any]
    scenario: dict[str, Any]
    baseline_snapshot: list[float]      # StateStore float array at t_0
    current_timeline_id: str = "main"
    objectives: list[dict[str, Any]] = field(default_factory=list)
