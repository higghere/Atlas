"""
Auditable Evidence Graph (v23.2)
Tracks explicit causal arrows between source variables, target variables, timestamps, evidence types, confidence ratings, and responsible solvers/events.
"""
from dataclasses import dataclass, field

@dataclass
class EvidenceEdge:
    source_var: str
    target_var: str
    timestamp_tick: int
    evidence_type: str  # "VOLUMETRIC_DEPLETION", "PERFUSION_DROP", "HYPOXIA", "ACIDOSIS"
    confidence_score: float  # 0.0 - 1.0
    responsible_solver: str  # "CardiovascularSolver", "RenalSystem", "ConstraintEngine"

@dataclass
class EvidenceGraph:
    nodes: list[str] = field(default_factory=list)
    edges: list[EvidenceEdge] = field(default_factory=list)

    def add_causal_step(self, source: str, target: str, tick: int, ev_type: str, solver: str, confidence: float = 0.95):
        if source not in self.nodes:
            self.nodes.append(source)
        if target not in self.nodes:
            self.nodes.append(target)
        self.edges.append(EvidenceEdge(source, target, tick, ev_type, confidence, solver))
