"""
Prediction Manifest & Data Models (v23.0)
Contains PredictionManifest, DrugHandle, ProcedureHandle, and PredictionProgress types.
"""
from dataclasses import dataclass, field
import hashlib
import json
import time

@dataclass
class TypedHandle:
    id: str
    symbol: str
    category: str

@dataclass
class DrugIntervention:
    drug: TypedHandle
    dose_mg: float
    route: str
    duration_ticks: int = 10

@dataclass
class ProcedureIntervention:
    procedure: TypedHandle
    depth_cm: float
    duration_ticks: int = 20

@dataclass
class PredictionManifest:
    prediction_id: str
    patient_hash: str
    knowledge_hash: str
    knowledge_version: str = "v23.0"
    compiler_version: str = "v1.0"
    engine_version: str = "v23.0"
    seed: int = 42
    prediction_type: str = "COMBINED"
    checkpoints: list[int] = field(default_factory=lambda: [30, 120, 360, 1440])
    medications: list[DrugIntervention] = field(default_factory=list)
    procedures: list[ProcedureIntervention] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)

    def compute_hash(self) -> str:
        serialized = json.dumps({
            "patient_hash": self.patient_hash,
            "knowledge_hash": self.knowledge_hash,
            "engine_version": self.engine_version,
            "checkpoints": self.checkpoints,
            "meds": [{"id": m.drug.id, "dose": m.dose_mg} for m in self.medications],
            "procs": [{"id": p.procedure.id, "depth": p.depth_cm} for p in self.procedures]
        }, sort_keys=True)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

@dataclass
class PredictionProgress:
    total_ticks: int
    completed_ticks: int
    current_checkpoint: int
    estimated_remaining_ms: float
    status: str
